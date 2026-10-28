import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Get logged-in user session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Session expired.' }, { status: 401 });
    }

    // 2. Synchronous Admin Client
    const adminClient = createAdminClient();

    // 3. Verify Admin Role in DB or Email
    const { data: profile } = await adminClient
      .from('gr_profiles')
      .select('role, email')
      .eq('id', user.id)
      .maybeSingle();

    const isMasterAdmin = user.email?.trim().toLowerCase() === 'admin@sampige.org';
    const isAdmin = profile?.role === 'admin' || isMasterAdmin;

    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Forbidden: Admin access required.' 
      }, { status: 403 });
    }

    const { requestId, weights, notes } = await request.json();

    if (!requestId || !Array.isArray(weights)) {
      return NextResponse.json({ success: false, error: 'Invalid request payload.' }, { status: 400 });
    }

    // 4. Get Waste Categories
    const { data: categories } = await adminClient
      .from('gr_waste_categories')
      .select('*');

    let totalPointsAwarded = 0;

    // 5. Calculate total points and attempt logging
    for (const item of weights) {
      if (item.weight > 0) {
        const category = categories?.find(c => c.id === item.categoryId);
        const ptsPerKg = category?.points_per_kg || 0;
        const awardedPoints = Math.floor(item.weight * ptsPerKg);

        totalPointsAwarded += awardedPoints;

        // Try inserting into collection logs (non-fatal if table missing)
        try {
          await adminClient.from('gr_collection_logs').insert({
            request_id: requestId,
            category_id: item.categoryId,
            weight_kg: item.weight,
            points_awarded: awardedPoints
          });
        } catch (logError) {
          console.warn('Collection log non-fatal warning:', logError);
        }
      }
    }

    // 6. Update Request Status to Completed
    const { error: updateReqErr } = await adminClient
      .from('gr_collection_requests')
      .update({ status: 'completed' })
      .eq('id', requestId);

    if (updateReqErr) throw new Error(`Status update failed: ${updateReqErr.message}`);

    // 7. Update User Wallet Balance & Ledger
    const { data: pickupRequest, error: pickupErr } = await adminClient
      .from('gr_collection_requests')
      .select('user_id')
      .eq('id', requestId)
      .single();

    if (pickupErr) throw new Error(`Pickup fetch failed: ${pickupErr.message}`);

    if (pickupRequest?.user_id && totalPointsAwarded > 0) {
      const userId = pickupRequest.user_id;

      // Add ledger transaction
      const { error: txnErr } = await adminClient.from('gr_points_transactions').insert({
        user_id: userId,
        points: totalPointsAwarded,
        type: 'earn',
        description: `Waste weighing verification (#${requestId.slice(0, 8)})`
      });

      if (txnErr) throw new Error(`Ledger entry failed: ${txnErr.message}`);

      // Fetch existing balance
      const { data: existingBalance } = await adminClient
        .from('gr_points_balances')
        .select('total_points')
        .eq('user_id', userId)
        .maybeSingle();

      const newBalance = (existingBalance?.total_points || 0) + totalPointsAwarded;

      // Upsert point balance
      const { error: balErr } = await adminClient.from('gr_points_balances').upsert(
        {
          user_id: userId,
          total_points: newBalance,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      );

      if (balErr) throw new Error(`Balance update failed: ${balErr.message}`);
    }

    return NextResponse.json({ 
      success: true, 
      pointsAwarded: totalPointsAwarded 
    });

  } catch (error: any) {
    console.error('Admin Collection Processing Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}