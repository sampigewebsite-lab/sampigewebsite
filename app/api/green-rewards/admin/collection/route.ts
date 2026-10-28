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

    // 2. Synchronous admin client instance (DO NOT await createAdminClient)
    const adminClient = createAdminClient();

    // 3. Verify Admin Role in DB or Email
    const { data: profile } = await adminClient
      .from('gr_profiles')
      .select('role, email')
      .eq('id', user.id)
      .maybeSingle();

    const isMasterAdminEmail = user.email?.trim().toLowerCase() === 'admin@sampige.org';
    const hasAdminRole = profile?.role === 'admin';
    const isAdmin = hasAdminRole || isMasterAdminEmail;

    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: `Forbidden: Admin access required. (Logged in as: ${user.email}, Role: ${profile?.role || 'none'})` 
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

    // 5. Insert collection log for each non-zero weight
    for (const item of weights) {
      if (item.weight > 0) {
        const category = categories?.find(c => c.id === item.categoryId);
        const ptsPerKg = category?.points_per_kg || 0;
        const awardedPoints = Math.floor(item.weight * ptsPerKg);

        totalPointsAwarded += awardedPoints;

        await adminClient.from('gr_collection_logs').insert({
          request_id: requestId,
          category_id: item.categoryId,
          weight_kg: item.weight,
          points_awarded: awardedPoints
        });
      }
    }

    // 6. Update Request Status to Completed
    await adminClient
      .from('gr_collection_requests')
      .update({ 
        status: 'completed',
        collected_at: new Date().toISOString(),
        admin_notes: notes || null
      })
      .eq('id', requestId);

    // 7. Update User Wallet Balance
    const { data: pickupRequest } = await adminClient
      .from('gr_collection_requests')
      .select('user_id')
      .eq('id', requestId)
      .single();

    if (pickupRequest?.user_id && totalPointsAwarded > 0) {
      // Add ledger transaction
      await adminClient.from('gr_points_transactions').insert({
        user_id: pickupRequest.user_id,
        points: totalPointsAwarded,
        type: 'earn',
        description: `Waste weighing verification (#${requestId.slice(0, 8)})`
      });

      // Fetch existing balance
      const { data: existingBalance } = await adminClient
        .from('gr_points_balances')
        .select('total_points')
        .eq('user_id', pickupRequest.user_id)
        .maybeSingle();

      const newBalance = (existingBalance?.total_points || 0) + totalPointsAwarded;

      // Upsert point balance
      await adminClient.from('gr_points_balances').upsert({
        user_id: pickupRequest.user_id,
        total_points: newBalance,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
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


