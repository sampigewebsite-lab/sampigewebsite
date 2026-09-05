'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Trash2, Mail, Phone, GraduationCap, Inbox, HeartHandshake, MessageSquare } from 'lucide-react'
import Sidebar from '@/components/admin/Sidebar'

type Enquiry = {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: 'unread' | 'read' | 'archived'
  created_at: string
}

type Volunteer = {
  id: string
  name: string
  email: string
  phone: string
  area_of_interest: string | null
  availability: string | null
  message: string | null
  status: 'new' | 'contacted' | 'approved' | 'rejected'
  created_at: string
}

type Intern = {
  id: string
  name: string
  email: string
  phone: string
  college: string | null
  duration: string
  interest: string
  message: string | null
  status: 'new' | 'contacted' | 'approved' | 'rejected'
  created_at: string
}

type Tab = 'enquiries' | 'volunteers' | 'interns'

export default function SubmissionsPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<Tab>('enquiries')
  const [loading, setLoading] = useState(true)

  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [interns, setInterns] = useState<Intern[]>([])

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [e, v, i] = await Promise.all([
        supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('volunteer_submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('intern_submissions').select('*').order('created_at', { ascending: false }),
      ])
      setEnquiries(e.data || [])
      setVolunteers(v.data || [])
      setInterns(i.data || [])
    } catch (err: any) {
      toast.error(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(table: string, id: string, status: string, listType: Tab) {
    try {
      const { error } = await supabase.from(table).update({ status }).eq('id', id)
      if (error) throw error

      if (listType === 'enquiries') {
        setEnquiries((p) => p.map((x) => (x.id === id ? { ...x, status: status as any } : x)))
      } else if (listType === 'volunteers') {
        setVolunteers((p) => p.map((x) => (x.id === id ? { ...x, status: status as any } : x)))
      } else {
        setInterns((p) => p.map((x) => (x.id === id ? { ...x, status: status as any } : x)))
      }
      toast.success('Status updated')
    } catch (err: any) {
      toast.error(err.message || 'Update failed')
    }
  }

  async function removeItem(table: string, id: string, listType: Tab) {
    if (!confirm('Delete this submission?')) return
    try {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error

      if (listType === 'enquiries') setEnquiries((p) => p.filter((x) => x.id !== id))
      else if (listType === 'volunteers') setVolunteers((p) => p.filter((x) => x.id !== id))
      else setInterns((p) => p.filter((x) => x.id !== id))

      toast.success('Deleted')
    } catch (err: any) {
      toast.error(err.message || 'Delete failed')
    }
  }

  const tabs = [
    { key: 'enquiries' as Tab, label: 'Enquiries', count: enquiries.length, icon: MessageSquare },
    { key: 'volunteers' as Tab, label: 'Volunteers', count: volunteers.length, icon: HeartHandshake },
    { key: 'interns' as Tab, label: 'Interns', count: interns.length, icon: GraduationCap },
  ]

  return (
    <div className="flex min-h-screen bg-black text-white w-full justify-between">
      <main className="flex-1 min-w-0 p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Inbox className="w-8 h-8 text-[#FFB300]" />
            Submissions
          </h1>
          <p className="text-gray-400">
            All form submissions from Enquiries, Volunteers, and Intern applications.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-800 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#FFB300] text-black'
                    : 'bg-[#1A1A1A] text-gray-400 border border-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-black/20 text-black' : 'bg-[#FFB300]/20 text-[#FFB300]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="space-y-4 pb-12">
            {/* Enquiries */}
            {activeTab === 'enquiries' &&
              (enquiries.length === 0 ? (
                <EmptyState label="enquiries" />
              ) : (
                enquiries.map((item) => (
                  <div key={item.id} className="bg-[#1A1A1A] border border-gold-500/20 rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                        {item.subject && (
                          <p className="text-sm text-[#FFB300] mt-1">{item.subject}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            updateStatus('contact_submissions', item.id, e.target.value, 'enquiries')
                          }
                          className="bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFB300]"
                        >
                          <option value="unread">unread</option>
                          <option value="read">read</option>
                          <option value="archived">archived</option>
                        </select>
                        <button
                          onClick={() => removeItem('contact_submissions', item.id, 'enquiries')}
                          className="p-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-sm mb-4">
                      <p className="text-gray-300 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#FFB300]" />
                        <a href={`mailto:${item.email}`} className="hover:text-[#FFB300]">
                          {item.email}
                        </a>
                      </p>
                      {item.phone && (
                        <p className="text-gray-300 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#FFB300]" />
                          {item.phone}
                        </p>
                      )}
                    </div>

                    <div className="bg-black/50 rounded-xl p-4 border border-gray-800">
                      <p className="text-sm text-gray-400 mb-1">Message</p>
                      <p className="text-gray-200 whitespace-pre-wrap">{item.message}</p>
                    </div>
                  </div>
                ))
              ))}

            {/* Volunteers */}
            {activeTab === 'volunteers' &&
              (volunteers.length === 0 ? (
                <EmptyState label="volunteer applications" />
              ) : (
                volunteers.map((item) => (
                  <div key={item.id} className="bg-[#1A1A1A] border border-gold-500/20 rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            updateStatus('volunteer_submissions', item.id, e.target.value, 'volunteers')
                          }
                          className="bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFB300]"
                        >
                          <option value="new">new</option>
                          <option value="contacted">contacted</option>
                          <option value="approved">approved</option>
                          <option value="rejected">rejected</option>
                        </select>
                        <button
                          onClick={() => removeItem('volunteer_submissions', item.id, 'volunteers')}
                          className="p-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-sm mb-4">
                      <p className="text-gray-300 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#FFB300]" />
                        <a href={`mailto:${item.email}`} className="hover:text-[#FFB300]">
                          {item.email}
                        </a>
                      </p>
                      <p className="text-gray-300 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#FFB300]" />
                        {item.phone}
                      </p>
                      {item.area_of_interest && (
                        <p className="text-gray-300">
                          <span className="text-gray-500">Interest:</span> {item.area_of_interest}
                        </p>
                      )}
                      {item.availability && (
                        <p className="text-gray-300">
                          <span className="text-gray-500">Availability:</span> {item.availability}
                        </p>
                      )}
                    </div>

                    {item.message && (
                      <div className="bg-black/50 rounded-xl p-4 border border-gray-800">
                        <p className="text-sm text-gray-400 mb-1">Message</p>
                        <p className="text-gray-200 whitespace-pre-wrap">{item.message}</p>
                      </div>
                    )}
                  </div>
                ))
              ))}

            {/* Interns */}
            {activeTab === 'interns' &&
              (interns.length === 0 ? (
                <EmptyState label="intern applications" />
              ) : (
                interns.map((item) => (
                  <div key={item.id} className="bg-[#1A1A1A] border border-gold-500/20 rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            updateStatus('intern_submissions', item.id, e.target.value, 'interns')
                          }
                          className="bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFB300]"
                        >
                          <option value="new">new</option>
                          <option value="contacted">contacted</option>
                          <option value="approved">approved</option>
                          <option value="rejected">rejected</option>
                        </select>
                        <button
                          onClick={() => removeItem('intern_submissions', item.id, 'interns')}
                          className="p-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-sm mb-4">
                      <p className="text-gray-300 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#FFB300]" />
                        <a href={`mailto:${item.email}`} className="hover:text-[#FFB300]">
                          {item.email}
                        </a>
                      </p>
                      <p className="text-gray-300 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#FFB300]" />
                        {item.phone}
                      </p>
                      <p className="text-gray-300 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#FFB300]" />
                        {item.college || '—'}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-500">Duration:</span> {item.duration}
                      </p>
                      <p className="text-gray-300 md:col-span-2">
                        <span className="text-gray-500">Interest:</span> {item.interest}
                      </p>
                    </div>

                    {item.message && (
                      <div className="bg-black/50 rounded-xl p-4 border border-gray-800">
                        <p className="text-sm text-gray-400 mb-1">Message</p>
                        <p className="text-gray-200 whitespace-pre-wrap">{item.message}</p>
                      </div>
                    )}
                  </div>
                ))
              ))}
          </div>
        )}
      </main>
      <Sidebar />
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-16 text-gray-500 border border-dashed border-gray-700 rounded-2xl">
      No {label} yet.
    </div>
  )
}