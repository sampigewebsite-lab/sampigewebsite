'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import { ArrowRight, Loader2, Sparkles, Building2, Calendar, Home } from 'lucide-react'

export default function PoojaEnquiryForm() {
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('household')
  const [collectionPoints, setCollectionPoints] = useState<any[]>([])

  useEffect(() => {
    async function loadPoints() {
      const supabase = createClient()
      const { data } = await supabase
        .from('pooja_collection_points')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
      if (data) setCollectionPoints(data)
    }
    loadPoints()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    // We get the selected collection point text to find its ID
    const cpName = formData.get('collection_point') as string
    let cpId = null
    if (cpName && cpName !== 'Other / Not Sure' && cpName !== 'help') {
      const match = collectionPoints.find(p => p.name === cpName)
      if (match) cpId = match.id
    }

    const data = {
      full_name: formData.get('full_name') as string || formData.get('contact_person') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      participation_type: type,
      area_locality: formData.get('area_locality') as string || formData.get('venue_location') as string,
      collection_point_id: cpId,
      estimated_volume: formData.get('estimated_volume') as string,
      address: formData.get('address') as string,
      apartment_name: formData.get('apartment_name') as string,
      flats_participating: formData.get('flats_participating') ? Number(formData.get('flats_participating')) : null,
      contact_role: formData.get('contact_role') as string,
      event_date: formData.get('event_date') as string || null,
      event_type: formData.get('event_type') as string,
      message: formData.get('message') as string,
      admin_notes: cpName === 'help' ? 'Requires help finding nearest collection point.' : '',
    }

    const supabase = createClient()
    const { error } = await supabase.from('pooja_enquiries').insert([data])

    if (error) {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    } else {
      toast.success('Thank you! Redirecting to payment...')
      // Wait 1 second so they see the success message, then redirect to the pay page
      setTimeout(() => {
        window.location.href = `/pooja-to-prakruthi/pay?phone=${encodeURIComponent(data.phone)}`
      }, 1000)
    }
  }

  const types = [
    { id: 'household', label: 'Household', icon: Home },
    { id: 'apartment', label: 'Apartment', icon: Building2 },
    { id: 'temple', label: 'Temple', icon: Sparkles },
    { id: 'event', label: 'Event', icon: Calendar },
  ]

  return (
    <div id="join-form" className="bg-[#141414] rounded-3xl p-6 md:p-10 border border-[#FFB300]/20 shadow-xl w-full max-w-3xl mx-auto scroll-mt-32">
      <Toaster position="top-center" />
      
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white mb-3">Let's Give Your Flowers a Second Life.</h3>
        <p className="text-gray-400 text-sm">Tell us a little about yourself and we'll help you get started.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Type */}
        <div className="space-y-3">
          <label className="text-white font-bold block mb-4 border-b border-gray-800 pb-2">1. How would you like to participate?</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {types.map((t) => {
              const Icon = t.icon
              const isActive = type === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`py-3 px-3 flex flex-col items-center gap-2 rounded-xl border transition-all ${
                    isActive ? 'bg-[#FFB300] text-black border-[#FFB300]' : 'bg-black text-gray-400 border-gray-800 hover:border-[#FFB300]/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-bold">{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Step 2: Details */}
        <div className="space-y-4 pt-4">
          <label className="text-white font-bold block mb-4 border-b border-gray-800 pb-2">2. Your Details</label>
          
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{type === 'temple' ? 'Contact Person' : 'Full Name'} *</label>
              <input required type="text" name={type === 'temple' ? 'contact_person' : 'full_name'} className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number *</label>
              <input required type="tel" name="phone" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address (Optional)</label>
            <input type="email" name="email" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
          </div>

          {/* Conditional Fields */}
          {type === 'apartment' && (
            <>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Apartment / Community Name *</label>
                  <input required type="text" name="apartment_name" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Number of Flats *</label>
                  <input required type="number" name="flats_participating" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Are you a: *</label>
                <select required name="contact_role" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none">
                  <option value="">Select role</option>
                  <option value="Resident">Resident</option>
                  <option value="Association Member">Association Member</option>
                  <option value="Facility Manager">Facility Manager</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </>
          )}

          {type === 'temple' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Temple Name *</label>
              <input required type="text" name="address" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
            </div>
          )}

          {type === 'event' && (
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Event Type *</label>
                <select required name="event_type" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none">
                  <option value="">Select event</option>
                  <option value="Pooja">Pooja</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Festival">Festival</option>
                  <option value="Housewarming">Housewarming</option>
                  <option value="Community Event">Community Event</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Event Date *</label>
                <input required type="date" name="event_date" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
              </div>
            </div>
          )}

          {type === 'household' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Address *</label>
              <textarea required name="address" rows={2} className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
            </div>
          )}
        </div>

        {/* Step 3: Location */}
        <div className="space-y-4 pt-4">
          <label className="text-white font-bold block mb-4 border-b border-gray-800 pb-2">3. Location & Volume</label>
          
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{type === 'event' ? 'Venue / Area' : 'Your Area / Locality'} *</label>
              <input required type="text" name={type === 'event' ? 'venue_location' : 'area_locality'} className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" placeholder="e.g. Malleshwaram" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimated Flower Waste *</label>
              <select required name="estimated_volume" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none">
                <option value="">Select volume</option>
                <option value="Less than 5 kg">Less than 5 kg</option>
                <option value="5-10 kg">5–10 kg</option>
                <option value="10-25 kg">10–25 kg</option>
                <option value="25-50 kg">25–50 kg</option>
                <option value="50+ kg">50+ kg</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              Nearest Sampige Collection Point *
            </label>
            <select required name="collection_point" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none">
              <option value="">Choose a collection point</option>
              {collectionPoints.map(cp => (
                <option key={cp.id} value={cp.name}>{cp.name}</option>
              ))}
              <option value="Other / Not Sure">Other / Not Sure</option>
            </select>
            <div className="flex items-center gap-2 mt-2 ml-1">
              <input type="checkbox" id="help" name="collection_point" value="help" className="accent-[#FFB300] w-4 h-4" />
              <label htmlFor="help" className="text-xs text-gray-400 cursor-pointer hover:text-white">Help me find the nearest collection point</label>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-4">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Any Questions / Notes?</label>
          <textarea name="message" rows={2} className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
        </div>

        {/* Submit */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#FFB300] text-black font-extrabold text-sm uppercase tracking-wider rounded-xl hover:bg-[#FFCA28] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FFB300]/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Submit & Continue to Payment`}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  )
}