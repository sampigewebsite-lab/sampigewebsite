'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'  // Use client, not server

export default function Success() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()  // No await needed

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/login')
        return
      }
      setUser(user)
    }
    getUser()
  }, [router, supabase])

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold text-gold-500 mb-4">✅ Login Successful!</h1>
      <p className="text-gray-300">You are logged in as: <span className="text-white font-bold">{user.email}</span></p>
      <div className="mt-4 p-4 bg-[#1A1A1A] rounded-lg border border-gold-500/10">
        <p className="text-sm text-gray-400">User ID: {user.id}</p>
      </div>
      <button
        onClick={() => router.push('/admin/dashboard')}
        className="mt-6 px-6 py-3 bg-gold-500 text-black font-bold rounded-lg hover:bg-gold-600"
      >
        Go to Dashboard
      </button>
    </div>
  )
}