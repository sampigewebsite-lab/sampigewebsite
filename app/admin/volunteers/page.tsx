'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2, HeartHandshake, Mail, Phone, Calendar, ArrowLeft, Clock, Briefcase } from 'lucide-react'
import Sidebar from '@/components/admin/Sidebar'
import toast from 'react-hot-toast'

interface VolunteerSubmission {
  id: string
  name: string
  email: string
  phone: string
  area_of_interest: string
  availability: string
  message: string | null
  status: 'new' | 'contacted' | 'approved' | 'rejected'
  created_at: string
}

export default function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState<VolunteerSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<VolunteerSubmission | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchVolunteers()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/admin/login')
  }

  const fetchVolunteers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('volunteer_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVolunteers(data || [])
    } catch (error) {
      toast.error('Failed to load volunteers')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: 'new' | 'contacted' | 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('volunteer_submissions')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      toast.success(`Status updated to ${newStatus}`)
      
      setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v))
      if (selected?.id === id) {
        setSelected(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const deleteVolunteer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this volunteer application?')) return
    try {
      const { error } = await supabase.from('volunteer_submissions').delete().eq('id', id)
      if (error) throw error
      toast.success('Application deleted')
      setVolunteers(prev => prev.filter(v => v.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'contacted': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.push('/admin/dashboard')}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Volunteers</h1>
              <p className="text-gray-400 mt-1 text-sm">Review pipeline status of volunteer submissions</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-6 items-start">
            {/* List Side */}
            <div className={`lg:col-span-3 space-y-4 ${selected ? 'hidden lg:block' : ''}`}>
              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading applications...</div>
              ) : volunteers.length === 0 ? (
                <div className="text-center py-16 bg-[#1A1A1A] border border-gold-500/10 rounded-xl text-gray-500">
                  <HeartHandshake className="h-12 w-12 mx-auto mb-3 opacity-30 text-gold-500" />
                  No volunteer requests yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {volunteers.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setSelected(v)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        selected?.id === v.id 
                          ? 'bg-gold-500/10 border-gold-500/40' 
                          : 'bg-[#141414] border-gold-500/5 hover:border-gold-500/15'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <span className="font-semibold text-white truncate block text-sm md:text-base">{v.name}</span>
                          <p className="text-gold-400 font-medium text-xs md:text-sm">{v.area_of_interest}</p>
                          <p className="text-gray-500 text-xs">Availability: {v.availability}</p>
                        </div>
                        <div className="text-right flex-shrink-0 space-y-2">
                          <p className="text-[10px] text-gray-500">
                            {new Date(v.created_at).toLocaleDateString('en-IN')}
                          </p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(v.status)}`}>
                            {v.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details Side */}
            <div className={`lg:col-span-2 ${!selected ? 'hidden lg:block' : ''}`}>
              {selected ? (
                <div className="bg-[#1A1A1A] border border-gold-500/10 rounded-xl p-6 space-y-6 sticky top-24">
                  <div className="flex items-start justify-between border-b border-gold-500/10 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white leading-tight">{selected.name}</h2>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border mt-2 ${getStatusStyle(selected.status)}`}>
                        {selected.status}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="lg:hidden px-3 py-1 bg-black border border-gold-500/20 text-gold-500 text-xs font-semibold rounded"
                    >
                      Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2.5">
                      <Mail className="h-4 w-4 text-gold-500 shrink-0" />
                      <a href={`mailto:${selected.email}`} className="hover:text-gold-500 transition-colors truncate">{selected.email}</a>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 text-gold-500 shrink-0" />
                      <a href={`tel:${selected.phone}`} className="hover:text-gold-500 transition-colors truncate">{selected.phone}</a>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="h-4 w-4 text-gold-500 shrink-0" />
                      <span>{selected.area_of_interest}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4 text-gold-500 shrink-0" />
                      <span>{selected.availability}</span>
                    </div>
                  </div>

                  {selected.message && (
                    <div className="bg-black/50 border border-gold-500/5 rounded-lg p-4">
                      <h4 className="text-xs font-bold text-gold-400 mb-2 uppercase tracking-wide">Motivation & Background</h4>
                      <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                    </div>
                  )}

                  <div className="space-y-3 pt-2 border-t border-gold-500/10">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Update Pipeline Status</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateStatus(selected.id, 'contacted')}
                        className="py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 font-semibold text-xs rounded transition-colors"
                      >
                        Contacted
                      </button>
                      <button
                        onClick={() => updateStatus(selected.id, 'approved')}
                        className="py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 font-semibold text-xs rounded transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(selected.id, 'rejected')}
                        className="py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold text-xs rounded transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => deleteVolunteer(selected.id)}
                        className="py-2 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-500 font-semibold text-xs rounded transition-all"
                      >
                        Delete Request
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden lg:flex bg-[#1A1A1A] border border-dashed border-gold-500/10 rounded-xl p-8 items-center justify-center text-center text-gray-500 h-[300px] sticky top-24">
                  <div>
                    <HeartHandshake className="h-10 w-10 text-gold-500/30 mx-auto mb-2" />
                    <p className="text-sm">Select an applicant to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Sidebar />
    </div>
  )
}