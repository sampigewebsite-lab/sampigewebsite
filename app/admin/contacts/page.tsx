'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2, MessageSquare, Mail, Phone, Calendar, Eye, EyeOff, Check, ArrowLeft } from 'lucide-react'
import Sidebar from '@/components/admin/Sidebar'
import toast from 'react-hot-toast'

interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: 'unread' | 'read' | 'archived'
  created_at: string
}

export default function AdminContacts() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ContactSubmission | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchSubmissions()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/admin/login')
  }

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      toast.error('Failed to load enquiries')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: 'read' | 'unread') => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      toast.success(`Marked as ${newStatus}`)
      
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s))
      if (selected?.id === id) {
        setSelected(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const deleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return
    try {
      const { error } = await supabase.from('contact_submissions').delete().eq('id', id)
      if (error) throw error
      toast.success('Deleted successfully')
      setSubmissions(prev => prev.filter(s => s.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch (error) {
      toast.error('Failed to delete')
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
              <h1 className="text-2xl md:text-3xl font-bold text-white">Enquiries</h1>
              <p className="text-gray-400 mt-1 text-sm">Review general contact form inquiries</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-6 items-start">
            {/* List Side */}
            <div className={`lg:col-span-3 space-y-4 ${selected ? 'hidden lg:block' : ''}`}>
              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading inquiries...</div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-16 bg-[#1A1A1A] border border-gold-500/10 rounded-xl text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30 text-gold-500" />
                  No inquiries found.
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => { setSelected(sub); if (sub.status === 'unread') updateStatus(sub.id, 'read') }}
                      className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        selected?.id === sub.id 
                          ? 'bg-gold-500/10 border-gold-500/40' 
                          : sub.status === 'unread' 
                            ? 'bg-[#1e1e1e] border-gold-500/20 shadow-md shadow-gold-500/5' 
                            : 'bg-[#141414] border-gold-500/5 hover:border-gold-500/15'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white truncate text-sm md:text-base">{sub.name}</span>
                            {sub.status === 'unread' && (
                              <span className="px-2 py-0.5 text-[10px] bg-gold-500 text-black font-bold uppercase rounded-full">New</span>
                            )}
                          </div>
                          <p className="text-gold-400 font-medium text-xs md:text-sm truncate">{sub.subject}</p>
                          <p className="text-gray-400 text-xs line-clamp-1">{sub.message}</p>
                        </div>
                        <div className="text-right flex-shrink-0 space-y-2">
                          <p className="text-[10px] text-gray-500">
                            {new Date(sub.created_at).toLocaleDateString('en-IN')}
                          </p>
                          <div className="flex items-center gap-1.5 justify-end">
                            <button
                              onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, sub.status === 'unread' ? 'read' : 'unread') }}
                              className="p-1 text-gray-500 hover:text-gold-500 rounded transition-colors"
                              title={sub.status === 'unread' ? 'Mark as Read' : 'Mark as Unread'}
                            >
                              {sub.status === 'unread' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteSubmission(sub.id) }}
                              className="p-1 text-gray-500 hover:text-red-500 rounded transition-colors"
                              title="Delete Inquiry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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
                      <p className="text-gold-400 text-sm mt-1">{selected.subject}</p>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="lg:hidden px-3 py-1 bg-black border border-gold-500/20 text-gold-500 text-xs font-semibold rounded"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-3 text-sm text-gray-300">
                    <div className="flex items-center gap-2.5">
                      <Mail className="h-4 w-4 text-gold-500" />
                      <a href={`mailto:${selected.email}`} className="hover:text-gold-500 transition-colors">{selected.email}</a>
                    </div>
                    {selected.phone && (
                      <div className="flex items-center gap-2.5">
                        <Phone className="h-4 w-4 text-gold-500" />
                        <a href={`tel:${selected.phone}`} className="hover:text-gold-500 transition-colors">{selected.phone}</a>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-4 w-4 text-gold-500" />
                      <span>{new Date(selected.created_at).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="bg-black/50 border border-gold-500/5 rounded-lg p-4">
                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => updateStatus(selected.id, selected.status === 'unread' ? 'read' : 'unread')}
                      className="flex-1 py-2 border border-gold-500/20 hover:border-gold-500/40 text-gold-500 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      {selected.status === 'unread' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      <span>Mark as {selected.status === 'unread' ? 'Read' : 'Unread'}</span>
                    </button>
                    <button
                      onClick={() => deleteSubmission(selected.id)}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden lg:flex bg-[#1A1A1A] border border-dashed border-gold-500/10 rounded-xl p-8 items-center justify-center text-center text-gray-500 h-[300px] sticky top-24">
                  <div>
                    <MessageSquare className="h-10 w-10 text-gold-500/30 mx-auto mb-2" />
                    <p className="text-sm">Select an inquiry to view details</p>
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