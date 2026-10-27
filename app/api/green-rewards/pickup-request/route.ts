import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch user's collection requests
  const { data: requests, error } = await supabase
    .from('gr_collection_requests')
    .select(`
      *,
      address:gr_addresses(*),
      items:gr_collection_items(
        *,
        category:gr_waste_categories(*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { address_id, location_id, preferred_date, time_slot, user_notes } = body;

    if (!address_id || !preferred_date || !time_slot) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
    }

    // Generate unique request number: GR-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const request_number = `GR-${dateStr}-${randomSuffix}`;

    const { data: newRequest, error } = await supabase
      .from('gr_collection_requests')
      .insert([
        {
          request_number,
          user_id: user.id,
          address_id,
          location_id: location_id || null,
          preferred_date,
          time_slot,
          user_notes: user_notes || '',
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create status history log
    await supabase.from('gr_collection_status_history').insert([
      {
        request_id: newRequest.id,
        new_status: 'pending',
        changed_by: user.id,
        comments: 'Collection request placed by member'
      }
    ]);

    return NextResponse.json({ success: true, request: newRequest });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}