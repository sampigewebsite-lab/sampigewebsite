'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Trash2, Mail, Phone, GraduationCap } from 'lucide-react'
import Sidebar from '@/components/admin/Sidebar'

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

const STATUS_OPTIONS = ['new', 'contacted', 'approved', 'rejected'] as const

export default function InternsAdminPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Intern[]>([])
  const [filter, setFilter] = useState<'all' | Intern['status']>('all')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('intern_submissions')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setItems(data || [])
    } catch (err: any) {
      toast.error(err.message || 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: Intern['status']) {
    try {
      const { error } = await supabase
        .from('intern_submissions')
        .update({ status })
        .eq('id', id)
      if (error) throw error
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
      toast.success('Status updated')
    } catch (err: any) {
      toast.error(err.message || 'Update failed')
    }
  }

  async function removeItem(id: string) {
    if (!confirm('Delete this application?')) return
    try {
      const { error } = await supabase.from('intern_submissions').delete().eq('id', id)
      if (error) throw error
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Deleted')
    } catch (err: any) {
      toast.error(err.message || 'Delete failed')
    }
  }

  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter)

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black w-full">
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </main>
        <Sidebar />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-black w-full text-white">
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Intern Applications</h1>
            <p className="text-gray-400">View and manage internship form submissions.</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {(['all', ...STATUS_OPTIONS] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filter === s
                    ? 'bg-[#FFB300] text-black'
                    : 'bg-[#1A1A1A] text-gray-400 border border-gray-700 hover:text-white'
                }`}
              >
                {s === 'all' ? `All (${items.length})` : s}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500 border border-dashed border-gray-700 rounded-2xl">
              No applications yet.
            </div>
          ) : (
            <div className="space-y-4 pb-12">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1A1A1A] border border-gold-500/20 rounded-2xl p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={item.status}
                        onChange={(e) => updateStatus(item.id, e.target.value as Intern['status'])}
                        className="bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFB300]"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeItem(item.id)}
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
              ))}
            </div>
          )}
        </div>
      </main>
      <Sidebar />
    </div>
  )
}