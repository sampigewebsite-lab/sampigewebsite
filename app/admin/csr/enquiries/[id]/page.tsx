'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/admin/Sidebar'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Calendar, Globe, Mail, Phone, User, Landmark, Building, Briefcase } from 'lucide-react'

const supabase = createClient()

const STATUSES = ['New', 'Contacted', 'Proposal Sent', 'Follow-up', 'Confirmed', 'Completed', 'Closed', 'Not Interested']

interface Enquiry {
  id: string
  company_name: string
  company_website: string
  contact_name: string
  designation: string
  email: string
  phone: string
  csr_pillar: string
  preferred_activity: string
  employee_count: string
  preferred_date: string
  alternative_date: string
  duration: string
  location: string
  message: string
  source: string
  status: string
  admin_notes: string
  follow_up_date: string
  created_at: string
}

export default function AdminEnquiryDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')

  const fetchEnquiry = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('csr_enquiries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      toast.error('Could not find enquiry: ' + error.message)
      router.push('/admin/csr')
      return
    }

    setEnquiry(data)
    setNotes(data.admin_notes || '')
    setStatus(data.status || 'New')
    setFollowUpDate(data.follow_up_date || '')
    setLoading(false)
  }, [id, router])

  useEffect(() => {
    if (id) {
      fetchEnquiry()
    }
  }, [id, fetchEnquiry])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('csr_enquiries')
      .update({
        status,
        admin_notes: notes,
        follow_up_date: followUpDate || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      toast.error(error.message)
      setSaving(false)
      return
    }

    toast.success('Workflow status saved successfully!')
    setSaving(false)
    fetchEnquiry()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-white w-full justify-between">
        <main className="flex-1 p-10 flex items-center justify-center text-[#B0B0B0]">
          Loading Enquiry Details...
        </main>
        <Sidebar />
      </div>
    )
  }

  if (!enquiry) return null

  return (
    <div className="flex min-h-screen bg-black text-white w-full justify-between">
      <main className="flex-1 min-w-0 p-6 md:p-10">
        {/* Navigation Bar */}
        <button
          onClick={() => router.push('/admin/csr')}
          className="flex items-center gap-2 text-gold-500 hover:text-gold-400 mb-6 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to CSR Overview
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{enquiry.company_name}</h1>
            <p className="text-[#B0B0B0] text-sm mt-1">Submitted on {new Date(enquiry.created_at).toLocaleDateString('en-IN')}</p>
          </div>
          <span className="bg-gold-500/10 text-gold-500 border border-gold-500/20 px-4 py-1.5 rounded-full text-xs font-semibold uppercase">
            Current Status: {enquiry.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Enquiry Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gold-500/5 space-y-6">
              <h2 className="text-lg font-bold border-b border-gray-800 pb-3">Contact Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <User className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-[#B0B0B0]">Representative Name</div>
                    <div className="text-sm font-semibold text-white mt-1">{enquiry.contact_name}</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Briefcase className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-[#B0B0B0]">Designation / Job Title</div>
                    <div className="text-sm font-semibold text-white mt-1">{enquiry.designation || 'Not Provided'}</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-[#B0B0B0]">Corporate Email Address</div>
                    <div className="text-sm font-semibold text-white mt-1 hover:underline">
                      <a href={`mailto:${enquiry.email}`}>{enquiry.email}</a>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-[#B0B0B0]">Corporate Phone Line</div>
                    <div className="text-sm font-semibold text-white mt-1 hover:underline">
                      <a href={`tel:${enquiry.phone}`}>{enquiry.phone}</a>
                    </div>
                  </div>
                </div>
                {enquiry.company_website && (
                  <div className="flex gap-3 md:col-span-2">
                    <Globe className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-[#B0B0B0]">Corporate Domain</div>
                      <div className="text-sm font-semibold text-gold-500 mt-1 hover:underline">
                        <a href={enquiry.company_website} target="_blank" rel="noopener noreferrer">
                          {enquiry.company_website}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gold-500/5 space-y-6">
              <h2 className="text-lg font-bold border-b border-gray-800 pb-3">Enquiry Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-[#B0B0B0]">Preferred CSR Pillar</div>
                  <div className="text-sm font-semibold text-white mt-1">{enquiry.csr_pillar || 'Not Specified'}</div>
                </div>
                <div>
                  <div className="text-xs text-[#B0B0B0]">Preferred Activity Format</div>
                  <div className="text-sm font-semibold text-white mt-1">{enquiry.preferred_activity || 'Not Specified'}</div>
                </div>
                <div>
                  <div className="text-xs text-[#B0B0B0]">Expected Participant Count</div>
                  <div className="text-sm font-semibold text-white mt-1">{enquiry.employee_count} employees</div>
                </div>
                <div>
                  <div className="text-xs text-[#B0B0B0]">Implementation Location</div>
                  <div className="text-sm font-semibold text-white mt-1">{enquiry.location || 'Not Specified'}</div>
                </div>
                <div>
                  <div className="text-xs text-[#B0B0B0]">Preferred Date</div>
                  <div className="text-sm font-semibold text-white mt-1">
                    {enquiry.preferred_date ? new Date(enquiry.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Flexible'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#B0B0B0]">Format Duration</div>
                  <div className="text-sm font-semibold text-white mt-1">{enquiry.duration || 'Not Specified'}</div>
                </div>
              </div>
              {enquiry.message && (
                <div className="pt-4 border-t border-gray-800">
                  <div className="text-xs text-[#B0B0B0] mb-2">Message & Special Instructions</div>
                  <div className="bg-black p-4 rounded-xl text-sm leading-relaxed text-[#D0D0D0] whitespace-pre-wrap border border-gray-800">
                    {enquiry.message}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Workflow Sidepanel */}
          <div className="lg:col-span-1">
            <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gold-500/10 sticky top-24 space-y-6">
              <h2 className="text-lg font-bold border-b border-gray-800 pb-3">Lead Workflow</h2>

              <div>
                <label className="text-xs font-bold uppercase text-[#B0B0B0] mb-2 block">Engagement Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-black text-white border border-gray-800 rounded-lg px-4 py-2 text-sm focus:border-gold-500 outline-none"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#B0B0B0] mb-2 block">Follow-up Action Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full bg-black text-white border border-gray-800 rounded-lg px-4 py-2 text-sm focus:border-gold-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#B0B0B0] mb-2 block">Administrative CRM Notes</label>
                <textarea
                  rows={6}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record call logs, sent proposal values, and dates..."
                  className="w-full bg-black text-white border border-gray-800 rounded-lg px-4 py-3 text-sm focus:border-gold-500 outline-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gold-500 hover:bg-gold-400 text-black font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Updates'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Sidebar />
    </div>
  )
}