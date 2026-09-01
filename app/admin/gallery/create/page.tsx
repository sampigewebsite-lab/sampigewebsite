'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Upload, X, Plus, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'

export default function CreateGalleryAlbum() {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [coverImage, setCoverImage] = useState('')
  const [images, setImages] = useState<string[]>([])
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    cover_image: '',
    published: true,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
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

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `gallery/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file)

      if (uploadError) {
        if (uploadError.message.includes('bucket not found')) {
          toast.error('Storage bucket not found. Please create "gallery" bucket in Supabase.')
        } else {
          toast.error(uploadError.message || 'Failed to upload image')
        }
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath)

      setCoverImage(publicUrl)
      setFormData(prev => ({ ...prev, cover_image: publicUrl }))
      toast.success('Cover image uploaded successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue
        if (file.size > 5 * 1024 * 1024) continue

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `gallery/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath)

        setImages(prev => [...prev, publicUrl])
      }
      toast.success(`${files.length} images uploaded successfully!`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload images')
    } finally {
      setUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.title) {
        toast.error('Please enter an album title')
        setLoading(false)
        return
      }

      const dataToInsert = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        description: formData.description || null,
        cover_image: coverImage || null,
        published: formData.published,
      }

      const { data, error } = await supabase
        .from('gallery_albums')
        .insert([dataToInsert])
        .select()

      if (error) throw error

      if (images.length > 0 && data && data[0]) {
        const imageData = images.map((url, index) => ({
          album_id: data[0].id,
          image_url: url,
          display_order: index + 1,
        }))

        const { error: imageError } = await supabase
          .from('gallery_images')
          .insert(imageData)

        if (imageError) throw imageError
      }

      toast.success('Album created successfully!')
      router.push('/admin/gallery')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create album')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/admin/gallery')}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Create Album</h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">Create a new photo album</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 space-y-4 md:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Album Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="e.g., Health Camp 2024"
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
                  placeholder="auto-generated"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="Album description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cover Image</label>
                <div className="flex flex-wrap items-center gap-4">
                  {coverImage ? (
                    <div className="relative">
                      <img src={coverImage} alt="Cover" className="w-32 h-32 object-cover rounded-lg border border-gold-500/20" />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImage('')
                          setFormData(prev => ({ ...prev, cover_image: '' }))
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-black/50">
                      <Upload className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                  
                  <div>
                    <label className="px-4 py-2 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all cursor-pointer disabled:opacity-50 inline-block text-sm">
                      {uploading ? 'Uploading...' : 'Upload Cover'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, WEBP • Max 5MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gallery Images</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-24 md:h-32 object-cover rounded-lg border border-gold-500/10" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-full h-24 md:h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gold-500 transition-colors bg-black/50">
                    <Plus className="h-6 w-6 text-gray-500" />
                    <span className="text-xs text-gray-500 mt-1">Add Images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">Upload multiple images at once • Max 5MB each</p>
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
                  <span className="text-gray-300">Publish immediately</span>
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
                {loading ? 'Creating...' : 'Create Album'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/gallery')}
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