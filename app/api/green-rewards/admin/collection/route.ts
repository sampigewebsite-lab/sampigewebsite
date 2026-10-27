import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Admin Verification
  const { data: profile } = await supabase.from('gr_profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
  }

  try {
    const { request_id, items, admin_notes } = await request.json();
    // items is an array of { category_id, weight_kg, points_per_kg }

    if (!request_id || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid collection data' }, { status: 400 });
    }

    // 1. Fetch Request
    const { data: reqData, error: reqErr } = await supabase
      .from('gr_collection_requests')
      .select('*')
      .eq('id', request_id)
      .single();

    if (reqErr || !reqData) {
      return NextResponse.json({ error: 'Collection request not found' }, { status: 404 });
    }

    // 2. Clear old items if re-verifying
    await supabase.from('gr_collection_items').delete().eq('request_id', request_id);

    let totalWeight = 0;
    let totalPoints = 0;

    const lineItemsToInsert = items.map((item: any) => {
      const weight = parseFloat(item.weight_kg) || 0;
      const rate = parseFloat(item.points_per_kg) || 0;
      const calculatedPoints = Math.round(weight * rate * 100) / 100;

      totalWeight += weight;
      totalPoints += calculatedPoints;

      return {
        request_id,
        category_id: item.category_id,
        weight_kg: weight,
        points_per_kg: rate,
        calculated_points: calculatedPoints
      };
    });

    // 3. Insert Verified Items
    const { error: itemErr } = await supabase.from('gr_collection_items').insert(lineItemsToInsert);
    if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 400 });

    // 4. Update Collection Request Status to 'verified'
    await supabase
      .from('gr_collection_requests')
      .update({
        status: 'verified',
        total_weight_kg: totalWeight,
        total_points_awarded: totalPoints,
        admin_notes,
        verified_at: new Date().toISOString()
      })
      .eq('id', request_id);

    // 5. Award Points to User Balance via Ledger
    await supabase.from('gr_points_transactions').insert([
      {
        user_id: reqData.user_id,
        request_id: request_id,
        transaction_type: 'earned_collection',
        points: totalPoints,
        description: `Earned from Collection #${reqData.request_number} (${totalWeight} kg)`,
        created_by: user.id
      }
    ]);

    // 6. Log Status History
    await supabase.from('gr_collection_status_history').insert([
      {
        request_id,
        old_status: reqData.status,
        new_status: 'verified',
        changed_by: user.id,
        comments: `Verified ${totalWeight} kg waste. Awarded ${totalPoints} points.`
      }
    ]);

    return NextResponse.json({ success: true, totalWeight, totalPoints });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}