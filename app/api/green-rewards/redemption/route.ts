import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/** Pull ₹ amount from titles like "Sampige Store Discount Voucher ₹100" */
function extractAmountFromTitle(title: string): number | null {
  if (!title) return null;
  const match =
    title.match(/(?:₹|Rs\.?|INR|\$)\s?(\d+(?:\.\d+)?)/i) ||
    title.match(/(\d+)\s?(?:rupees|rs|inr|off)/i);
  return match ? parseFloat(match[1]) : null;
}

function rewardTitleOf(reward: any): string {
  return (
    reward?.title_en ||
    reward?.title ||
    reward?.name_en ||
    reward?.name ||
    'Reward'
  );
}

function rewardTypeOf(reward: any): string {
  return reward?.reward_type || reward?.type || 'voucher';
}

/** Face value: catalog fields first, then ₹ in title — NEVER points×rate here */
function rewardFaceValueInr(reward: any): number {
  const catalog =
    reward?.monetary_value_inr ??
    reward?.value_inr ??
    reward?.value ??
    reward?.amount_inr ??
    null;

  if (catalog != null && catalog !== '' && !Number.isNaN(Number(catalog))) {
    return Number(catalog);
  }

  const fromTitle = extractAmountFromTitle(rewardTitleOf(reward));
  return fromTitle != null ? fromTitle : 0;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  // Fetch user redemption requests (join reward)
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

  // Normalize for member UI (title/value fallbacks)
  const normalizedRedemptions = (redemptions || []).map((r: any) => {
    const reward = r.reward || {};
    const title =
      r.reward_title ||
      rewardTitleOf(reward) ||
      'Reward';
    const amount =
      r.amount_inr ??
      r.monetary_value_inr ??
      rewardFaceValueInr(reward);

    return {
      ...r,
      reward_title: title,
      amount_inr: amount,
      reward: reward
        ? {
            ...reward,
            title_en: reward.title_en || reward.title || title,
            title: reward.title || reward.title_en || title,
            monetary_value_inr:
              reward.monetary_value_inr ?? reward.value_inr ?? amount,
            value_inr: reward.value_inr ?? reward.monetary_value_inr ?? amount,
          }
        : reward,
    };
  });

  const normalizedRewards = (rewards || []).map((rw: any) => {
    const title = rewardTitleOf(rw);
    const face = rewardFaceValueInr(rw);
    return {
      ...rw,
      title_en: rw.title_en || rw.title || title,
      title: rw.title || rw.title_en || title,
      description_en: rw.description_en || rw.description || '',
      description_kn: rw.description_kn || '',
      monetary_value_inr: rw.monetary_value_inr ?? rw.value_inr ?? face,
      value_inr: rw.value_inr ?? rw.monetary_value_inr ?? face,
      reward_type: rewardTypeOf(rw),
    };
  });

  return NextResponse.json({
    balance: balance || { current_balance: 0, total_earned: 0, total_spent: 0 },
    redemptions: normalizedRedemptions,
    rewards: normalizedRewards,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createAdminClient();

  try {
    const body = await request.json();
    const reward_id = body.reward_id;
    const payout_details_in = body.payout_details || {};

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

    if (reward.is_active === false) {
      return NextResponse.json({ error: 'Reward is not active' }, { status: 400 });
    }

    const pointsRequired = Number(reward.points_required || 0);
    const title = rewardTitleOf(reward);
    const rewardType = rewardTypeOf(reward);
    const amountInr = rewardFaceValueInr(reward);

    // UPI extraction (member modal sends payout_details.upi_id)
    const upiId = String(
      payout_details_in.upi_id ||
        payout_details_in.upi ||
        payout_details_in.upiId ||
        body.upi_id ||
        ''
    ).trim();

    const needsUpi =
      rewardType === 'upi' ||
      rewardType === 'cashback' ||
      title.toLowerCase().includes('upi') ||
      title.toLowerCase().includes('cashback');

    if (needsUpi && !upiId) {
      return NextResponse.json({ error: 'Please enter your UPI ID' }, { status: 400 });
    }

    // Snapshot everything admin needs inside payout_details (always works even if extra columns missing)
    const payout_details = {
      ...payout_details_in,
      upi_id: upiId || null,
      upi: upiId || null,
      tree_certificate_name: payout_details_in.tree_certificate_name || null,
      reward_title: title,
      reward_type: rewardType,
      amount_inr: amountInr,
      monetary_value_inr: amountInr,
      value_inr: amountInr,
      points_required: pointsRequired,
    };

    // 2. Check Member Balance
    const { data: userBalance } = await adminClient
      .from('gr_points_balances')
      .select('current_balance, total_spent, total_earned')
      .eq('user_id', user.id)
      .maybeSingle();

    const currentPts = Number(userBalance?.current_balance || 0);
    const totalSpent = Number(userBalance?.total_spent || 0);

    if (currentPts < pointsRequired) {
      return NextResponse.json(
        {
          error: `Insufficient balance. You need ${pointsRequired} points but currently have ${currentPts}.`,
        },
        { status: 400 }
      );
    }

    const newBalance = currentPts - pointsRequired;
    const newTotalSpent = totalSpent + pointsRequired;

    // 3. Generate Redemption Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const redemption_number = `RD-${dateStr}-${randomSuffix}`;

    // 4. Create Redemption Record (rich payload first, minimal fallback)
    const richInsert: Record<string, any> = {
      redemption_number,
      user_id: user.id,
      reward_id: reward.id,
      points_spent: pointsRequired,
      points_used: pointsRequired,
      payout_type: rewardType,
      payout_details,
      status: 'pending',
      // snapshots for admin (if columns exist)
      reward_title: title,
      reward_type: rewardType,
      amount_inr: amountInr,
      monetary_value_inr: amountInr,
      upi_id: upiId || null,
      voucher_code: payout_details_in.voucher_code || payout_details_in.code || null,
    };

    let redemption: any = null;
    let redeemErr: any = null;

    {
      const res = await adminClient
        .from('gr_redemptions')
        .insert([richInsert])
        .select()
        .single();
      redemption = res.data;
      redeemErr = res.error;
    }

    // If unknown columns (amount_inr, upi_id, etc.) — retry core schema only
    if (redeemErr) {
      console.warn('Redemption rich insert failed, retrying minimal:', redeemErr.message);
      const minimalInsert = {
        redemption_number,
        user_id: user.id,
        reward_id: reward.id,
        points_spent: pointsRequired,
        payout_type: rewardType,
        payout_details, // UPI + face value live here for admin
        status: 'pending',
      };
      const res2 = await adminClient
        .from('gr_redemptions')
        .insert([minimalInsert])
        .select()
        .single();
      redemption = res2.data;
      redeemErr = res2.error;
    }

    if (redeemErr || !redemption) {
      return NextResponse.json(
        { error: `Redemption creation failed: ${redeemErr?.message || 'unknown'}` },
        { status: 400 }
      );
    }

    // 5. Deduct Points via Server-Side Ledger Entry (tries fallback transaction types)
    const pointsDeducted = -Math.abs(pointsRequired);
    let txnInserted = false;
    let lastTxnError: any = null;

    const candidateTypes = ['redeem', 'redemption', 'spent'];
    if (rewardType === 'donation_tree') {
      candidateTypes.unshift('redeemed_donation');
    } else {
      candidateTypes.unshift('redeemed_cash');
    }

    for (const tType of candidateTypes) {
      const { error: transErr } = await adminClient.from('gr_points_transactions').insert([
        {
          user_id: user.id,
          redemption_id: redemption.id,
          transaction_type: tType,
          type: 'redeem',
          points: pointsDeducted,
          balance_after: newBalance,
          description: `Redemption: ${title} (${redemption_number}) · ₹${amountInr}`,
          created_by: user.id,
        },
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
      return NextResponse.json(
        { error: `Transaction failed: ${lastTxnError?.message || 'Check constraint'}` },
        { status: 500 }
      );
    }

    // 6. Update cached wallet balance in gr_points_balances
    const { error: balErr } = await adminClient.from('gr_points_balances').upsert(
      {
        user_id: user.id,
        current_balance: newBalance,
        total_spent: newTotalSpent,
        total_earned: Number(userBalance?.total_earned || 0),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (balErr) {
      console.warn('Balance update warning:', balErr);
    }

    return NextResponse.json({
      success: true,
      redemption,
      newBalance,
    });
  } catch (err: any) {
    console.error('Redemption Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}