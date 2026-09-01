'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Eye, Search, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'

interface Page {
  id: string
  title: string
  slug: string
  published: boolean
  created_at: string
}

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchPages()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
    }
  }

  const fetchPages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPages(data || [])
    } catch (error) {
      toast.error('Failed to fetch pages')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Page deleted successfully')
      fetchPages()
    } catch (error) {
      toast.error('Failed to delete page')
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('pages')
        .update({ published: !currentStatus })
        .eq('id', id)

      if (error) throw error
      toast.success(`Page ${!currentStatus ? 'published' : 'unpublished'}`)
      fetchPages()
    } catch (error) {
      toast.error('Failed to update page')
    }
  }

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(search.toLowerCase()) ||
    page.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black flex">
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Pages</h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">Manage your website pages</p>
            </div>
            <button
              onClick={() => router.push('/admin/pages/create')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all hover:scale-[1.02]"
            >
              <Plus className="h-5 w-5" />
              Add Page
            </button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-gold-500/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : filteredPages.length === 0 ? (
            <div className="text-center py-12 bg-[#1A1A1A] rounded-xl border border-gold-500/10">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No pages found</p>
              <button
                onClick={() => router.push('/admin/pages/create')}
                className="mt-4 text-gold-500 hover:text-gold-400 transition-colors"
              >
                Create your first page →
              </button>
            </div>
          ) : (
            <div className="bg-[#1A1A1A] rounded-xl border border-gold-500/10 overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-black/50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-400">Title</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-400">Slug</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-400">Status</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-500/5">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 md:px-6 py-3 md:py-4 text-white text-sm md:text-base">{page.title}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-gray-300 text-sm md:text-base">/{page.slug}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <button
                          onClick={() => togglePublish(page.id, page.published)}
                          className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            page.published
                              ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                              : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                          }`}
                        >
                          {page.published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-1 md:gap-2">
                          <button
                            onClick={() => router.push(`/${page.slug}`)}
                            className="p-1.5 md:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="h-3 w-3 md:h-4 md:w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/pages/edit/${page.id}`)}
                            className="p-1.5 md:p-2 text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(page.id)}
                            className="p-1.5 md:p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
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