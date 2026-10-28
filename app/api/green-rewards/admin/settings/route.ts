import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

function pickPhone(p: any): string {
  if (!p) return '';
  const raw =
    p.phone ||
    p.phone_number ||
    p.mobile ||
    p.mobile_number ||
    p.whatsapp ||
    p.whatsapp_number ||
    '';
  return String(raw).trim();
}

function pickUpi(details: any): string {
  if (!details || typeof details !== 'object') return '';
  return String(
    details.upi_id ||
      details.upiId ||
      details.upi ||
      details.upi_address ||
      details.vpa ||
      details.payee_vpa ||
      ''
  ).trim();
}

function pickAmount(r: any, rate: number): number | null {
  const details = r.payout_details || {};
  const fromDetails = Number(
    details.amount_inr ?? details.amount ?? details.value_inr ?? details.payout_amount ?? NaN
  );
  if (!Number.isNaN(fromDetails) && fromDetails > 0) return fromDetails;

  const reward = r.reward || {};
  const fromReward = Number(
    reward.value_inr ??
      reward.cash_value ??
      reward.amount_inr ??
      reward.reward_value ??
      reward.inr_value ??
      NaN
  );
  if (!Number.isNaN(fromReward) && fromReward > 0) return fromReward;

  // Derive from points × conversion rate (e.g. 500 pts × 0.10 = ₹50)
  const pts = Number(r.points_spent ?? r.points_redeemed ?? 0);
  if (pts > 0 && rate > 0) return Math.round(pts * rate * 100) / 100;

  return null;
}

export async function GET() {
  try {
    const adminClient = createAdminClient();

    const [
      { data: settings },
      { data: locations },
      { data: categories },
      { data: rawPickups },
      { data: rawRedemptions },
      { data: profiles },
      { data: rewards }
    ] = await Promise.all([
      adminClient.from('gr_settings').select('*').maybeSingle(),
      adminClient.from('gr_collection_locations').select('*').order('created_at', { ascending: true }),
      adminClient.from('gr_waste_categories').select('*').order('points_per_kg', { ascending: false }),
      adminClient.from('gr_collection_requests').select('*').order('created_at', { ascending: false }),
      adminClient
        .from('gr_redemptions')
        .select('*, reward:gr_rewards(*)')
        .order('created_at', { ascending: false }),
      adminClient.from('gr_profiles').select('*'),
      adminClient.from('gr_rewards').select('*')
    ]);

    const rate = Number(settings?.points_to_rupee_rate ?? 0.1) || 0.1;

    const profilesMap = new Map(
      (profiles || []).map((p: any) => {
        const phoneNum = pickPhone(p);
        return [
          p.id,
          {
            ...p,
            full_name: p.full_name || p.name || 'Member',
            phone: phoneNum
          }
        ];
      })
    );

    const locationsMap = new Map((locations || []).map((l: any) => [l.id, l]));
    const rewardsMap = new Map((rewards || []).map((rw: any) => [rw.id, rw]));

    const pickups = (rawPickups || []).map((p: any) => ({
      ...p,
      status: (p.status || '').toLowerCase(),
      scheduled_date: p.preferred_date || p.scheduled_date || null,
      scheduled_slot: p.time_slot || p.scheduled_slot || null,
      user: profilesMap.get(p.user_id) || { full_name: 'Member', phone: '' },
      location: locationsMap.get(p.location_id) || null
    }));

    const redemptions = (rawRedemptions || []).map((r: any) => {
      const reward = r.reward || rewardsMap.get(r.reward_id) || null;
      const details =
        typeof r.payout_details === 'string'
          ? (() => {
              try {
                return JSON.parse(r.payout_details);
              } catch {
                return {};
              }
            })()
          : r.payout_details || {};

      const user = profilesMap.get(r.user_id) || { full_name: 'Member', phone: '' };
      const points = Number(r.points_spent ?? r.points_redeemed ?? 0) || 0;
      const amount = pickAmount({ ...r, reward, payout_details: details }, rate);
      const upi = pickUpi(details);
      const rewardTitle =
        reward?.title_en ||
        reward?.name_en ||
        reward?.title ||
        reward?.name ||
        r.payout_type ||
        'Reward';
      const rewardType = reward?.reward_type || r.payout_type || details.reward_type || '';

      return {
        ...r,
        status: (r.status || '').toLowerCase(),
        points_spent: points,
        points_redeemed: points, // back-compat for UI
        amount_inr: amount,
        upi_id: upi,
        payout_details: details,
        reward,
        reward_title: rewardTitle,
        reward_type: rewardType,
        user
      };
    });

    return NextResponse.json({
      success: true,
      settings: settings || null,
      locations: locations || [],
      categories: categories || [],
      rewards: rewards || [],
      pickups,
      redemptions
    });
  } catch (error: any) {
    console.error('Admin Settings GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch admin settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminClient = createAdminClient();
    const { action, id, data } = await request.json();

    if (action === 'save_settings') {
      const { data: updatedSettings, error } = await adminClient
        .from('gr_settings')
        .upsert({
          ...(id ? { id } : {}),
          ...data,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, settings: updatedSettings });
    }

    if (action === 'save_location') {
      const { data: loc, error } = await adminClient
        .from('gr_collection_locations')
        .upsert({
          ...(id ? { id } : {}),
          ...data,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, location: loc });
    }

    if (action === 'save_category') {
      const { data: cat, error } = await adminClient
        .from('gr_waste_categories')
        .upsert({
          ...(id ? { id } : {}),
          ...data,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, category: cat });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin Settings POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}