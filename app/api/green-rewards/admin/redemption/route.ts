import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('gr_profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { redemption_id, action, voucher_code, admin_notes } = await request.json();
    // action: 'completed' | 'rejected'

    const { data: redemption, error: redErr } = await supabase
      .from('gr_redemptions')
      .select('*')
      .eq('id', redemption_id)
      .single();

    if (redErr || !redemption) {
      return NextResponse.json({ error: 'Redemption request not found' }, { status: 404 });
    }

    if (action === 'completed') {
      await supabase
        .from('gr_redemptions')
        .update({
          status: 'completed',
          voucher_code: voucher_code || null,
          admin_notes,
          processed_by: user.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', redemption_id);

      // Status history
      await supabase.from('gr_redemption_status_history').insert([
        {
          redemption_id,
          old_status: redemption.status,
          new_status: 'completed',
          changed_by: user.id,
          comments: admin_notes || 'Payout fulfilled by admin.'
        }
      ]);
    } else if (action === 'rejected') {
      await supabase
        .from('gr_redemptions')
        .update({
          status: 'rejected',
          admin_notes,
          processed_by: user.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', redemption_id);

      // Refund Points to User Ledger
      await supabase.from('gr_points_transactions').insert([
        {
          user_id: redemption.user_id,
          redemption_id: redemption.id,
          transaction_type: 'refund',
          points: Math.abs(redemption.points_spent),
          description: `Refund for rejected redemption #${redemption.redemption_number}`,
          created_by: user.id
        }
      ]);

      await supabase.from('gr_redemption_status_history').insert([
        {
          redemption_id,
          old_status: redemption.status,
          new_status: 'rejected',
          changed_by: user.id,
          comments: admin_notes || 'Redemption rejected and points refunded.'
        }
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}