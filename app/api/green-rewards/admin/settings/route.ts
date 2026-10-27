import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  
  // 1. Verify Admin Session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('gr_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 0.3 });
  }

  // 2. Fetch all editable settings
  const { data: settings } = await supabase.from('gr_settings').select('*');
  const { data: categories } = await supabase.from('gr_waste_categories').select('*').order('display_order');
  const { data: locations } = await supabase.from('gr_collection_locations').select('*');

  return NextResponse.json({ settings, categories, locations });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Admin check
  const { data: profile } = await supabase.from('gr_profiles').select('role').eq('id', user?.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { type, payload } = body;

  if (type === 'update_rate') {
    const { error } = await supabase
      .from('gr_waste_categories')
      .update({ points_per_kg: payload.points })
      .eq('id', payload.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (type === 'add_location') {
    const { error } = await supabase.from('gr_collection_locations').insert([payload]);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (type === 'delete_location') {
    const { error } = await supabase.from('gr_collection_locations').delete().eq('id', payload.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}