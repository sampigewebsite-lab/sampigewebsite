import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Session expired.' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    const { data: profile } = await adminClient
      .from('gr_profiles')
      .select('role, email')
      .eq('id', user.id)
      .maybeSingle();

    const isMasterAdmin = user.email?.trim().toLowerCase() === 'admin@sampige.org';
    const isAdmin = profile?.role === 'admin' || isMasterAdmin;

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    const { requestId, weights, notes } = await request.json();

    if (!requestId || !Array.isArray(weights)) {
      return NextResponse.json({ success: false, error: 'Invalid request payload.' }, { status: 400 });
    }

    // 1. Get Waste Categories
    const { data: categories } = await adminClient.from('gr_waste_categories').select('*');

    let totalPointsAwarded = 0;
    let totalWeightKg = 0;

    // 2. Insert into native gr_collection_items table
    for (const item of weights) {
      if (item.weight > 0) {
        const category = categories?.find(c => c.id === item.categoryId);
        const ptsPerKg = category?.points_per_kg || 0;
        const awardedPoints = Math.floor(item.weight * ptsPerKg);

        totalPointsAwarded += awardedPoints;
        totalWeightKg += item.weight;

        try {
          await adminClient.from('gr_collection_items').insert({
            request_id: requestId,
            category_id: item.categoryId,
            weight_kg: item.weight,
            points_per_kg: ptsPerKg,
            calculated_points: awardedPoints
          });
        } catch (e) {
          console.warn('Item insert warning:', e);
        }
      }
    }

    // 3. Get User ID from request
    const { data: pickupRequest, error: pickupErr } = await adminClient
      .from('gr_collection_requests')
      .select('user_id')
      .eq('id', requestId)
      .single();

    if (pickupErr) throw new Error(`Pickup fetch failed: ${pickupErr.message}`);

    if (pickupRequest?.user_id && totalPointsAwarded > 0) {
      const userId = pickupRequest.user_id;

      // 4. Fetch current balance
      const { data: balanceData } = await adminClient
        .from('gr_points_balances')
        .select('current_balance, total_earned')
        .eq('user_id', userId)
        .maybeSingle();

      const currentBalance = Number(balanceData?.current_balance || 0);
      const totalEarned = Number(balanceData?.total_earned || 0);
      
      const newBalance = currentBalance + totalPointsAwarded;
      const newTotalEarned = totalEarned + totalPointsAwarded;

      // 5. Insert Transaction (tries 'earn', then 'EARN', then 'collection')
      let txnInserted = false;
      let lastTxnError: any = null;

      for (const typeVal of ['earn', 'EARN', 'collection']) {
        const { error: txnErr } = await adminClient.from('gr_points_transactions').insert({
          user_id: userId,
          request_id: requestId,
          transaction_type: typeVal,
          type: typeVal,
          points: totalPointsAwarded,
          balance_after: newBalance,
          description: `Waste weighing verification (#${requestId.slice(0, 8)})`
        });

        if (!txnErr) {
          txnInserted = true;
          break;
        }
        lastTxnError = txnErr;
      }

      if (!txnInserted && lastTxnError) {
        throw new Error(`Transaction failed: ${lastTxnError.message}`);
      }

      // 6. Upsert Balances
      const { error: balErr } = await adminClient.from('gr_points_balances').upsert({
        user_id: userId,
        current_balance: newBalance,
        total_earned: newTotalEarned,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

      if (balErr) throw new Error(`Balance update failed: ${balErr.message}`);
    }

    // 7. Update Request Status to Completed
    let { error: updateReqErr } = await adminClient
      .from('gr_collection_requests')
      .update({ 
        status: 'completed',
        total_weight_kg: totalWeightKg,
        total_points_awarded: totalPointsAwarded,
        admin_notes: notes || null,
        collected_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateReqErr) {
      const fallback = await adminClient
        .from('gr_collection_requests')
        .update({ 
          status: 'COMPLETED',
          total_weight_kg: totalWeightKg,
          total_points_awarded: totalPointsAwarded,
          admin_notes: notes || null,
          collected_at: new Date().toISOString()
        })
        .eq('id', requestId);
      updateReqErr = fallback.error;
    }

    if (updateReqErr) throw new Error(`Status update failed: ${updateReqErr.message}`);

    return NextResponse.json({ 
      success: true, 
      pointsAwarded: totalPointsAwarded 
    });

  } catch (error: any) {
    console.error('Admin Collection Processing Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}