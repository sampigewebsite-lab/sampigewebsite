'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Upload, X, Plus, GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'

interface ProjectSection {
  id?: string
  heading: string
  description: string
  image_url: string
  display_order: number
  _temp_id?: string
}

export default function EditProject() {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingSection, setUploadingSection] = useState<number | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [coverImage, setCoverImage] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)
  const [sections, setSections] = useState<ProjectSection[]>([])
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: '', slug: '', short_description: '', description: '',
    problem: '', approach: '', category_id: '', status: 'upcoming',
    location: '', start_date: '', end_date: '', cover_image: '',
    budget: '', beneficiaries: '', impact_summary: '',
    featured: false, published: true,
  })

  useEffect(() => {
    checkAuth()
    fetchCategories()
    fetchProject()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/admin/login')
  }

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('project_categories').select('*').eq('active', true).order('display_order')
    setCategories(data || [])
  }

  const fetchProject = async () => {
    const id = params.id
    if (!id) return
    try {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
      if (error) throw error
      if (data) {
        setFormData({
          title: data.title || '', slug: data.slug || '',
          short_description: data.short_description || '',
          description: data.description || '', problem: data.problem || '',
          approach: data.approach || '', category_id: data.category_id || '',
          status: data.status || 'upcoming', location: data.location || '',
          start_date: data.start_date || '', end_date: data.end_date || '',
          cover_image: data.cover_image || '',
          budget: data.budget?.toString() || '',
          beneficiaries: data.beneficiaries?.toString() || '',
          impact_summary: data.impact_summary || '',
          featured: data.featured || false, published: data.published || false,
        })
        setCoverImage(data.cover_image || '')
      }

      // Fetch existing sections
      const { data: sectionsData } = await supabase
        .from('project_sections').select('*').eq('project_id', id).order('display_order')
      if (sectionsData) {
        setSections(sectionsData.map(s => ({
          id: s.id, heading: s.heading || '', description: s.description || '',
          image_url: s.image_url || '', display_order: s.display_order,
        })))
      }
    } catch (error) {
      toast.error('Failed to fetch project')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData(prev => ({ ...prev, title, slug: generateSlug(title) }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image size should be less than 5MB'); return }
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `projects/${fileName}`
      const { error: uploadError } = await supabase.storage.from('project-images').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('project-images').getPublicUrl(filePath)
      setCoverImage(publicUrl)
      setFormData(prev => ({ ...prev, cover_image: publicUrl }))
      toast.success('Image uploaded!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image')
    } finally { setUploading(false) }
  }

  // --- Section Management ---
  const addSection = () => {
    setSections(prev => [...prev, {
      _temp_id: crypto.randomUUID(),
      heading: '', description: '', image_url: '', display_order: prev.length
    }])
  }

  const updateSection = (index: number, field: string, value: string) => {
    setSections(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  const removeSection = (index: number) => {
    setSections(prev => prev.filter((_, i) => i !== index))
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    setSections(prev => {
      const arr = [...prev]
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= arr.length) return arr
      ;[arr[index], arr[target]] = [arr[target], arr[index]]
      return arr.map((s, i) => ({ ...s, display_order: i }))
    })
  }

  const handleSectionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image size should be less than 5MB'); return }
    setUploadingSection(index)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `projects/sections/${fileName}`
      const { error } = await supabase.storage.from('project-images').upload(filePath, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('project-images').getPublicUrl(filePath)
      updateSection(index, 'image_url', publicUrl)
      toast.success('Section image uploaded!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload')
    } finally { setUploadingSection(null) }
  }

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!formData.title) { toast.error('Please enter a project title'); setLoading(false); return }

      const dataToUpdate: any = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        short_description: formData.short_description || null,
        description: formData.description || null,
        problem: formData.problem || null,
        approach: formData.approach || null,
        status: formData.status,
        location: formData.location || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        cover_image: coverImage || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        beneficiaries: formData.beneficiaries ? parseInt(formData.beneficiaries) : null,
        impact_summary: formData.impact_summary || null,
        featured: formData.featured,
        published: formData.published,
        category_id: formData.category_id || null,
      }

      const { error } = await supabase.from('projects').update(dataToUpdate).eq('id', params.id)
      if (error) throw error

      // Save sections: delete old, insert new
      await supabase.from('project_sections').delete().eq('project_id', params.id)
      if (sections.length > 0) {
        const sectionsToInsert = sections.map((s, i) => ({
          project_id: params.id,
          heading: s.heading || null,
          description: s.description || null,
          image_url: s.image_url || null,
          display_order: i,
        }))
        const { error: secError } = await supabase.from('project_sections').insert(sectionsToInsert)
        if (secError) throw secError
      }

      toast.success('Project updated successfully!')
      router.push('/admin/projects')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update project')
    } finally { setLoading(false) }
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
            <button onClick={() => router.push('/admin/projects')}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Edit Project</h1>
              <p className="text-gray-400 mt-1 text-sm">Update project details and content sections</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* === MAIN PROJECT FIELDS === */}
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 space-y-4 md:space-y-6">
              <h2 className="text-lg font-semibold text-gold-500 border-b border-gold-500/10 pb-2">Basic Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Project Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleTitleChange} required
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Short Description</label>
                <input type="text" name="short_description" value={formData.short_description} onChange={handleChange}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Description</label>
                <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={4}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cover Image</label>
                <div className="flex flex-wrap items-center gap-4">
                  {coverImage ? (
                    <div className="relative">
                      <img src={coverImage} alt="Cover" className="w-32 h-32 object-cover rounded-lg border border-gold-500/20" />
                      <button type="button" onClick={() => { setCoverImage(''); setFormData(prev => ({ ...prev, cover_image: '' })) }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-black/50">
                      <Upload className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <label className="px-4 py-2 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all cursor-pointer inline-block text-sm">
                      {uploading ? 'Uploading...' : 'Upload Image'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, WEBP • Max 5MB</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select name="category_id" value={formData.category_id} onChange={handleChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors">
                    <option value="">Select category</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors">
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input type="text" name="location" value={formData.location || ''} onChange={handleChange}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input type="date" name="start_date" value={formData.start_date || ''} onChange={handleChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input type="date" name="end_date" value={formData.end_date || ''} onChange={handleChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors" />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="w-4 h-4 accent-gold-500" />
                  <span className="text-gray-300 text-sm">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="published" checked={formData.published} onChange={handleChange} className="w-4 h-4 accent-gold-500" />
                  <span className="text-gray-300 text-sm">Published</span>
                </label>
              </div>
            </div>

            {/* === ZIG-ZAG CONTENT SECTIONS === */}
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 space-y-4">
              <div className="flex items-center justify-between border-b border-gold-500/10 pb-2">
                <div>
                  <h2 className="text-lg font-semibold text-gold-500">Content Sections (Zig-Zag Layout)</h2>
                  <p className="text-xs text-gray-500 mt-1">These alternate image-left / image-right on the project page</p>
                </div>
                <button type="button" onClick={addSection}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gold-500/10 text-gold-500 rounded-lg hover:bg-gold-500/20 transition-colors text-sm font-semibold">
                  <Plus className="h-4 w-4" /> Add Section
                </button>
              </div>

              {sections.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-6">
                  No sections yet. Click "Add Section" to create zig-zag content blocks.
                </p>
              )}

              {sections.map((section, index) => (
                <div key={section.id || section._temp_id}
                  className="bg-black/50 rounded-lg p-4 border border-gold-500/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gold-500 uppercase tracking-wider">
                      Section {index + 1} — {index % 2 === 0 ? '📷 Image LEFT, Text RIGHT' : '📝 Text LEFT, Image RIGHT'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveSection(index, 'up')} disabled={index === 0}
                        className="p-1 text-gray-500 hover:text-gold-500 disabled:opacity-30 transition-colors">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1}
                        className="p-1 text-gray-500 hover:text-gold-500 disabled:opacity-30 transition-colors">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => removeSection(index)}
                        className="p-1 text-gray-500 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <input type="text" placeholder="Section Heading"
                        value={section.heading} onChange={(e) => updateSection(index, 'heading', e.target.value)}
                        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500 transition-colors" />
                      <textarea placeholder="Section description / notes..."
                        value={section.description} onChange={(e) => updateSection(index, 'description', e.target.value)} rows={3}
                        className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500 transition-colors resize-none" />
                    </div>
                    <div>
                      {section.image_url ? (
                        <div className="relative inline-block">
                          <img src={section.image_url} alt="" className="w-32 h-32 object-cover rounded-lg border border-gold-500/20" />
                          <button type="button" onClick={() => updateSection(index, 'image_url', '')}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-32 h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center bg-black/50 cursor-pointer hover:border-gold-500/40 transition-colors">
                          {uploadingSection === index ? (
                            <span className="text-xs text-gold-500">Uploading...</span>
                          ) : (
                            <>
                              <Upload className="h-6 w-6 text-gray-500 mb-1" />
                              <span className="text-xs text-gray-500">Upload</span>
                            </>
                          )}
                          <input type="file" accept="image/*" className="hidden"
                            onChange={(e) => handleSectionImageUpload(e, index)} disabled={uploadingSection === index} />
                        </label>
                      )}
                      <p className="text-xs text-gray-600 mt-1">Any orientation works</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* === SUBMIT === */}
            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all hover:scale-[1.02] disabled:opacity-50">
                <Save className="h-5 w-5" />
                {loading ? 'Saving...' : 'Save Project'}
              </button>
              <button type="button" onClick={() => router.push('/admin/projects')}
                className="px-6 py-3 bg-[#1A1A1A] text-gray-300 font-semibold rounded-lg hover:bg-[#2A2A2A] transition-all">
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