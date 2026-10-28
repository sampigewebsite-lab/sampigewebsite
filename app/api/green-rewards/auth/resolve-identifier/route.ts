import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function normalizePhone(input: string): string[] {
  const raw = String(input || '').trim()
  const digits = raw.replace(/\D/g, '')
  const variants = new Set<string>()

  if (!digits) return []

  variants.add(digits)
  variants.add(`+${digits}`)

  // India: last 10 digits + common prefixes
  if (digits.length >= 10) {
    const last10 = digits.slice(-10)
    variants.add(last10)
    variants.add(`91${last10}`)
    variants.add(`+91${last10}`)
    variants.add(`0${last10}`)
  }

  return Array.from(variants)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const identifier = String(body?.identifier || '').trim()

    if (!identifier) {
      return NextResponse.json({ error: 'Identifier is required' }, { status: 400 })
    }

    // Email path — pass through
    if (identifier.includes('@')) {
      return NextResponse.json({ email: identifier.toLowerCase() })
    }

    const variants = normalizePhone(identifier)
    if (variants.length === 0) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Match any normalized phone variant on gr_profiles
    const orFilter = variants.map((v) => `phone.eq.${v}`).join(',')

    const { data: profile, error } = await admin
      .from('gr_profiles')
      .select('id, email, phone')
      .or(orFilter)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('resolve-identifier profile error:', error)
      return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'No account found for this phone number' },
        { status: 404 }
      )
    }

    // Prefer email stored on profile
    if (profile.email) {
      return NextResponse.json({ email: String(profile.email).toLowerCase() })
    }

    // Fallback: auth.users email via admin
    const { data: userData, error: userErr } = await admin.auth.admin.getUserById(profile.id)
    if (userErr || !userData?.user?.email) {
      return NextResponse.json(
        { error: 'Account found but email is missing. Please login with email.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ email: userData.user.email.toLowerCase() })
  } catch (err: any) {
    console.error('resolve-identifier error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}