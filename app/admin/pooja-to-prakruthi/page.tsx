'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import {
  Loader2, Save, Mail, Settings, MapPin, Upload, Plus,
  Trash2, Image as ImageIcon
} from 'lucide-react'

export default function PoojaAdminPage() {
  const [activeTab, setActiveTab] = useState<'enquiries' | 'content' | 'points'>('enquiries')
  const [content, setContent] = useState<any>(null)
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [points, setPoints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  const [newPointName, setNewPointName] = useState('')
  const [newPointArea, setNewPointArea] = useState('')
  const [newPointAddress, setNewPointAddress] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    const [{ data: enqData }, { data: contentData }, { data: pointsData }] = await Promise.all([
      supabase.from('pooja_enquiries').select('*').order('created_at', { ascending: false }),
      supabase.from('pooja_to_prakruthi_content').select('*').eq('id', 1).single(),
      supabase.from('pooja_collection_points').select('*').order('display_order', { ascending: true }),
    ])

    setEnquiries(enqData || [])
    setContent(contentData || {})
    setPoints(pointsData || [])
    setLoading(false)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, fieldName: string) {
    const file = e.target.files?.[0]
    if (!file) return

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    setUploadingField(fieldName)

    const fileExt = file.name.split('.').pop()
    const fileName = `pooja_${fieldName}_${Date.now()}.${fileExt}`
    const filePath = fileName // store directly in media bucket root

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      console.error(uploadError)
      toast.error(`Upload failed: ${uploadError.message}`)
      setUploadingField(null)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath)
    const publicUrl = publicUrlData.publicUrl

    setContent((prev: any) => ({ ...prev, [fieldName]: publicUrl }))

    const { error: updateError } = await supabase
      .from('pooja_to_prakruthi_content')
      .update({ [fieldName]: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', 1)

    if (updateError) {
      console.error(updateError)
      toast.error(`Saved to storage, but DB update failed: ${updateError.message}`)
    } else {
      toast.success('Image uploaded and saved!')
    }

    setUploadingField(null)
    // reset input so same file can be re-selected if needed
    e.target.value = ''
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    setUploadingField('gallery')
    const fileExt = file.name.split('.').pop()
    const fileName = `pooja_gallery_${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      toast.error(`Gallery upload failed: ${uploadError.message}`)
      setUploadingField(null)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName)
    const publicUrl = publicUrlData.publicUrl

    const currentGallery = content?.real_work_images || []
    const updatedGallery = [...currentGallery, publicUrl]

    setContent((prev: any) => ({ ...prev, real_work_images: updatedGallery }))

    const { error } = await supabase
      .from('pooja_to_prakruthi_content')
      .update({ real_work_images: updatedGallery })
      .eq('id', 1)

    if (error) toast.error(error.message)
    else toast.success('Gallery photo added!')

    setUploadingField(null)
    e.target.value = ''
  }

  async function removeGalleryImage(index: number) {
    const currentGallery = content?.real_work_images || []
    const updatedGallery = currentGallery.filter((_: any, i: number) => i !== index)
    setContent((prev: any) => ({ ...prev, real_work_images: updatedGallery }))
    await supabase.from('pooja_to_prakruthi_content').update({ real_work_images: updatedGallery }).eq('id', 1)
    toast.success('Photo removed')
  }

  async function handleSaveContent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    const updates = {
      hero_title_line1: formData.get('hero_title_line1'),
      hero_title_line2: formData.get('hero_title_line2'),
      hero_description: formData.get('hero_description'),
      household_price: formData.get('household_price'),
      apartment_price: formData.get('apartment_price'),
      event_price: formData.get('event_price'),
      problem_heading: formData.get('problem_heading'),
      problem_solution_text: formData.get('problem_solution_text'),
    }

    const { error } = await supabase
      .from('pooja_to_prakruthi_content')
      .update(updates)
      .eq('id', 1)

    if (error) toast.error('Failed to save content')
    else toast.success('Text changes saved successfully!')
    setSaving(false)
  }

  async function handleAddPoint(e: React.FormEvent) {
    e.preventDefault()
    if (!newPointName || !newPointArea) {
      toast.error('Name and Area are required')
      return
    }

    const { error } = await supabase.from('pooja_collection_points').insert([{
      name: newPointName,
      area: newPointArea,
      address: newPointAddress,
      is_active: true,
    }])

    if (error) toast.error('Failed to add collection point')
    else {
      toast.success('Collection point added!')
      setNewPointName('')
      setNewPointArea('')
      setNewPointAddress('')
      fetchData()
    }
  }

  async function togglePointStatus(id: string, currentStatus: boolean) {
    await supabase.from('pooja_collection_points').update({ is_active: !currentStatus }).eq('id', id)
    toast.success('Status updated')
    fetchData()
  }

  async function deletePoint(id: string) {
    if (!confirm('Delete this collection point?')) return
    await supabase.from('pooja_collection_points').delete().eq('id', id)
    toast.success('Deleted')
    fetchData()
  }

  if (loading) {
    return (
      <div className="p-10 text-white flex justify-center">
        <Loader2 className="animate-spin text-[#FFB300]" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto text-gray-200">
      <Toaster position="top-right" />

      <div className="mb-8 border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Pooja to Prakruthi Admin</h1>
        <p className="text-gray-400 text-sm">
          Manage flower recycling content, real photographs, collection points, and visitor requests.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { id: 'enquiries', label: `Form Enquiries (${enquiries.length})`, icon: Mail },
          { id: 'content', label: 'Edit Content & Images', icon: Settings },
          { id: 'points', label: `Collection Points (${points.length})`, icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                active
                  ? 'bg-[#FFB300] text-black shadow-lg shadow-[#FFB300]/20'
                  : 'bg-[#141414] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* TAB 1: ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="bg-[#141414] rounded-2xl border border-gray-800 overflow-hidden">
          {enquiries.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No enquiries received yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-black text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Name & Contact</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Area</th>
                    <th className="px-6 py-4">Volume</th>
                    <th className="px-6 py-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {enquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-black/40">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(enq.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{enq.full_name || enq.contact_person || 'N/A'}</div>
                        <div className="text-[#FFB300] font-mono text-xs">{enq.phone}</div>
                        <div className="text-gray-500 text-xs">{enq.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-800 text-[#FFB300] rounded-full text-xs font-bold uppercase">
                          {enq.participation_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">{enq.area_locality || enq.venue_location || 'N/A'}</td>
                      <td className="px-6 py-4 text-xs">{enq.estimated_volume || 'N/A'}</td>
                      <td className="px-6 py-4 text-xs text-gray-400 max-w-xs">
                        {enq.apartment_name && <div className="text-white font-semibold">{enq.apartment_name}</div>}
                        {enq.address && <div>{enq.address}</div>}
                        {enq.message && <div className="italic text-gray-500 mt-1">"{enq.message}"</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONTENT + IMAGES */}
      {activeTab === 'content' && (
        <div className="space-y-10">
          <div className="bg-[#141414] rounded-3xl p-8 border border-gray-800 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <ImageIcon className="text-[#FFB300] w-6 h-6" /> Upload Real Section Photographs
              </h2>
              <p className="text-gray-400 text-sm">
                Upload photos for each section. They appear on the public page after refresh.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ImageUploadCard
                label="1. Hero Side Photo"
                sublabel="Main hero right-side image"
                currentUrl={content?.hero_side_image}
                uploading={uploadingField === 'hero_side_image'}
                onFileChange={(e) => handleImageUpload(e, 'hero_side_image')}
              />
              <ImageUploadCard
                label="2. Solution Photo"
                sublabel="Composting / process photo"
                currentUrl={content?.solution_image}
                uploading={uploadingField === 'solution_image'}
                onFileChange={(e) => handleImageUpload(e, 'solution_image')}
              />
              <ImageUploadCard
                label="3. Accepted Flowers Photo"
                sublabel="Top of YES card"
                currentUrl={content?.accepted_image}
                uploading={uploadingField === 'accepted_image'}
                onFileChange={(e) => handleImageUpload(e, 'accepted_image')}
              />
              <ImageUploadCard
                label="4. Offered With Devotion"
                sublabel="What Happens — Step 1"
                currentUrl={content?.problem_scene_1_image}
                uploading={uploadingField === 'problem_scene_1_image'}
                onFileChange={(e) => handleImageUpload(e, 'problem_scene_1_image')}
              />
              <ImageUploadCard
                label="5. Pooja Ends Photo"
                sublabel="What Happens — Step 2"
                currentUrl={content?.problem_scene_2_image}
                uploading={uploadingField === 'problem_scene_2_image'}
                onFileChange={(e) => handleImageUpload(e, 'problem_scene_2_image')}
              />
              <ImageUploadCard
                label="6. Mixed Waste Photo"
                sublabel="What Happens — Step 3"
                currentUrl={content?.problem_scene_3_image}
                uploading={uploadingField === 'problem_scene_3_image'}
                onFileChange={(e) => handleImageUpload(e, 'problem_scene_3_image')}
              />
              <ImageUploadCard
                label="7. Journey Ends Photo"
                sublabel="What Happens — Step 4"
                currentUrl={content?.problem_scene_4_image}
                uploading={uploadingField === 'problem_scene_4_image'}
                onFileChange={(e) => handleImageUpload(e, 'problem_scene_4_image')}
              />
              <ImageUploadCard
                label="8. Not Accepted Photo"
                sublabel="Top of NO card"
                currentUrl={content?.not_accepted_image}
                uploading={uploadingField === 'not_accepted_image'}
                onFileChange={(e) => handleImageUpload(e, 'not_accepted_image')}
              />
            </div>

            {/* Gallery */}
            <div className="border-t border-gray-800 pt-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">Real Work Gallery</h3>
                  <p className="text-gray-400 text-xs">Collections, sorting, compost batches</p>
                </div>
                <label className="cursor-pointer bg-[#FFB300] text-black font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider hover:bg-[#FFCA28] inline-flex items-center gap-2 w-fit">
                  <Upload className="w-4 h-4" />
                  {uploadingField === 'gallery' ? 'Uploading...' : 'Add Gallery Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleGalleryUpload}
                    disabled={uploadingField === 'gallery'}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(content?.real_work_images || []).map((url: string, idx: number) => (
                  <div key={idx} className="relative aspect-square bg-black rounded-2xl overflow-hidden border border-gray-800 group">
                    <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Text form */}
          <form onSubmit={handleSaveContent} className="bg-[#141414] rounded-3xl p-8 border border-gray-800 space-y-8">
            <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-4">Edit Text & Pricing</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hero Headline Line 1</label>
                <input type="text" name="hero_title_line1" defaultValue={content?.hero_title_line1} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hero Headline Line 2 (Gold)</label>
                <input type="text" name="hero_title_line2" defaultValue={content?.hero_title_line2} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hero Description</label>
              <textarea name="hero_description" rows={3} defaultValue={content?.hero_description} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-gray-800">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Household Price</label>
                <input type="text" name="household_price" defaultValue={content?.household_price} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Apartment Price</label>
                <input type="text" name="apartment_price" defaultValue={content?.apartment_price} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Event Base Price</label>
                <input type="text" name="event_price" defaultValue={content?.event_price} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-4 bg-[#FFB300] text-black font-extrabold text-sm uppercase tracking-wider rounded-xl hover:bg-[#FFCA28] transition-all"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save All Text Changes
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: POINTS */}
      {activeTab === 'points' && (
        <div className="space-y-8">
          <form onSubmit={handleAddPoint} className="bg-[#141414] rounded-3xl p-8 border border-gray-800 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="text-[#FFB300] w-5 h-5" /> Add New Collection Point
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <input required value={newPointName} onChange={(e) => setNewPointName(e.target.value)} placeholder="Point name *" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FFB300]" />
              <input required value={newPointArea} onChange={(e) => setNewPointArea(e.target.value)} placeholder="Area *" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FFB300]" />
              <input value={newPointAddress} onChange={(e) => setNewPointAddress(e.target.value)} placeholder="Full address" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FFB300]" />
            </div>
            <button type="submit" className="px-6 py-3 bg-[#FFB300] text-black font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-[#FFCA28]">
              Add Collection Point
            </button>
          </form>

          <div className="bg-[#141414] rounded-3xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800 font-bold text-white text-lg">Collection Points</div>
            <div className="divide-y divide-gray-800">
              {points.length === 0 && (
                <div className="p-8 text-center text-gray-500">No collection points yet.</div>
              )}
              {points.map((pt) => (
                <div key={pt.id} className="p-6 flex items-center justify-between gap-4 hover:bg-black/30">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">{pt.name}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${pt.is_active ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                        {pt.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs mt-1">{pt.address || pt.area}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => togglePointStatus(pt.id, pt.is_active)} className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-800 text-gray-300 hover:bg-gray-700">
                      {pt.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button type="button" onClick={() => deletePoint(pt.id)} className="p-2 bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl hover:bg-red-800 hover:text-white">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ImageUploadCard({
  label,
  sublabel,
  currentUrl,
  uploading,
  onFileChange,
}: {
  label: string
  sublabel: string
  currentUrl?: string
  uploading: boolean
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="bg-black p-5 rounded-2xl border border-gray-800 space-y-3">
      <div>
        <div className="font-bold text-white text-sm">{label}</div>
        <div className="text-gray-500 text-xs">{sublabel}</div>
      </div>

      <div className="aspect-video bg-[#111] rounded-xl border border-gray-800 overflow-hidden relative flex items-center justify-center">
        {currentUrl ? (
          <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-600 text-xs">No image uploaded</div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#FFB300] animate-spin" />
          </div>
        )}
      </div>

      <label className="cursor-pointer block w-full text-center bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 text-xs font-bold py-2.5 rounded-xl transition-colors">
        {uploading ? 'Uploading...' : 'Choose & Upload Photo'}
        <input type="file" accept="image/*" className="hidden" onChange={onFileChange} disabled={uploading} />
      </label>
    </div>
  )
}