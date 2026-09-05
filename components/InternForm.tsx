'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Send, Mail, Briefcase, Copy, Check } from 'lucide-react'

type Props = {
  contactEmail: string
  whyTitle?: string
  whyPoints?: string[]
  resumeTitle?: string
  resumeDescription?: string
}

export default function InternForm({
  contactEmail,
  whyTitle = 'Why Intern With Us?',
  whyPoints = [
    'Gain real-world grassroots experience',
    'Certificate of Internship upon completion',
    'Mentorship from experienced social workers',
    'Make a tangible difference in society',
  ],
  resumeTitle = 'Have a Resume Ready?',
  resumeDescription = 'Email us your resume with a short cover letter.',
}: Props) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    duration: '1 Month',
    interest: 'Field Work',
    message: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('intern_submissions').insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          college: formData.college,
          duration: formData.duration,
          interest: formData.interest,
          message: formData.message,
        },
      ])

      if (error) throw error

      toast.success('Application submitted successfully! We will contact you soon.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        college: '',
        duration: '1 Month',
        interest: 'Field Work',
        message: '',
      })
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(contactEmail)
      setCopied(true)
      toast.success('Email copied! Paste it in Gmail / Outlook and attach your resume.')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error(`Please email your resume to: ${contactEmail}`)
    }
  }

  function handleEmailResume() {
    // Always copy first (works in every browser)
    handleCopyEmail()

    // Then try opening the mail app (may depend on browser settings)
    const subject = encodeURIComponent('Internship Application - Sampige Foundation')
    const body = encodeURIComponent(
      `Hi Sampige Foundation team,\n\nI would like to apply for an internship.\n\nPlease find my resume attached.\n\nThank you.`
    )
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`
  }

  return (
    <div className="grid md:grid-cols-5 gap-12">
      {/* Left Side - Info & Email */}
      <div className="md:col-span-2 space-y-8">
        <div className="bg-[#1A1A1A] p-8 rounded-2xl border border-[#FFB300]/10">
          <h3 className="text-2xl font-bold text-white mb-4">{whyTitle}</h3>
          <ul className="space-y-4 text-gray-400">
            {(whyPoints || []).map((point, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="text-[#FFB300]">✓</span> {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-[#FFB300]/10 to-transparent p-8 rounded-2xl border border-[#FFB300]/30 text-center">
          <div className="w-16 h-16 bg-[#FFB300] rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{resumeTitle}</h3>
          <p className="text-gray-400 mb-4 text-sm">{resumeDescription}</p>

          {/* Always-visible email */}
          <p className="text-[#FFB300] font-medium text-sm mb-6 break-all">
            {contactEmail}
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleEmailResume}
              className="inline-flex items-center justify-center gap-2 bg-[#FFB300] text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              <Mail className="w-4 h-4" />
              Open Email App
            </button>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center justify-center gap-2 bg-[#1A1A1A] border border-[#FFB300]/50 text-[#FFB300] px-6 py-3 rounded-full font-medium hover:bg-[#FFB300]/10 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Email Copied!' : 'Copy Email Address'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - The Form */}
      <div className="md:col-span-3 bg-[#1A1A1A] p-8 rounded-2xl border border-[#FFB300]/10">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
          <Briefcase className="w-6 h-6 text-[#FFB300]" />
          <h2 className="text-2xl font-bold text-white">Internship Application</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email Address *</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Phone Number *</label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">College / Institution</label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none"
                placeholder="Name of your university"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Duration *</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none"
              >
                <option value="1 Month">1 Month</option>
                <option value="2 Months">2 Months</option>
                <option value="3 Months">3 Months</option>
                <option value="6+ Months">6+ Months</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Area of Interest *</label>
              <select
                value={formData.interest}
                onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none"
              >
                <option value="Field Work">Field Work & Operations</option>
                <option value="Social Media">Social Media & Marketing</option>
                <option value="Content Writing">Content Writing</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="Research & Data">Research & Data Entry</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Why do you want to intern with us? *
            </label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#FFB300] outline-none resize-none"
              placeholder="Tell us a bit about yourself and your goals..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#FFB300] text-black font-bold text-lg px-6 py-4 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}