'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { CheckCircle2 } from 'lucide-react'

const supabase = createClient()

interface ActivityOption {
  id: string
  title: string
}

interface PillarOption {
  id: string
  name: string
}

export default function CsrEnquiryForm({ activities, pillars }: { activities: ActivityOption[]; pillars: PillarOption[] }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    company_name: '',
    company_website: '',
    contact_name: '',
    designation: '',
    email: '',
    phone: '',
    csr_pillar: '',
    preferred_activity: '',
    employee_count: '',
    preferred_date: '',
    alternative_date: '',
    duration: '',
    location: '',
    message: '',
    source: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.company_name.trim() || !form.contact_name.trim() || !form.email.trim() || !form.phone.trim() || !form.employee_count) {
      toast.error('Please complete all required fields (*).')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('csr_enquiries').insert({
      ...form,
      preferred_date: form.preferred_date || null,
      alternative_date: form.alternative_date || null,
      status: 'New'
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    toast.success('Your CSR request has been recorded!')
  }

  if (success) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="w-16 h-16 bg-gold-500/10 rounded-full border border-gold-500/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-gold-500" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Thank You For Reaching Out</h3>
          <p className="text-[#B0B0B0] text-sm max-w-md mx-auto">
            Your CSR partnership request has been safely logged in our central database. Our corporate relations lead will evaluate the details and contact you within 24 business hours.
          </p>
        </div>
        <button
          onClick={() => {
            setSuccess(false)
            setForm({
              company_name: '',
              company_website: '',
              contact_name: '',
              designation: '',
              email: '',
              phone: '',
              csr_pillar: '',
              preferred_activity: '',
              employee_count: '',
              preferred_date: '',
              alternative_date: '',
              duration: '',
              location: '',
              message: '',
              source: '',
            })
          }}
          className="bg-gold-500 text-black font-bold px-6 py-3 rounded-full text-xs uppercase hover:scale-105 transition-transform"
        >
          Submit Another Request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Info */}
        <div>
          <label className="text-xs font-bold uppercase text-[#B0B0B0] mb-2 block">Company Name *</label>
          <input
            type="text"
            required
            value={form.company_name}
            onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
            className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-gold-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-[#B0B0B0] mb-2 block">Company Website</label>
          <input
            type="url"
            placeholder="https://company.com"
            value={form.company_website}
            onChange={(e) => setForm((f) => ({ ...f, company_website: e.target.value }))}
            className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-gold-500 outline-none"
          />
        </div>

        {/* Contact Info */}
        <div>
          <label className="text-xs font-bold uppercase text-[#B0B0B0] mb-2 block">Contact Person Name *</label>
          <input
            type="text"
            required
            value={form.contact_name}
            onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
            className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-gold-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-[#B0B0B0] mb-2 block">Designation</label>
          <input
            type="text"
            placeholder="e.g. CSR Manager, HR Director"
            value={form.designation}
            onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
            className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-gold-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-[#B0B0B0] mb-2 block">Business Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-gold-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-[#B0B0B0] mb-2 block">Phone Number *</label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-gold-500 outline-none"
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="text-xs font-bold uppercase text-[#B0B0B0] mb-2 block">Preferred CSR Pillar</label>
          <select
            value={form.csr_pillar}
            onChange={(e) => setForm((f) => ({ ...f, csr_pillar: e.target.value }))}
            className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3.5 text-sm focus:border-gold-500 outline-none"
          >
            <option value="">Select a pillar...</option>
            {pillars.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
            <option value="Not Sure">Need Guidance / Not Sure</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-[#B0B0B0] mb-2 block">Preferred Activity Format</label>
          <select
            value={form.preferred_activity}
            onChange={(e) => setForm((f) => ({ ...f, preferred_activity: e.target.value }))}
            className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3.5 text-sm focus:border-gold-500 outline-none"
          >
            <option value="">Select a format...</option>
            {activities.map((a) => (
              <option key={a.id} value={a.title}>
                {a.title}
              </option>
            ))}
            <option value="Multiple">Multiple Activities / Custom</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-[#B0B0B0] mb-2 block">Estimated Number of Employees *</label>
          <select
            required
            value={form.employee_count}
            onChange={(e) => setForm((f) => ({ ...f, employee_count: e.target.value }))}
            className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3.5 text-sm focus:border-gold-500 outline-none"
          >
            <option value="">Select range...</option>
            <option value="10–20">10–20 employees</option>
            <option value="20–50">20–50 employees</option>
            <option value="50–100">50–100 employees</option>
            <option value="100–250">100–250 employees</option>
            <option value="250–500">250–500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-[#B0B0B0] mb-2 block">Preferred Location (e.g. Bengaluru)</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-gold-500 outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-[#B0B0B0] mb-2 block">Preferred Implementation Date</label>
          <input
            type="date"
            value={form.preferred_date}
            onChange={(e) => setForm((f) => ({ ...f, preferred_date: e.target.value }))}
            className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-gold-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-[#B0B0B0] mb-2 block">Preferred Format Duration</label>
          <select
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
            className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3.5 text-sm focus:border-gold-500 outline-none"
          >
            <option value="">Select option...</option>
            <option value="2-3 hours">2–3 hours</option>
            <option value="Half Day">Half Day</option>
            <option value="Full Day">Full Day</option>
            <option value="Recurring">Recurring Programme</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase text-[#B0B0B0] mb-2 block">Special Instructions / Message</label>
        <textarea
          rows={4}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Please list any specific timeline requirements or details..."
          className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-gold-500 outline-none"
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase text-[#B0B0B0] mb-2 block">How did you hear about us?</label>
        <select
          value={form.source}
          onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
          className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3.5 text-sm focus:border-gold-500 outline-none"
        >
          <option value="">Select origin...</option>
          <option value="Google">Google Search</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Instagram">Instagram</option>
          <option value="Referral">Word of Mouth / Referral</option>
          <option value="Existing Partner">Existing Partner Organization</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gold-500 hover:bg-gold-400 text-black font-extrabold py-4 rounded-xl text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting request...' : 'Secure Custom CSR Presentation'}
      </button>
    </form>
  )
}