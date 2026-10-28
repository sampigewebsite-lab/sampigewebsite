import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const adminClient = createAdminClient();

  try {
    const [
      { data: settings },
      { data: locations },
      { data: categories },
      { data: rawPickups },
      { data: rawRedemptions },
      { data: profiles }
    ] = await Promise.all([
      adminClient.from('gr_settings').select('*').single(),
      adminClient.from('gr_collection_locations').select('*').order('created_at', { ascending: true }),
      adminClient.from('gr_waste_categories').select('*').order('points_per_kg', { ascending: false }),
      adminClient.from('gr_collection_requests').select('*').order('created_at', { ascending: false }),
      adminClient.from('gr_redemptions').select('*').order('created_at', { ascending: false }),
      adminClient.from('gr_profiles').select('id, full_name, phone, role')
    ]);

    // Manual relation mapping to prevent PostgREST join failures
    const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
    const locationsMap = new Map(locations?.map(l => [l.id, l]) || []);

    const pickups = (rawPickups || []).map(p => ({
      ...p,
      user: profilesMap.get(p.user_id) || { full_name: 'Member', phone: '' },
      location: locationsMap.get(p.location_id) || null
    }));

    const redemptions = (rawRedemptions || []).map(r => ({
      ...r,
      user: profilesMap.get(r.user_id) || { full_name: 'Member', phone: '' }
    }));

    return NextResponse.json({
      success: true,
      settings: settings || null,
      locations: locations || [],
      categories: categories || [],
      pickups,
      redemptions
    });

  } catch (error: any) {
    console.error("Admin Settings GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { action, id, data } = await request.json();

    if (action === 'save_settings') {
      const { data: updatedSettings, error } = await adminClient
        .from('gr_settings')
        .upsert({
          id: id || undefined,
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
          id: id || undefined,
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
          id: id || undefined,
          ...data,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, category: cat });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error: any) {
    console.error("Admin Settings POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}