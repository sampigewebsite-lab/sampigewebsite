'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Eye, Search, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'

interface Event {
  id: string
  title: string
  slug: string
  description: string
  date: string
  time: string
  location: string
  status: string
  published: boolean
  created_at: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchEvents()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
    }
  }

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      toast.error('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Event deleted successfully')
      fetchEvents()
    } catch (error) {
      toast.error('Failed to delete event')
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ published: !currentStatus })
        .eq('id', id)

      if (error) throw error
      toast.success(`Event ${!currentStatus ? 'published' : 'unpublished'}`)
      fetchEvents()
    } catch (error) {
      toast.error('Failed to update event')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-500'
      case 'ongoing': return 'bg-green-500/20 text-green-500'
      case 'completed': return 'bg-gray-500/20 text-gray-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  const filteredEvents = events.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.location?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black flex">
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Events</h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">Manage your events</p>
            </div>
            <button
              onClick={() => router.push('/admin/events/create')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all hover:scale-[1.02]"
            >
              <Plus className="h-5 w-5" />
              Add Event
            </button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-gold-500/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-[#1A1A1A] rounded-xl border border-gold-500/10">
              <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No events found</p>
              <button
                onClick={() => router.push('/admin/events/create')}
                className="mt-4 text-gold-500 hover:text-gold-400 transition-colors"
              >
                Create your first event →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {filteredEvents.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 hover:border-gold-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">{item.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                          {item.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.date ? new Date(item.date).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePublish(item.id, item.published)}
                      className={`px-2 py-1 rounded text-xs font-semibold transition-colors ml-2 flex-shrink-0 ${
                        item.published
                          ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                      }`}
                    >
                      {item.published ? 'Published' : 'Draft'}
                    </button>
                  </div>

                  {item.location && (
                    <p className="text-gray-400 text-sm mb-2">📍 {item.location}</p>
                  )}

                  {item.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gold-500/10">
                    <span className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/events/edit/${item.id}`)}
                        className="p-2 text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <a
                        href={`/events/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
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