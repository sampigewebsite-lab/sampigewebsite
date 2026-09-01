'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'

export default function EditTeamMember() {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [photo, setPhoto] = useState('')
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    bio: '',
    photo: '',
    linkedin: '',
    instagram: '',
    active: true,
  })

  useEffect(() => {
    checkAuth()
    fetchMember()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
    }
  }

  const fetchMember = async () => {
    const id = params.id
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (data) {
        setFormData({
          name: data.name || '',
          designation: data.designation || '',
          bio: data.bio || '',
          photo: data.photo || '',
          linkedin: data.linkedin || '',
          instagram: data.instagram || '',
          active: data.active || false,
        })
        setPhoto(data.photo || '')
      }
    } catch (error) {
      toast.error('Failed to fetch team member')
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB')
      return
    }

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `team/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('team-photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('team-photos')
        .getPublicUrl(filePath)

      setPhoto(publicUrl)
      setFormData(prev => ({ ...prev, photo: publicUrl }))
      toast.success('Photo uploaded successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.name) {
        toast.error('Please enter a name')
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('team_members')
        .update(formData)
        .eq('id', params.id)

      if (error) throw error

      toast.success('Team member updated successfully!')
      router.push('/admin/team')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update team member')
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
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/admin/team')}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Edit Team Member</h1>
              <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-base">Update team member details</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 space-y-4 md:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Photo</label>
                <div className="flex flex-wrap items-center gap-4">
                  {photo ? (
                    <div className="relative">
                      <img
                        src={photo}
                        alt="Profile"
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-gold-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhoto('')
                          setFormData(prev => ({ ...prev, photo: '' }))
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center bg-black/50">
                      <Upload className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                  
                  <div>
                    <label className="px-4 py-2 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all cursor-pointer disabled:opacity-50 inline-block text-sm">
                      {uploading ? 'Uploading...' : 'Upload Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, WEBP • Max 2MB</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Instagram URL</label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>

              <div>
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
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {loading ? 'Updating...' : 'Update Member'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/team')}
                className="px-6 py-3 bg-[#1A1A1A] text-gray-300 font-semibold rounded-lg hover:bg-[#2A2A2A] transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}