'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'

export default function EditPage() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    seo_title: '',
    seo_description: '',
    published: true,
  })

  useEffect(() => {
    checkAuth()
    fetchPage()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
    }
  }

  const fetchPage = async () => {
    const id = params.id
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (data) {
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          seo_title: data.seo_title || '',
          seo_description: data.seo_description || '',
          published: data.published || false,
        })
      }
    } catch (error) {
      toast.error('Failed to fetch page')
    } finally {
      setInitialLoading(false)
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.title) {
        toast.error('Please enter a page title')
        setLoading(false)
        return
      }

      const dataToUpdate = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null,
        published: formData.published,
      }

      const { error } = await supabase
        .from('pages')
        .update(dataToUpdate)
        .eq('id', params.id)

      if (error) throw error

      toast.success('Page updated successfully!')
      router.push('/admin/pages')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update page')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold-500 text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/admin/pages')}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Edit Page</h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">Update page details</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Page Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    required
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">SEO Title</label>
                <input
                  type="text"
                  name="seo_title"
                  value={formData.seo_title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">SEO Description</label>
                <textarea
                  name="seo_description"
                  value={formData.seo_description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleChange}
                    className="w-4 h-4 accent-gold-500"
                  />
                  <span className="text-gray-300">Published</span>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {loading ? 'Updating...' : 'Update Page'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/pages')}
                className="px-6 py-3 bg-[#1A1A1A] text-gray-300 font-semibold rounded-lg hover:bg-[#2A2A2A] transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
      <Sidebar />
    </div>
  )
}