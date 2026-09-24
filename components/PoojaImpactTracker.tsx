'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Leaf, Loader2, Recycle, Sprout, Users } from 'lucide-react'
import Link from 'next/link'

export default function PoojaImpactTracker() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([
    { value: '—', label: 'kg Flower Waste Collected', icon: Recycle },
    { value: '—', label: 'Households Participating', icon: Users },
    { value: '—', label: 'Collections Completed', icon: Leaf },
    { value: '—', label: 'kg Compost Produced', icon: Sprout },
  ])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('pooja_to_prakruthi_content')
        .select('impact_stats')
        .eq('id', 1)
        .single()

      const raw = data?.impact_stats
      if (Array.isArray(raw) && raw.length > 0) {
        const icons = [Recycle, Users, Leaf, Sprout]
        setStats(
          raw.slice(0, 4).map((s: any, i: number) => ({
            value: s.value || '—',
            label: s.label || 'Impact',
            icon: icons[i] || Leaf,
          }))
        )
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 text-[#FFB300] animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <p className="text-gray-400 text-sm text-center">
        Shared impact of the entire Pooja to Prakruthi community — same for every visitor.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="bg-black/60 p-4 rounded-2xl border border-gray-800 text-center">
              <Icon className="w-5 h-5 text-[#FFB300] mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-black text-[#FFB300]">{s.value}</div>
              <div className="text-[10px] md:text-xs text-gray-400 mt-1 uppercase font-semibold leading-tight">
                {s.label}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-gray-500">
        Numbers are updated by Sampige from real collections.{' '}
        <Link href="#join-form" className="text-[#FFB300] hover:underline">
          Join the programme
        </Link>
      </p>
    </div>
  )
}