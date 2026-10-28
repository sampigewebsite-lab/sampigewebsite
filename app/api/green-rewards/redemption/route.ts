import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // Fetch user balance
  const { data: balance } = await adminClient
    .from('gr_points_balances')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  // Fetch user redemption requests
  const { data: redemptions } = await adminClient
    .from('gr_redemptions')
    .select('*, reward:gr_rewards(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch active catalog rewards
  const { data: rewards } = await adminClient
    .from('gr_rewards')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  return NextResponse.json({
    balance: balance || { current_balance: 0, total_earned: 0, total_spent: 0 },
    redemptions: redemptions || [],
    rewards: rewards || []
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createAdminClient();

  try {
    const { reward_id, payout_details } = await request.json();

    if (!reward_id) {
      return NextResponse.json({ error: 'Reward ID is required' }, { status: 400 });
    }

    // 1. Get Reward Details
    const { data: reward, error: rewardErr } = await adminClient
      .from('gr_rewards')
      .select('*')
      .eq('id', reward_id)
      .single();

    if (rewardErr || !reward) {
      return NextResponse.json({ error: 'Reward not found or inactive' }, { status: 404 });
    }

    // 2. Check Member Balance
    const { data: userBalance } = await adminClient
      .from('gr_points_balances')
      .select('current_balance, total_spent')
      .eq('user_id', user.id)
      .maybeSingle();

    const currentPts = Number(userBalance?.current_balance || 0);
    const totalSpent = Number(userBalance?.total_spent || 0);

    if (currentPts < reward.points_required) {
      return NextResponse.json({
        error: `Insufficient balance. You need ${reward.points_required} points but currently have ${currentPts}.`
      }, { status: 400 });
    }

    const newBalance = currentPts - reward.points_required;
    const newTotalSpent = totalSpent + reward.points_required;

    // 3. Generate Redemption Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const redemption_number = `RD-${dateStr}-${randomSuffix}`;

    // 4. Create Redemption Record
    const { data: redemption, error: redeemErr } = await adminClient
      .from('gr_redemptions')
      .insert([
        {
          redemption_number,
          user_id: user.id,
          reward_id: reward.id,
          points_spent: reward.points_required,
          payout_type: reward.reward_type,
          payout_details: payout_details || {},
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (redeemErr) {
      return NextResponse.json({ error: `Redemption creation failed: ${redeemErr.message}` }, { status: 400 });
    }

    // 5. Deduct Points via Server-Side Ledger Entry (Tries fallback transaction types)
    const pointsDeducted = -Math.abs(reward.points_required);
    let txnInserted = false;
    let lastTxnError: any = null;

    const candidateTypes = ['redeem', 'redemption', 'spent'];
    if (reward.reward_type === 'donation_tree') {
      candidateTypes.unshift('redeemed_donation');
    } else {
      candidateTypes.unshift('redeemed_cash');
    }

    for (const tType of candidateTypes) {
      const { error: transErr } = await adminClient
        .from('gr_points_transactions')
        .insert([
          {
            user_id: user.id,
            redemption_id: redemption.id,
            transaction_type: tType,
            type: 'redeem',
            points: pointsDeducted,
            balance_after: newBalance,
            description: `Redemption: ${reward.title_en} (${redemption_number})`,
            created_by: user.id
          }
        ]);

      if (!transErr) {
        txnInserted = true;
        break;
      }
      lastTxnError = transErr;
    }

    if (!txnInserted) {
      // Rollback redemption record if ledger insert failed
      await adminClient.from('gr_redemptions').delete().eq('id', redemption.id);
      return NextResponse.json({ error: `Transaction failed: ${lastTxnError?.message || 'Check constraint'}` }, { status: 500 });
    }

    // 6. Update cached wallet balance in gr_points_balances
    const { error: balErr } = await adminClient
      .from('gr_points_balances')
      .upsert({
        user_id: user.id,
        current_balance: newBalance,
        total_spent: newTotalSpent,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (balErr) {
      console.warn('Balance update warning:', balErr);
    }

    return NextResponse.json({ success: true, redemption, newBalance });
  } catch (err: any) {
    console.error('Redemption Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}