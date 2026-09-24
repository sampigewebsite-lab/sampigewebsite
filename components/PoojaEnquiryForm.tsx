'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import { ArrowRight, Loader2 } from 'lucide-react'

export default function PoojaEnquiryForm() {
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('household') // Default

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      participation_type: type,
      address: formData.get('address') as string,
      apartment_name: formData.get('apartment_name') as string,
      flats_participating: formData.get('flats_participating') ? Number(formData.get('flats_participating')) : null,
      event_date: formData.get('event_date') as string || null,
      event_type: formData.get('event_type') as string,
      message: formData.get('message') as string,
    }

    const supabase = createClient()
    const { error } = await supabase.from('pooja_enquiries').insert([data])

    if (error) {
      toast.error('Something went wrong. Please try again.')
    } else {
      toast.success('Request sent successfully! Our team will contact you soon.')
      ;(e.target as HTMLFormElement).reset()
    }
    setLoading(false)
  }

  return (
    <div id="join-form" className="bg-[#141414] rounded-3xl p-6 md:p-10 border border-[#FFB300]/20 shadow-xl w-full max-w-3xl mx-auto">
      <Toaster position="top-center" />
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">Join Pooja to Prakruthi</h3>
      <p className="text-gray-400 text-sm text-center mb-8">Fill out the details below and we will help you get started.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['household', 'apartment', 'temple', 'event'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`py-2 px-3 text-sm font-semibold rounded-lg border capitalize transition-all ${
                type === t ? 'bg-[#FFB300] text-black border-[#FFB300]' : 'bg-black text-gray-400 border-gray-800 hover:border-[#FFB300]/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Common Fields */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Full Name *</label>
            <input required type="text" name="full_name" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" placeholder="Enter your name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Phone Number *</label>
            <input required type="tel" name="phone" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" placeholder="10-digit number" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-300">Email Address (Optional)</label>
          <input type="email" name="email" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" placeholder="your@email.com" />
        </div>

        {/* Conditional Fields Based on Type */}
        {type === 'household' && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Home Address & Area *</label>
            <textarea required name="address" rows={2} className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" placeholder="Full address including area (e.g. Malleshwaram)" />
          </div>
        )}

        {type === 'apartment' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Apartment Name & Area *</label>
              <input required type="text" name="apartment_name" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" placeholder="e.g. Prestige Estates, Rajajinagar" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Estimated Flats Participating</label>
              <input type="number" name="flats_participating" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" placeholder="e.g. 50" />
            </div>
          </>
        )}

        {type === 'temple' && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Temple Name & Address *</label>
            <textarea required name="address" rows={2} className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" placeholder="Temple details" />
          </div>
        )}

        {type === 'event' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Event Date *</label>
              <input required type="date" name="event_date" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Event Type *</label>
              <input required type="text" name="event_type" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" placeholder="e.g. Wedding, Housewarming" />
            </div>
          </div>
        )}

        {/* Message */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-300">Any Questions or Notes?</label>
          <textarea name="message" rows={3} className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none" placeholder="Write your message here..." />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#FFB300] text-black font-bold text-lg rounded-xl hover:bg-[#FFCA28] transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Request'}
          {!loading && <ArrowRight className="w-5 h-5" />}
        </button>
      </form>
    </div>
  )
}