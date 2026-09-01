import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get environment variables with validation
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If environment variables are missing, log error and continue
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables in middleware')
    // Allow the request to continue but user won't be able to authenticate
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If user is not logged in and trying to access admin routes (except login)
    if (!user && request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    // If user is logged in and trying to access login page
    if (user && request.nextUrl.pathname === '/admin/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    // Allow the request to continue even if auth fails
    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}