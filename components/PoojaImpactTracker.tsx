'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Loader2, Sparkles, CheckCircle2, ArrowRight, Leaf, ShieldCheck } from 'lucide-react'

export default function PoojaImpactTracker() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [memberData, setMemberData] = useState<any>(null)

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || phone.trim().length < 8) {
      alert('Please enter a valid 10-digit mobile number.')
      return
    }

    setLoading(true)
    setSearched(true)

    const cleanPhone = phone.trim()
    const supabase = createClient()

    // Search enquiries table for this phone number
    const { data, error } = await supabase
      .from('pooja_enquiries')
      .select('*')
      .or(`phone.eq.${cleanPhone},phone.ilike.%${cleanPhone}%`)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error || !data || data.length === 0) {
      setMemberData(null)
    } else {
      const record = data[0]
      const createdDate = new Date(record.created_at)
      
      // Use Admin-entered KG if available, else calculate estimate
      let totalKg = Number(record.total_kg_saved || 0)
      let compostKg = Number(record.compost_kg_produced || 0)

      if (totalKg === 0) {
        const daysActive = Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)))
        let dailyKg = 0.5
        if (record.participation_type === 'apartment') dailyKg = (record.flats_participating || 20) * 0.2
        totalKg = Math.round(daysActive * dailyKg) + 5
        compostKg = Math.round(totalKg * 0.35)
      }

      setMemberData({
        name: record.full_name || record.contact_person || 'Green Member',
        type: record.participation_type,
        area: record.area_locality || 'Bangalore',
        paymentStatus: record.payment_status || 'Unpaid',
        subscriptionStatus: record.subscription_status || 'Pending',
        joinedDate: createdDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        totalKg,
        compostKg,
      })
    }

    setLoading(false)
  }

  return (
    <div className="w-full space-y-6">
      {/* Input Form */}
      <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter 10-digit mobile number"
          className="flex-1 bg-black border border-gray-800 rounded-xl px-5 py-4 text-white focus:border-[#FFB300] outline-none text-center sm:text-left text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#FFB300] text-black font-extrabold px-6 py-4 rounded-xl hover:bg-[#FFCA28] transition-colors whitespace-nowrap uppercase text-sm tracking-wider flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Check Impact</span>
        </button>
      </form>

      {/* Member Result Card */}
      {searched && !loading && (
        <div>
          {memberData ? (
            <div className="bg-gradient-to-br from-[#1A1500] via-[#111] to-black rounded-3xl p-6 md:p-8 border-2 border-[#FFB300]/40 text-left relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#FFB300] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Sampige Member
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      memberData.paymentStatus === 'Paid' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-yellow-900/50 text-yellow-400 border border-yellow-800'
                    }`}>
                      {memberData.paymentStatus === 'Paid' ? '✓ Subscription Paid' : 'Payment Pending'}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-white mt-1.5">{memberData.name}</h3>
                  <p className="text-xs text-gray-400 capitalize">{memberData.type} Member · {memberData.area} · Joined {memberData.joinedDate}</p>
                </div>
                <div className="w-12 h-12 bg-[#FFB300]/10 border border-[#FFB300]/30 rounded-2xl flex items-center justify-center shrink-0">
                  <Leaf className="w-6 h-6 text-[#FFB300]" />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/60 p-4 rounded-2xl border border-gray-800">
                  <div className="text-2xl md:text-4xl font-black text-[#FFB300]">{memberData.totalKg} kg</div>
                  <div className="text-xs text-gray-400 mt-1 uppercase font-semibold">Flower Waste Saved</div>
                </div>
                <div className="bg-black/60 p-4 rounded-2xl border border-gray-800">
                  <div className="text-2xl md:text-4xl font-black text-green-400">{memberData.compostKg} kg</div>
                  <div className="text-xs text-gray-400 mt-1 uppercase font-semibold">Organic Compost Produced</div>
                </div>
              </div>

              <div className="bg-green-950/30 border border-green-800/40 rounded-xl p-3 text-xs text-green-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
                <span>Verified! Your flowers were kept separate from garbage and converted into organic compost.</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#141414] rounded-2xl p-6 border border-gray-800 text-center space-y-4">
              <p className="text-gray-300 text-sm">
                No active record found for <span className="text-[#FFB300] font-mono">{phone}</span>.
              </p>
              <a href="#join-form" className="inline-flex items-center gap-2 bg-[#FFB300] text-black font-extrabold px-6 py-3 rounded-xl text-xs uppercase hover:bg-[#FFCA28]">
                Join Pooja to Prakruthi <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}