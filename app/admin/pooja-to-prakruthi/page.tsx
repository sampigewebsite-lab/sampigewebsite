'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import { Loader2, Save, Mail, Settings, MapPin, Upload, Plus,Flower2, Trash2, CheckCircle2, XCircle, Image as ImageIcon } from 'lucide-react'

export default function PoojaAdminPage() {
  const [activeTab, setActiveTab] = useState<'enquiries' | 'content' | 'points'>('enquiries')
  const [content, setContent] = useState<any>(null)
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [points, setPoints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  // New Collection Point Form State
  const [newPointName, setNewPointName] = useState('')
  const [newPointArea, setNewPointArea] = useState('')
  const [newPointAddress, setNewPointAddress] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    // 1. Fetch Enquiries
    const { data: enqData } = await supabase
      .from('pooja_enquiries')
      .select('*')
      .order('created_at', { ascending: false })

    // 2. Fetch Content
    const { data: contentData } = await supabase
      .from('pooja_to_prakruthi_content')
      .select('*')
      .eq('id', 1)
      .single()

    // 3. Fetch Collection Points
    const { data: pointsData } = await supabase
      .from('pooja_collection_points')
      .select('*')
      .order('display_order', { ascending: true })

    setEnquiries(enqData || [])
    setContent(contentData || {})
    setPoints(pointsData || [])
    setLoading(false)
  }

  // Handle single image upload to Supabase Storage
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, fieldName: string) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingField(fieldName)
    const fileExt = file.name.split('.').pop()
    const fileName = `pooja_${fieldName}_${Date.now()}.${fileExt}`
    const filePath = `media/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      toast.error('Failed to upload image')
      setUploadingField(null)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    const publicUrl = publicUrlData.publicUrl

    // Update state & save immediately
    setContent((prev: any) => ({ ...prev, [fieldName]: publicUrl }))

    const { error: updateError } = await supabase
      .from('pooja_to_prakruthi_content')
      .update({ [fieldName]: publicUrl })
      .eq('id', 1)

    if (updateError) {
      toast.error('Failed to update content field')
    } else {
      toast.success('Image uploaded and saved!')
    }
    setUploadingField(null)
  }

  // Handle adding new gallery image
  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingField('gallery')
    const fileExt = file.name.split('.').pop()
    const fileName = `pooja_gallery_${Date.now()}.${fileExt}`
    const filePath = `media/${fileName}`

    const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file, { upsert: true })

    if (uploadError) {
      toast.error('Failed to upload gallery image')
      setUploadingField(null)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath)
    const publicUrl = publicUrlData.publicUrl

    const currentGallery = content?.real_work_images || []
    const updatedGallery = [...currentGallery, publicUrl]

    setContent((prev: any) => ({ ...prev, real_work_images: updatedGallery }))

    await supabase.from('pooja_to_prakruthi_content').update({ real_work_images: updatedGallery }).eq('id', 1)
    toast.success('Gallery photo added!')
    setUploadingField(null)
  }

  // Delete image from gallery
  async function removeGalleryImage(index: number) {
    const currentGallery = content?.real_work_images || []
    const updatedGallery = currentGallery.filter((_: any, i: number) => i !== index)
    
    setContent((prev: any) => ({ ...prev, real_work_images: updatedGallery }))
    await supabase.from('pooja_to_prakruthi_content').update({ real_work_images: updatedGallery }).eq('id', 1)
    toast.success('Photo removed')
  }

  // Save Content Text Form
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

    if (error) {
      toast.error('Failed to save content')
    } else {
      toast.success('Text changes saved successfully!')
    }
    setSaving(false)
  }

  // Add Collection Point
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
      is_active: true
    }])

    if (error) {
      toast.error('Failed to add collection point')
    } else {
      toast.success('Collection point added!')
      setNewPointName('')
      setNewPointArea('')
      setNewPointAddress('')
      fetchData()
    }
  }

  // Toggle Collection Point Active Status
  async function togglePointStatus(id: string, currentStatus: boolean) {
    await supabase.from('pooja_collection_points').update({ is_active: !currentStatus }).eq('id', id)
    toast.success('Status updated')
    fetchData()
  }

  // Delete Collection Point
  async function deletePoint(id: string) {
    if (!confirm('Are you sure you want to delete this collection point?')) return
    await supabase.from('pooja_collection_points').delete().eq('id', id)
    toast.success('Collection point deleted')
    fetchData()
  }

  if (loading) return <div className="p-10 text-white flex justify-center"><Loader2 className="animate-spin text-[#FFB300]" /></div>

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto text-gray-200">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Pooja to Prakruthi Admin</h1>
          <p className="text-gray-400 text-sm">Manage flower recycling content, real photographs, collection points, and visitor requests.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'enquiries' ? 'bg-[#FFB300] text-black shadow-lg shadow-[#FFB300]/20' : 'bg-[#141414] text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <Mail className="w-4 h-4" /> Form Enquiries ({enquiries.length})
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'content' ? 'bg-[#FFB300] text-black shadow-lg shadow-[#FFB300]/20' : 'bg-[#141414] text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <Settings className="w-4 h-4" /> Edit Content & Images
        </button>

        <button
          onClick={() => setActiveTab('points')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'points' ? 'bg-[#FFB300] text-black shadow-lg shadow-[#FFB300]/20' : 'bg-[#141414] text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <MapPin className="w-4 h-4" /> Collection Points ({points.length})
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB 1: ENQUIRIES
          ═══════════════════════════════════════════════════════════ */}
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
                    <th className="px-6 py-4">Area & Collection Point</th>
                    <th className="px-6 py-4">Est. Volume</th>
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
                        <div className="font-bold text-white text-base">{enq.full_name || enq.contact_person || 'N/A'}</div>
                        <div className="text-[#FFB300] font-mono text-xs">{enq.phone}</div>
                        <div className="text-gray-500 text-xs">{enq.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-800 text-[#FFB300] rounded-full text-xs font-bold uppercase tracking-wider">
                          {enq.participation_type}
                        </span>
                        {enq.contact_role && <div className="text-[10px] text-gray-500 mt-1">{enq.contact_role}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{enq.area_locality || enq.venue_location || 'N/A'}</div>
                        {enq.admin_notes && <div className="text-xs text-amber-400 mt-0.5">{enq.admin_notes}</div>}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-300">
                        {enq.estimated_volume || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400 max-w-xs">
                        {enq.apartment_name && <div className="text-white font-semibold">{enq.apartment_name} ({enq.flats_participating} flats)</div>}
                        {enq.event_type && <div className="text-white font-semibold">{enq.event_type} ({enq.event_date})</div>}
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

      {/* ═══════════════════════════════════════════════════════════
          TAB 2: EDIT CONTENT & IMAGES
          ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'content' && (
        <div className="space-y-10">
          
          {/* IMAGE UPLOAD SECTION */}
          <div className="bg-[#141414] rounded-3xl p-8 border border-gray-800 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <ImageIcon className="text-[#FFB300] w-6 h-6" /> Upload Real Section Photographs
              </h2>
              <p className="text-gray-400 text-sm">Upload real photos for each section of the Pooja to Prakruthi page. They update on the website immediately!</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Image 1: Hero Side Image */}
              <ImageUploadCard
                label="1. Hero Side Photo"
                sublabel="Fresh or used pooja flowers"
                fieldName="hero_side_image"
                currentUrl={content?.hero_side_image}
                uploading={uploadingField === 'hero_side_image'}
                onFileChange={(e) => handleImageUpload(e, 'hero_side_image')}
              />

              {/* Image 2: Solution Image */}
              <ImageUploadCard
                label="2. Solution Photo"
                sublabel="Sampige composting process"
                fieldName="solution_image"
                currentUrl={content?.solution_image}
                uploading={uploadingField === 'solution_image'}
                onFileChange={(e) => handleImageUpload(e, 'solution_image')}
              />

              {/* Image 3: Accepted Items Photo */}
              <ImageUploadCard
                label="3. Accepted Flowers Photo"
                sublabel="Marigolds, roses, garlands"
                fieldName="accepted_image"
                currentUrl={content?.accepted_image}
                uploading={uploadingField === 'accepted_image'}
                onFileChange={(e) => handleImageUpload(e, 'accepted_image')}
              />

              {/* Problem Scene 1 */}
              <ImageUploadCard
                label="4. Offered With Devotion"
                sublabel="Pooja flowers on altar"
                fieldName="problem_scene_1_image"
                currentUrl={content?.problem_scene_1_image}
                uploading={uploadingField === 'problem_scene_1_image'}
                onFileChange={(e) => handleImageUpload(e, 'problem_scene_1_image')}
              />

              {/* Problem Scene 2 */}
              <ImageUploadCard
                label="5. Pooja Ends Photo"
                sublabel="Flowers removed from altar"
                fieldName="problem_scene_2_image"
                currentUrl={content?.problem_scene_2_image}
                uploading={uploadingField === 'problem_scene_2_image'}
                onFileChange={(e) => handleImageUpload(e, 'problem_scene_2_image')}
              />

              {/* Problem Scene 3 */}
              <ImageUploadCard
                label="6. Mixed Waste Photo"
                sublabel="Flowers mixed in dustbin"
                fieldName="problem_scene_3_image"
                currentUrl={content?.problem_scene_3_image}
                uploading={uploadingField === 'problem_scene_3_image'}
                onFileChange={(e) => handleImageUpload(e, 'problem_scene_3_image')}
              />

            </div>

            {/* REAL WORK GALLERY MULTI-PHOTO UPLOAD */}
            <div className="border-t border-gray-800 pt-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Real Work Gallery Photographs</h3>
                  <p className="text-gray-400 text-xs">Add photos of actual Sampige collections, sorting, and compost batches.</p>
                </div>
                <label className="cursor-pointer bg-[#FFB300] text-black font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider hover:bg-[#FFCA28] flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Add Gallery Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} disabled={uploadingField === 'gallery'} />
                </label>
              </div>

              {uploadingField === 'gallery' && <p className="text-[#FFB300] text-xs animate-pulse">Uploading photo...</p>}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                {(content?.real_work_images || []).map((url: string, idx: number) => (
                  <div key={idx} className="relative aspect-square bg-black rounded-2xl overflow-hidden border border-gray-800 group">
                    <img src={url} alt={`Gallery ${idx+1}`} className="w-full h-full object-cover" />
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

          {/* TEXT CONTENT EDIT FORM */}
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

      {/* ═══════════════════════════════════════════════════════════
          TAB 3: COLLECTION POINTS MANAGER
          ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'points' && (
        <div className="space-y-8">
          
          {/* Add New Point Form */}
          <form onSubmit={handleAddPoint} className="bg-[#141414] rounded-3xl p-8 border border-gray-800 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="text-[#FFB300] w-5 h-5" /> Add New Collection Point
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Point Name *</label>
                <input required type="text" value={newPointName} onChange={(e) => setNewPointName(e.target.value)} placeholder="e.g. Sampige – Malleshwaram" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Area / Locality *</label>
                <input required type="text" value={newPointArea} onChange={(e) => setNewPointArea(e.target.value)} placeholder="e.g. Malleshwaram" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Address</label>
                <input type="text" value={newPointAddress} onChange={(e) => setNewPointAddress(e.target.value)} placeholder="e.g. 18th Cross, Malleshwaram" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
              </div>
            </div>

            <button type="submit" className="px-6 py-3 bg-[#FFB300] text-black font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-[#FFCA28]">
              Add Collection Point
            </button>
          </form>

          {/* List of Collection Points */}
          <div className="bg-[#141414] rounded-3xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800 font-bold text-white text-lg">Active Collection Points</div>
            <div className="divide-y divide-gray-800">
              {points.map((pt) => (
                <div key={pt.id} className="p-6 flex items-center justify-between gap-4 hover:bg-black/30">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-base">{pt.name}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${pt.is_active ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-red-900/40 text-red-400 border border-red-800'}`}>
                        {pt.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs mt-1">{pt.address || pt.area}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => togglePointStatus(pt.id, pt.is_active)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        pt.is_active ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-green-600 text-white hover:bg-green-500'
                      }`}
                    >
                      {pt.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePoint(pt.id)}
                      className="p-2 bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl hover:bg-red-800 hover:text-white transition-colors"
                    >
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

// Single Image Upload Card Helper Component
function ImageUploadCard({ label, sublabel, fieldName, currentUrl, uploading, onFileChange }: {
  label: string
  sublabel: string
  fieldName: string
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
      </div>

      <label className="cursor-pointer block w-full text-center bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 text-xs font-bold py-2.5 rounded-xl transition-colors">
        {uploading ? 'Uploading...' : 'Choose & Upload Photo'}
        <input type="file" accept="image/*" className="hidden" onChange={onFileChange} disabled={uploading} />
      </label>
    </div>
  )
}