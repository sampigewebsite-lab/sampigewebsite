'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Search, FileDown, Eye, ArrowLeft, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'

interface Resource {
  id: string
  title: string
  slug: string
  description: string | null
  file_url: string
  file_size: string | null
  file_type: string | null
  category: string | null
  download_count: number
  published: boolean
  created_at: string
}

export default function AdminResourcesList() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchResources()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/admin/login')
  }

  const fetchResources = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setResources(data || [])
    } catch (error) {
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      const { error } = await supabase.from('resources').delete().eq('id', id)
      if (error) throw error
      toast.success('Resource deleted successfully')
      fetchResources()
    } catch (error) {
      toast.error('Failed to delete resource')
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ published: !currentStatus })
        .eq('id', id)

      if (error) throw error
      toast.success(`Resource ${!currentStatus ? 'published' : 'unpublished'}`)
      fetchResources()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const filteredResources = resources.filter(res =>
    res.title.toLowerCase().includes(search.toLowerCase()) ||
    res.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black flex">
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/admin/dashboard')}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Resources</h1>
                <p className="text-gray-400 mt-1 text-sm md:text-base">Upload downloadable reports and public data sheets</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin/resources/create')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all hover:scale-[1.02]"
            >
              <Plus className="h-5 w-5" /> Add Resource
            </button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-gold-500/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading resources...</div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-16 bg-[#1A1A1A] rounded-xl border border-gold-500/10 text-gray-500">
              <FileDown className="h-12 w-12 mx-auto mb-4 text-gold-500 opacity-40" />
              <p>No documents or reports found.</p>
              <button onClick={() => router.push('/admin/resources/create')}
                className="mt-4 text-gold-500 hover:text-gold-400 font-semibold transition-colors text-sm">
                Upload your first resource →
              </button>
            </div>
          ) : (
            <div className="bg-[#1A1A1A] rounded-xl border border-gold-500/10 overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-black/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Size / Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Downloads</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Published</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-500/5">
                  {filteredResources.map((res) => (
                    <tr key={res.id} className="hover:bg-white/5 transition-colors text-sm">
                      <td className="px-6 py-4">
                        <p className="text-white font-semibold">{res.title}</p>
                        <p className="text-gray-500 text-xs truncate max-w-xs">{res.description || 'No description available'}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        <span className="px-2.5 py-1 bg-gold-500/5 text-gold-400 border border-gold-500/10 text-xs font-semibold rounded-full">
                          {res.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {res.file_size || 'N/A'} • <span className="uppercase">{res.file_type || 'Unknown'}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Download className="h-3.5 w-3.5 text-gold-500" /> {res.download_count}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => togglePublish(res.id, res.published)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            res.published
                              ? 'bg-green-500/25 text-green-400 border border-green-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}
                        >
                          {res.published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a href={res.file_url} target="_blank" rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <Eye className="h-4 w-4" />
                          </a>
                          <button onClick={() => router.push(`/admin/resources/edit/${res.id}`)}
                            className="p-2 text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 rounded-lg transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(res.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Sidebar />
    </div>
  )
}