'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [pathname])

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold-500 text-xl font-medium">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}