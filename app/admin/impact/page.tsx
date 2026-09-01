'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Save, X, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'

interface ImpactStat {
  id: string
  title: string
  value: string
  icon: string
  description: string
  display_order: number
  active: boolean
}

export default function ImpactPage() {
  const [stats, setStats] = useState<ImpactStat[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: '',
    value: '',
    icon: '',
    description: '',
    active: true,
  })

  useEffect(() => {
    checkAuth()
    fetchStats()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
    }
  }

  const fetchStats = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('impact_statistics')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setStats(data || [])
    } catch (error) {
      toast.error('Failed to fetch statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleEdit = (stat: ImpactStat) => {
    setEditingId(stat.id)
    setFormData({
      title: stat.title,
      value: stat.value,
      icon: stat.icon || '',
      description: stat.description || '',
      active: stat.active,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.title || !formData.value) {
        toast.error('Title and Value are required')
        setLoading(false)
        return
      }

      if (editingId) {
        const { error } = await supabase
          .from('impact_statistics')
          .update(formData)
          .eq('id', editingId)

        if (error) throw error
        toast.success('Statistic updated successfully!')
      } else {
        const { data: existing } = await supabase
          .from('impact_statistics')
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1)

        const nextOrder = (existing && existing.length > 0) ? existing[0].display_order + 1 : 1

        const { error } = await supabase
          .from('impact_statistics')
          .insert([{ ...formData, display_order: nextOrder }])

        if (error) throw error
        toast.success('Statistic created successfully!')
      }

      setEditingId(null)
      setFormData({ title: '', value: '', icon: '', description: '', active: true })
      fetchStats()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save statistic')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this statistic?')) return

    try {
      const { error } = await supabase
        .from('impact_statistics')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Statistic deleted successfully')
      fetchStats()
    } catch (error) {
      toast.error('Failed to delete statistic')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ title: '', value: '', icon: '', description: '', active: true })
  }

  return (
    <div className="min-h-screen bg-black flex">
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Impact Statistics</h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">Manage your impact numbers</p>
            </div>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">
              {editingId ? 'Edit Statistic' : 'Add New Statistic'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="e.g., People Supported"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Value *</label>
                <input
                  type="text"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="e.g., 15,000+"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Icon Name</label>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="e.g., Users, Heart, TreePine"
                />
                <p className="text-xs text-gray-500 mt-1">Use Lucide icon names</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="Brief description"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="w-4 h-4 accent-gold-500"
                  />
                  <span className="text-gray-300">Active</span>
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingId ? 'Update' : 'Add'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-2 bg-[#2A2A2A] text-gray-300 rounded-lg hover:bg-[#3A3A3A] transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : stats.length === 0 ? (
            <div className="text-center py-12 bg-[#1A1A1A] rounded-xl border border-gold-500/10">
              <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No statistics found</p>
              <p className="text-sm text-gray-500 mt-2">Add your first impact statistic above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 hover:border-gold-500/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-2xl md:text-3xl font-bold text-gold-500 mb-1">{stat.value}</div>
                      <h3 className="text-lg font-semibold text-white">{stat.title}</h3>
                      {stat.description && (
                        <p className="text-sm text-gray-400 mt-1">{stat.description}</p>
                      )}
                      {stat.icon && (
                        <p className="text-xs text-gray-500 mt-2">Icon: {stat.icon}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(stat)}
                        className="p-2 text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(stat.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      stat.active
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {stat.active ? 'Active' : 'Inactive'}
                    </span>
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