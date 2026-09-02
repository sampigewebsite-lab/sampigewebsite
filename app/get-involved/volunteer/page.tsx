'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Heart, Loader2, CheckCircle } from 'lucide-react'

export default function VolunteerPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    area_of_interest: '',
    availability: '',
    message: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.phone || !formData.area_of_interest || !formData.availability) {
      toast.error('Please fill in all required fields.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('volunteer_submissions')
        .insert([{
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          area_of_interest: formData.area_of_interest,
          availability: formData.availability,
          message: formData.message.trim() || null,
          status: 'new'
        }])

      if (error) throw error

      setSubmitted(true)
      toast.success('Application submitted successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="bg-black min-h-screen pt-24 pb-16 flex items-center justify-center px-4">
        <div className="bg-[#1A1A1A] border border-gold-500/10 rounded-xl p-8 max-w-md text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-gold-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Application Received!</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Thank you for your interest in volunteering with Sampige Foundation. We have received your application, and our community coordinator will reach out to you shortly.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2 bg-gold-500 text-black font-semibold rounded-full hover:bg-gold-600 transition-colors text-sm"
          >
            Apply Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-black min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-gold-500 text-sm font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5">
            <Heart className="h-4 w-4 fill-gold-500" /> Join Our Team
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
            Become a Volunteer
          </h1>
          <p className="text-gray-400">
            Use your skills, passion, and time to transform lives and build sustainable futures.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Why Volunteer (2 cols) */}
          <div className="md:col-span-2 space-y-6 text-gray-300">
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gold-500/10 space-y-4">
              <h2 className="text-xl font-bold text-white">Why Volunteer?</h2>
              
              <div className="space-y-4 text-sm leading-relaxed">
                <div>
                  <h3 className="text-gold-500 font-semibold mb-1">Make a Direct Impact</h3>
                  <p className="text-gray-400">Contribute to sustainable education and healthcare projects on the ground.</p>
                </div>
                <div>
                  <h3 className="text-gold-500 font-semibold mb-1">Gain Experience</h3>
                  <p className="text-gray-400">Develop leadership, organization, and communication skills in community development.</p>
                </div>
                <div>
                  <h3 className="text-gold-500 font-semibold mb-1">Connect with Peers</h3>
                  <p className="text-gray-400">Join a supportive, passionate group of change-makers dedicated to societal improvement.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form (3 cols) */}
          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="bg-[#1A1A1A] rounded-xl p-6 md:p-8 border border-gold-500/10 space-y-4 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-2">Volunteer Application</h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                  className="w-full px-4 py-2.5 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="yourname@domain.com"
                    required
                    className="w-full px-4 py-2.5 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Contact number"
                    required
                    className="w-full px-4 py-2.5 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Area of Interest *</label>
                  <select
                    name="area_of_interest"
                    value={formData.area_of_interest}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  >
                    <option value="">Select interest</option>
                    <option value="Education">Education & Teaching</option>
                    <option value="Healthcare">Healthcare & Health Camps</option>
                    <option value="Environment">Environmental Initiatives</option>
                    <option value="Fundraising">Fundraising & Events</option>
                    <option value="Administrative">Administrative / Digital Support</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Availability *</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  >
                    <option value="">Select availability</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Flexible">Flexible Schedule</option>
                    <option value="Full-time">Full-time Support</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Message / Key Skills (Optional)</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Share any special skills or why you would like to join us"
                  className="w-full px-4 py-2.5 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors resize-none text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}