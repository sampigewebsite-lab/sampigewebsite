import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('gr_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
  }

  const [stgRes, catRes, locRes] = await Promise.all([
    supabase.from('gr_settings').select('*'),
    supabase.from('gr_waste_categories').select('*').order('display_order'),
    supabase.from('gr_collection_locations').select('*').order('created_at', { ascending: false })
  ])

  return NextResponse.json({
    settings: stgRes.data || [],
    categories: catRes.data || [],
    locations: locRes.data || []
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('gr_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await request.json()
    const { type, payload } = body

    if (type === 'update_setting') {
      const { key, value } = payload
      const { error } = await supabase
        .from('gr_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (type === 'update_rate') {
      const { id, points } = payload
      const { error } = await supabase
        .from('gr_waste_categories')
        .update({ points_per_kg: points, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (type === 'add_location') {
      const { error } = await supabase.from('gr_collection_locations').insert([payload])
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (type === 'delete_location') {
      const { error } = await supabase.from('gr_collection_locations').delete().eq('id', payload.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}