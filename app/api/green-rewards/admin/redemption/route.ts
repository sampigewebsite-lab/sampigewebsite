import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    const { data: profile } = await adminClient
      .from('gr_profiles')
      .select('role, email')
      .eq('id', user.id)
      .maybeSingle();

    const isMaster = user.email?.trim().toLowerCase() === 'admin@sampige.org';
    const isAdmin = profile?.role === 'admin' || isMaster;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { redemption_id, action, voucher_code, admin_notes } = await request.json();

    const { data: redemption, error: redErr } = await adminClient
      .from('gr_redemptions')
      .select('*')
      .eq('id', redemption_id)
      .single();

    if (redErr || !redemption) {
      return NextResponse.json({ error: 'Redemption request not found' }, { status: 404 });
    }

    if (action === 'completed') {
      const { error: updateErr } = await adminClient
        .from('gr_redemptions')
        .update({
          status: 'completed',
          voucher_code: voucher_code || null,
          admin_notes: admin_notes || null,
          processed_by: user.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', redemption_id);

      if (updateErr) throw new Error(`Redemption update failed: ${updateErr.message}`);

      // Status history (non-fatal if table missing)
      try {
        await adminClient.from('gr_redemption_status_history').insert({
          redemption_id,
          old_status: redemption.status,
          new_status: 'completed',
          changed_by: user.id,
          comments: admin_notes || 'Payout fulfilled by admin.'
        });
      } catch (e) {
        console.warn('Status history notice:', e);
      }

    } else if (action === 'rejected') {
      const { error: updateErr } = await adminClient
        .from('gr_redemptions')
        .update({
          status: 'rejected',
          admin_notes: admin_notes || null,
          processed_by: user.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', redemption_id);

      if (updateErr) throw new Error(`Redemption reject failed: ${updateErr.message}`);

      // Calculate refund balance
      const pointsToRefund = Math.abs(Number(redemption.points_spent || redemption.points_redeemed || 0));

      if (pointsToRefund > 0) {
        const { data: balData } = await adminClient
          .from('gr_points_balances')
          .select('current_balance, total_spent')
          .eq('user_id', redemption.user_id)
          .maybeSingle();

        const curBal = Number(balData?.current_balance || 0);
        const curSpent = Number(balData?.total_spent || 0);
        const newBal = curBal + pointsToRefund;
        const newSpent = Math.max(0, curSpent - pointsToRefund);

        // Refund Transaction to Ledger (Includes required balance_after)
        const { error: txnErr } = await adminClient.from('gr_points_transactions').insert({
          user_id: redemption.user_id,
          redemption_id: redemption.id,
          transaction_type: 'refund',
          type: 'refund',
          points: pointsToRefund,
          balance_after: newBal,
          description: `Refund for rejected redemption #${redemption.id.slice(0, 8)}`,
          created_by: user.id
        });

        if (txnErr) throw new Error(`Refund transaction failed: ${txnErr.message}`);

        // Update Wallet Balance
        const { error: balErr } = await adminClient.from('gr_points_balances').upsert({
          user_id: redemption.user_id,
          current_balance: newBal,
          total_spent: newSpent,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

        if (balErr) throw new Error(`Balance refund update failed: ${balErr.message}`);
      }

      try {
        await adminClient.from('gr_redemption_status_history').insert({
          redemption_id,
          old_status: redemption.status,
          new_status: 'rejected',
          changed_by: user.id,
          comments: admin_notes || 'Redemption rejected and points refunded.'
        });
      } catch (e) {
        console.warn('Status history notice:', e);
      }
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Admin Redemption Action Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}