'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Edit, Layout, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'

interface PageHero {
  id: string
  page_key: string
  page_label: string
  title: string
  background_image: string | null
  updated_at: string
}

export default function PageHeroesList() {
  const [heroes, setHeroes] = useState<PageHero[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchHeroes()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/admin/login')
  }

  const fetchHeroes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('page_heroes')
        .select('*')
        .order('page_label')

      if (error) throw error
      setHeroes(data || [])
    } catch (error) {
      toast.error('Failed to load page heroes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Main content — full height, scrolls independently */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-8 pt-8 md:pt-10">
          {/* Page header — always fully visible at top */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                Page Heroes
              </h1>
              <p className="text-gray-400 mt-1 text-sm">
                Control the hero banner (image, title, description, stats) for each page
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : heroes.length === 0 ? (
            <div className="text-center py-16 bg-[#1A1A1A] rounded-xl border border-gold-500/10 text-gray-500">
              <Layout className="h-12 w-12 mx-auto mb-4 text-gold-500 opacity-40" />
              <p>No page heroes found.</p>
              <p className="text-xs mt-2">Run the page_heroes SQL seed in Supabase.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
              {heroes.map((hero) => (
                <div
                  key={hero.id}
                  className="bg-[#1A1A1A] border border-gold-500/10 rounded-xl overflow-hidden hover:border-gold-500/30 transition-all group"
                >
                  <div className="relative h-40 bg-black">
                    {hero.background_image ? (
                      <img
                        src={hero.background_image}
                        alt={hero.page_label}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">
                        <Layout className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-white text-lg font-bold truncate">{hero.title}</h3>
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-gold-500 font-semibold text-sm truncate">{hero.page_label}</p>
                      <p className="text-gray-500 text-xs mt-0.5">Key: {hero.page_key}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/admin/page-heroes/edit/${hero.id}`)}
                      className="p-2 bg-gold-500/10 text-gold-500 rounded-lg hover:bg-gold-500/20 transition-colors shrink-0"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Sidebar />
    </div>
  )
}