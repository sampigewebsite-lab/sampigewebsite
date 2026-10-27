import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check profile or recognize master admin email
  const { data: profile } = await supabase
    .from('gr_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin' || user.email === 'admin@sampige.org'

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
  }

  const adminDb = await createAdminClient()

  // Auto-promote admin@sampige.org in database if not set
  if (user.email === 'admin@sampige.org' && profile?.role !== 'admin') {
    await adminDb.from('gr_profiles').update({ role: 'admin' }).eq('id', user.id)
  }

  // Fetch each table individually to prevent PostgREST join failures
  const [stgRes, catRes, locRes, reqRes, redRes, profRes, addrRes, rewRes] = await Promise.all([
    adminDb.from('gr_settings').select('*'),
    adminDb.from('gr_waste_categories').select('*').order('display_order'),
    adminDb.from('gr_collection_locations').select('*').order('created_at', { ascending: false }),
    adminDb.from('gr_collection_requests').select('*').order('created_at', { ascending: false }),
    adminDb.from('gr_redemptions').select('*').order('created_at', { ascending: false }),
    adminDb.from('gr_profiles').select('id, full_name, phone, email'),
    adminDb.from('gr_addresses').select('*'),
    adminDb.from('gr_rewards').select('*')
  ])

  // Create lookups for reliable merging
  const profilesMap = new Map((profRes.data || []).map((p: any) => [p.id, p]))
  const addrMap = new Map((addrRes.data || []).map((a: any) => [a.id, a]))
  const rewMap = new Map((rewRes.data || []).map((r: any) => [r.id, r]))

  const pickups = (reqRes.data || []).map((req: any) => ({
    ...req,
    user: profilesMap.get(req.user_id) || { full_name: 'Member', email: '', phone: '' },
    address: addrMap.get(req.address_id) || null
  }))

  const redemptions = (redRes.data || []).map((red: any) => ({
    ...red,
    user: profilesMap.get(red.user_id) || { full_name: 'Member', email: '', phone: '' },
    reward: rewMap.get(red.reward_id) || null
  }))

  return NextResponse.json({
    settings: stgRes.data || [],
    categories: catRes.data || [],
    locations: locRes.data || [],
    pickups,
    redemptions
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('gr_profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin' || user.email === 'admin@sampige.org'

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
  }

  const adminDb = await createAdminClient()

  // Auto-promote in DB if needed
  if (user.email === 'admin@sampige.org' && profile?.role !== 'admin') {
    await adminDb.from('gr_profiles').update({ role: 'admin' }).eq('id', user.id)
  }

  try {
    const body = await request.json()
    const { type, payload } = body

    if (type === 'update_setting') {
      const { key, value } = payload
      const { error } = await adminDb
        .from('gr_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (type === 'update_rate') {
      const { id, points } = payload
      const { error } = await adminDb
        .from('gr_waste_categories')
        .update({ points_per_kg: points, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (type === 'add_location') {
      const { error } = await adminDb.from('gr_collection_locations').insert([payload])
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (type === 'delete_location') {
      const { error } = await adminDb.from('gr_collection_locations').delete().eq('id', payload.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}