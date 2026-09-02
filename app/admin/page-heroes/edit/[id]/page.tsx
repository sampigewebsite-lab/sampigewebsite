'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'

export default function EditPageHero() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    page_key: '',
    page_label: '',
    badge: '',
    title: '',
    description: '',
    background_image: '',
    stat_1_value: '',
    stat_1_label: '',
    stat_2_value: '',
    stat_2_label: '',
    stat_3_value: '',
    stat_3_label: '',
    stat_4_value: '',
    stat_4_label: '',
  })

  useEffect(() => {
    checkAuth()
    fetchHero()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/admin/login')
  }

  const fetchHero = async () => {
    const id = params.id
    if (!id) return
    try {
      const { data, error } = await supabase
        .from('page_heroes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (data) {
        setFormData({
          page_key: data.page_key || '',
          page_label: data.page_label || '',
          badge: data.badge || '',
          title: data.title || '',
          description: data.description || '',
          background_image: data.background_image || '',
          stat_1_value: data.stat_1_value || '',
          stat_1_label: data.stat_1_label || '',
          stat_2_value: data.stat_2_value || '',
          stat_2_label: data.stat_2_label || '',
          stat_3_value: data.stat_3_value || '',
          stat_3_label: data.stat_3_label || '',
          stat_4_value: data.stat_4_value || '',
          stat_4_label: data.stat_4_label || '',
        })
      }
    } catch (error) {
      toast.error('Failed to load hero details')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `page-heroes/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('media').upload(path, file)
      if (error) {
        if (error.message.includes('bucket not found')) {
          toast.error('Create a public "media" bucket in Supabase Storage')
        } else {
          toast.error(error.message)
        }
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
      setFormData((p) => ({ ...p, background_image: publicUrl }))
      toast.success('Image uploaded!')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { page_key, ...rest } = formData
      const { error } = await supabase
        .from('page_heroes')
        .update(rest)
        .eq('id', params.id)

      if (error) throw error
      toast.success('Page hero updated!')
      router.push('/admin/page-heroes')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update')
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
              onClick={() => router.push('/admin/page-heroes')}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Edit: {formData.page_label}</h1>
              <p className="text-gray-400 mt-1 text-sm">Page key: <span className="text-gold-500">{formData.page_key}</span></p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hero Content */}
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 space-y-4">
              <h2 className="text-lg font-semibold text-gold-500 border-b border-gold-500/10 pb-2">
                Hero Section
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Background Image</label>
                <div className="flex flex-wrap items-center gap-4">
                  {formData.background_image ? (
                    <div className="relative">
                      <img
                        src={formData.background_image}
                        alt="Hero"
                        className="w-48 h-28 object-cover rounded-lg border border-gold-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, background_image: '' }))}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-48 h-28 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-black/50">
                      <ImageIcon className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                  <label className="px-4 py-2 bg-gold-500 text-black font-semibold rounded-lg cursor-pointer text-sm hover:bg-gold-600 inline-flex items-center gap-2">
                    {uploading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="h-4 w-4" /> Upload Image</>
                    )}
                    <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleImageUpload} />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Landscape 1920×1080+ recommended</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Badge Text (small gold text above title)</label>
                <input
                  type="text"
                  name="badge"
                  value={formData.badge}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  placeholder="e.g., FOUNDED DECEMBER 26, 2019"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Page Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  placeholder="e.g., About Us"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 resize-none"
                  placeholder="Brief subtitle for this page"
                />
              </div>
            </div>

            {/* Yellow Stat Strip */}
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gold-500 border-b border-gold-500/10 pb-2">
                  Yellow Stat Strip (below hero)
                </h2>
                <p className="text-xs text-gray-500 mt-2">Leave any stat blank to hide it. 4 stats max.</p>
              </div>

              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-black/40 rounded-lg border border-gold-500/5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Stat {n} Value</label>
                    <input
                      type="text"
                      name={`stat_${n}_value`}
                      value={(formData as any)[`stat_${n}_value`]}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500"
                      placeholder={n === 1 ? '2019' : n === 2 ? '1K+' : n === 3 ? '5' : '80G'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Stat {n} Label</label>
                    <input
                      type="text"
                      name={`stat_${n}_label`}
                      value={(formData as any)[`stat_${n}_label`]}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500"
                      placeholder={n === 1 ? 'BORN IN BENGALURU' : n === 2 ? 'VOLUNTEERS' : n === 3 ? 'CORE PILLARS' : '12A & CSR ELIGIBLE'}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {loading ? 'Saving...' : 'Save Page Hero'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/page-heroes')}
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