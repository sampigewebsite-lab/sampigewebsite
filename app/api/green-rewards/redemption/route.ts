import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch user balance
  const { data: balance } = await supabase
    .from('gr_points_balances')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Fetch user redemption requests
  const { data: redemptions } = await supabase
    .from('gr_redemptions')
    .select('*, reward:gr_rewards(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch active catalog rewards
  const { data: rewards } = await supabase
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

  try {
    const { reward_id, payout_details } = await request.json();

    if (!reward_id) {
      return NextResponse.json({ error: 'Reward ID is required' }, { status: 400 });
    }

    // 1. Get Reward Details
    const { data: reward, error: rewardErr } = await supabase
      .from('gr_rewards')
      .select('*')
      .eq('id', reward_id)
      .single();

    if (rewardErr || !reward) {
      return NextResponse.json({ error: 'Reward not found or inactive' }, { status: 404 });
    }

    // 2. Check Member Balance
    const { data: userBalance } = await supabase
      .from('gr_points_balances')
      .select('current_balance')
      .eq('user_id', user.id)
      .single();

    const currentPts = userBalance?.current_balance || 0;
    if (currentPts < reward.points_required) {
      return NextResponse.json({
        error: `Insufficient balance. You need ${reward.points_required} points but currently have ${currentPts}.`
      }, { status: 400 });
    }

    // 3. Generate Redemption Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const redemption_number = `RD-${dateStr}-${randomSuffix}`;

    // 4. Create Redemption Record
    const { data: redemption, error: redeemErr } = await supabase
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
      return NextResponse.json({ error: redeemErr.message }, { status: 400 });
    }

    // 5. Deduct Points via Server-Side Ledger Entry (Negative points)
    const { error: transErr } = await supabase
      .from('gr_points_transactions')
      .insert([
        {
          user_id: user.id,
          redemption_id: redemption.id,
          transaction_type: reward.reward_type === 'donation_tree' ? 'redeemed_donation' : 'redeemed_cash',
          points: -Math.abs(reward.points_required),
          description: `Redemption: ${reward.title_en} (${redemption_number})`,
          created_by: user.id
        }
      ]);

    if (transErr) {
      // Rollback redemption if ledger insert failed
      await supabase.from('gr_redemptions').delete().eq('id', redemption.id);
      return NextResponse.json({ error: 'Transaction failed: ' + transErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, redemption });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}