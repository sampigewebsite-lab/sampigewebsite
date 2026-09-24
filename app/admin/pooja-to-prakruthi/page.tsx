'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'
import {
  Loader2, Save, Mail, Settings, MapPin, Upload, Plus,
  Trash2, Image as ImageIcon, Edit2, Calendar, BarChart3
} from 'lucide-react'

export default function PoojaAdminPage() {
  const [activeTab, setActiveTab] = useState<'enquiries' | 'content' | 'points'>('enquiries')
  const [content, setContent] = useState<any>(null)
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [points, setPoints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [editingEnquiry, setEditingEnquiry] = useState<any>(null)

  // Impact stats (universal — same for everyone on the public page)
  const [impact1Value, setImpact1Value] = useState('')
  const [impact1Label, setImpact1Label] = useState('')
  const [impact2Value, setImpact2Value] = useState('')
  const [impact2Label, setImpact2Label] = useState('')
  const [impact3Value, setImpact3Value] = useState('')
  const [impact3Label, setImpact3Label] = useState('')
  const [impact4Value, setImpact4Value] = useState('')
  const [impact4Label, setImpact4Label] = useState('')

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

    // Load universal impact stats into form fields
    const stats = contentData?.impact_stats
    if (Array.isArray(stats) && stats.length > 0) {
      setImpact1Value(stats[0]?.value || '')
      setImpact1Label(stats[0]?.label || '')
      setImpact2Value(stats[1]?.value || '')
      setImpact2Label(stats[1]?.label || '')
      setImpact3Value(stats[2]?.value || '')
      setImpact3Label(stats[2]?.label || '')
      setImpact4Value(stats[3]?.value || '')
      setImpact4Label(stats[3]?.label || '')
    }

    setLoading(false)
  }

  // ─── Image upload ───
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, fieldName: string) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }

    setUploadingField(fieldName)
    const fileExt = file.name.split('.').pop()
    const fileName = `pooja_${fieldName}_${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      toast.error('Upload failed: ' + uploadError.message)
      setUploadingField(null)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName)
    const publicUrl = publicUrlData.publicUrl

    setContent((prev: any) => ({ ...prev, [fieldName]: publicUrl }))
    await supabase.from('pooja_to_prakruthi_content').update({ [fieldName]: publicUrl }).eq('id', 1)

    toast.success('Image uploaded & saved!')
    setUploadingField(null)
    e.target.value = ''
  }

  // ─── Gallery multi-upload ───
  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingField('gallery')
    const fileExt = file.name.split('.').pop()
    const fileName = `pooja_gallery_${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      toast.error('Gallery upload failed')
      setUploadingField(null)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName)
    const publicUrl = publicUrlData.publicUrl
    const currentGallery = content?.real_work_images || []
    const updatedGallery = [...currentGallery, publicUrl]

    setContent((prev: any) => ({ ...prev, real_work_images: updatedGallery }))
    await supabase.from('pooja_to_prakruthi_content').update({ real_work_images: updatedGallery }).eq('id', 1)

    toast.success('Gallery photo added!')
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

  // ─── Save member payment / tracking ───
  async function handleSaveEnquiryDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingEnquiry) return
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    const updates = {
      payment_status: formData.get('payment_status') as string,
      subscription_status: formData.get('subscription_status') as string,
      total_kg_saved: Number(formData.get('total_kg_saved') || 0),
      compost_kg_produced: Number(formData.get('compost_kg_produced') || 0),
      next_due_date: (formData.get('next_due_date') as string) || null,
      admin_notes: formData.get('admin_notes') as string,
    }

    const { error } = await supabase.from('pooja_enquiries').update(updates).eq('id', editingEnquiry.id)

    if (error) toast.error('Failed to update member')
    else {
      toast.success('Member payment & tracking updated!')
      setEditingEnquiry(null)
      fetchData()
    }
    setSaving(false)
  }

  // ─── Save page text, pricing & universal impact ───
  async function handleSaveContent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)

    const impact_stats = [
      { value: impact1Value || '—', label: impact1Label || 'kg Flower Waste Collected' },
      { value: impact2Value || '—', label: impact2Label || 'Households Participating' },
      { value: impact3Value || '—', label: impact3Label || 'Collections Completed' },
      { value: impact4Value || '—', label: impact4Label || 'kg Compost Produced' },
    ]

    const updates = {
      hero_title_line1: formData.get('hero_title_line1'),
      hero_title_line2: formData.get('hero_title_line2'),
      hero_tagline: formData.get('hero_tagline'),
      hero_description: formData.get('hero_description'),
      problem_heading: formData.get('problem_heading'),
      problem_solution_heading: formData.get('problem_solution_heading'),
      problem_solution_text: formData.get('problem_solution_text'),
      household_price: formData.get('household_price'),
      household_note: formData.get('household_note'),
      apartment_price: formData.get('apartment_price'),
      apartment_note: formData.get('apartment_note'),
      event_price: formData.get('event_price'),
      event_note: formData.get('event_note'),
      impact_stats,
    }

    const { error } = await supabase.from('pooja_to_prakruthi_content').update(updates).eq('id', 1)

    if (error) toast.error('Failed to save content')
    else toast.success('Page content, pricing & impact numbers saved! Live on website.')
    setSaving(false)
  }

  // ─── Collection points ───
  async function handleAddPoint(e: React.FormEvent) {
    e.preventDefault()
    if (!newPointName || !newPointArea) {
      toast.error('Name and Area are required')
      return
    }
    await supabase.from('pooja_collection_points').insert([{
      name: newPointName,
      area: newPointArea,
      address: newPointAddress,
      is_active: true,
    }])
    toast.success('Collection point added!')
    setNewPointName('')
    setNewPointArea('')
    setNewPointAddress('')
    fetchData()
  }

  async function togglePointStatus(id: string, current: boolean) {
    await supabase.from('pooja_collection_points').update({ is_active: !current }).eq('id', id)
    fetchData()
  }

  async function deletePoint(id: string) {
    if (!confirm('Delete this collection point?')) return
    await supabase.from('pooja_collection_points').delete().eq('id', id)
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFB300]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />

      <main className="flex-1 overflow-auto p-6 md:p-10 text-gray-200">
        <Toaster position="top-right" />

        <div className="mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Pooja to Prakruthi Admin</h1>
          <p className="text-gray-400 text-sm">
            Members & payments · Page text & photos · Universal impact numbers · Collection points
          </p>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { id: 'enquiries', label: `Members & Payments (${enquiries.length})`, icon: Mail },
            { id: 'content', label: 'Edit Content & Images', icon: Settings },
            { id: 'points', label: `Collection Points (${points.length})`, icon: MapPin },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? 'bg-[#FFB300] text-black shadow-lg shadow-[#FFB300]/20'
                    : 'bg-[#141414] text-gray-400 border border-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* ═══════════════ TAB 1: MEMBERS & PAYMENTS ═══════════════ */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <div className="bg-[#141414] rounded-2xl border border-gray-800 overflow-hidden">
              {enquiries.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No members yet. Form submissions appear here.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-black text-gray-400 uppercase text-xs">
                      <tr>
                        <th className="px-6 py-4">Name & Contact</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Payment</th>
                        <th className="px-6 py-4">Next Due</th>
                        <th className="px-6 py-4">Member kg (optional)</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {enquiries.map((enq) => (
                        <tr key={enq.id} className="hover:bg-black/40">
                          <td className="px-6 py-4">
                            <div className="font-bold text-white">{enq.full_name || enq.contact_person || 'N/A'}</div>
                            <div className="text-[#FFB300] font-mono text-xs">{enq.phone}</div>
                            <div className="text-gray-500 text-xs">{enq.area_locality || ''}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-gray-800 text-[#FFB300] rounded-full text-xs font-bold uppercase">
                              {enq.participation_type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                enq.payment_status === 'Paid'
                                  ? 'bg-green-900/40 text-green-400 border border-green-800'
                                  : enq.payment_status === 'Pending'
                                    ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-800'
                                    : 'bg-red-900/40 text-red-400 border border-red-800'
                              }`}
                            >
                              {enq.payment_status || 'Unpaid'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            {enq.next_due_date ? (
                              <span className="text-amber-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {enq.next_due_date}
                              </span>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <div className="text-white font-bold">{enq.total_kg_saved || 0} kg</div>
                            <div className="text-green-400">{enq.compost_kg_produced || 0} kg compost</div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setEditingEnquiry(enq)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FFB300] text-black rounded-lg text-xs font-bold hover:bg-[#FFCA28]"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Manage Payment
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Member edit modal */}
            {editingEnquiry && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#141414] border border-[#FFB300]/30 rounded-3xl p-6 md:p-8 max-w-xl w-full space-y-5 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Manage Payment & Tracking</h3>
                      <p className="text-xs text-gray-400">
                        {editingEnquiry.full_name || editingEnquiry.contact_person} · {editingEnquiry.phone}
                      </p>
                    </div>
                    <button type="button" onClick={() => setEditingEnquiry(null)} className="text-gray-500 hover:text-white text-xl">
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveEnquiryDetails} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase">Payment Status</label>
                        <select
                          name="payment_status"
                          defaultValue={editingEnquiry.payment_status || 'Unpaid'}
                          className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]"
                        >
                          <option value="Unpaid">Unpaid</option>
                          <option value="Pending">Pending (proof submitted)</option>
                          <option value="Paid">Paid</option>
                          <option value="Waived">Waived</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase">Subscription</label>
                        <select
                          name="subscription_status"
                          defaultValue={editingEnquiry.subscription_status || 'Pending'}
                          className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Active">Active</option>
                          <option value="Expired">Expired</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-400 uppercase">Next Due Date (monthly reminder)</label>
                      <input
                        type="date"
                        name="next_due_date"
                        defaultValue={editingEnquiry.next_due_date || ''}
                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase">Member KG saved (optional notes)</label>
                        <input
                          type="number"
                          step="0.5"
                          name="total_kg_saved"
                          defaultValue={editingEnquiry.total_kg_saved || 0}
                          className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase">Member compost KG</label>
                        <input
                          type="number"
                          step="0.5"
                          name="compost_kg_produced"
                          defaultValue={editingEnquiry.compost_kg_produced || 0}
                          className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-400 uppercase">Admin notes / UTR</label>
                      <textarea
                        name="admin_notes"
                        rows={2}
                        defaultValue={editingEnquiry.admin_notes || ''}
                        placeholder="e.g. Paid GPay 24 Sep · UTR 123..."
                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full py-3.5 bg-[#FFB300] text-black font-extrabold rounded-xl text-sm uppercase hover:bg-[#FFCA28]"
                    >
                      {saving ? 'Saving...' : 'Save Payment & Tracking'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ TAB 2: CONTENT + IMAGES + IMPACT ═══════════════ */}
        {activeTab === 'content' && (
          <div className="space-y-10">

            {/* A) UNIVERSAL IMPACT NUMBERS — THIS IS THE TRACKING THING */}
            <div className="bg-[#141414] rounded-3xl p-6 md:p-8 border border-[#FFB300]/20 space-y-6">
              <div className="flex items-start gap-3">
                <BarChart3 className="w-6 h-6 text-[#FFB300] shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xl font-bold text-white">Universal Impact Numbers (same for everyone)</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    These numbers show on the public Pooja page under “Track Your Impact”. Everyone sees the same totals.
                    Update them when you finish real collections.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 bg-black/40 p-4 rounded-2xl border border-gray-800">
                  <label className="text-xs font-bold text-gray-400 uppercase">Stat 1 — Value</label>
                  <input value={impact1Value} onChange={(e) => setImpact1Value(e.target.value)} placeholder="e.g. 1,250+" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
                  <label className="text-xs font-bold text-gray-400 uppercase">Stat 1 — Label</label>
                  <input value={impact1Label} onChange={(e) => setImpact1Label(e.target.value)} placeholder="kg Flower Waste Collected" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
                </div>
                <div className="space-y-2 bg-black/40 p-4 rounded-2xl border border-gray-800">
                  <label className="text-xs font-bold text-gray-400 uppercase">Stat 2 — Value</label>
                  <input value={impact2Value} onChange={(e) => setImpact2Value(e.target.value)} placeholder="e.g. 350+" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
                  <label className="text-xs font-bold text-gray-400 uppercase">Stat 2 — Label</label>
                  <input value={impact2Label} onChange={(e) => setImpact2Label(e.target.value)} placeholder="Households Participating" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
                </div>
                <div className="space-y-2 bg-black/40 p-4 rounded-2xl border border-gray-800">
                  <label className="text-xs font-bold text-gray-400 uppercase">Stat 3 — Value</label>
                  <input value={impact3Value} onChange={(e) => setImpact3Value(e.target.value)} placeholder="e.g. 25+" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
                  <label className="text-xs font-bold text-gray-400 uppercase">Stat 3 — Label</label>
                  <input value={impact3Label} onChange={(e) => setImpact3Label(e.target.value)} placeholder="Collections Completed" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
                </div>
                <div className="space-y-2 bg-black/40 p-4 rounded-2xl border border-gray-800">
                  <label className="text-xs font-bold text-gray-400 uppercase">Stat 4 — Value</label>
                  <input value={impact4Value} onChange={(e) => setImpact4Value(e.target.value)} placeholder="e.g. 450+" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
                  <label className="text-xs font-bold text-gray-400 uppercase">Stat 4 — Label</label>
                  <input value={impact4Label} onChange={(e) => setImpact4Label(e.target.value)} placeholder="kg Compost Produced" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
                </div>
              </div>
              <p className="text-xs text-gray-500">Click <strong className="text-white">Save All Content</strong> at the bottom to publish these numbers on the website.</p>
            </div>

            {/* B) IMAGE UPLOADS */}
            <div className="bg-[#141414] rounded-3xl p-6 md:p-8 border border-gray-800 space-y-6">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-[#FFB300]" />
                <div>
                  <h2 className="text-xl font-bold text-white">Upload Section Photographs</h2>
                  <p className="text-gray-400 text-sm">Photos appear on the live Pooja to Prakruthi page after upload.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                <ImageUploadCard label="1. Hero Side Photo" sublabel="Right side of hero" currentUrl={content?.hero_side_image} uploading={uploadingField === 'hero_side_image'} onFileChange={(e) => handleImageUpload(e, 'hero_side_image')} />
                <ImageUploadCard label="2. Solution Photo" sublabel="Solution section" currentUrl={content?.solution_image} uploading={uploadingField === 'solution_image'} onFileChange={(e) => handleImageUpload(e, 'solution_image')} />
                <ImageUploadCard label="3. Accepted Flowers" sublabel="YES card top" currentUrl={content?.accepted_image} uploading={uploadingField === 'accepted_image'} onFileChange={(e) => handleImageUpload(e, 'accepted_image')} />
                <ImageUploadCard label="4. Offered With Devotion" sublabel="What Happens Step 1" currentUrl={content?.problem_scene_1_image} uploading={uploadingField === 'problem_scene_1_image'} onFileChange={(e) => handleImageUpload(e, 'problem_scene_1_image')} />
                <ImageUploadCard label="5. Pooja Ends" sublabel="What Happens Step 2" currentUrl={content?.problem_scene_2_image} uploading={uploadingField === 'problem_scene_2_image'} onFileChange={(e) => handleImageUpload(e, 'problem_scene_2_image')} />
                <ImageUploadCard label="6. Mixed Waste" sublabel="What Happens Step 3" currentUrl={content?.problem_scene_3_image} uploading={uploadingField === 'problem_scene_3_image'} onFileChange={(e) => handleImageUpload(e, 'problem_scene_3_image')} />
                <ImageUploadCard label="7. Journey Ends" sublabel="What Happens Step 4" currentUrl={content?.problem_scene_4_image} uploading={uploadingField === 'problem_scene_4_image'} onFileChange={(e) => handleImageUpload(e, 'problem_scene_4_image')} />
                <ImageUploadCard label="8. Not Accepted Photo" sublabel="NO card top" currentUrl={content?.not_accepted_image} uploading={uploadingField === 'not_accepted_image'} onFileChange={(e) => handleImageUpload(e, 'not_accepted_image')} />
              </div>

              {/* Gallery */}
              <div className="border-t border-gray-800 pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">Real Work Gallery</h3>
                    <p className="text-gray-400 text-xs">Collection → sorting → compost photos</p>
                  </div>
                  <label className="cursor-pointer bg-[#FFB300] text-black font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider hover:bg-[#FFCA28] inline-flex items-center gap-2 w-fit">
                    <Upload className="w-4 h-4" />
                    {uploadingField === 'gallery' ? 'Uploading...' : 'Add Gallery Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} disabled={uploadingField === 'gallery'} />
                  </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(content?.real_work_images || []).map((url: string, idx: number) => (
                    <div key={idx} className="relative aspect-square bg-black rounded-2xl overflow-hidden border border-gray-800 group">
                      <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* C) TEXT + PRICING */}
            <form onSubmit={handleSaveContent} className="bg-[#141414] rounded-3xl p-6 md:p-8 border border-gray-800 space-y-8">
              <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-4">Edit Page Text & Pricing</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Hero Title Line 1</label>
                  <input name="hero_title_line1" defaultValue={content?.hero_title_line1} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Hero Title Line 2 (gold)</label>
                  <input name="hero_title_line2" defaultValue={content?.hero_title_line2} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">Hero Tagline</label>
                <input name="hero_tagline" defaultValue={content?.hero_tagline} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">Hero Description</label>
                <textarea name="hero_description" rows={3} defaultValue={content?.hero_description} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">Problem Section Heading</label>
                <input name="problem_heading" defaultValue={content?.problem_heading} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">Solution Heading</label>
                <input name="problem_solution_heading" defaultValue={content?.problem_solution_heading} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">Solution Text</label>
                <textarea name="problem_solution_text" rows={3} defaultValue={content?.problem_solution_text} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
              </div>

              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Pricing</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Household Price</label>
                    <input name="household_price" defaultValue={content?.household_price} placeholder="₹300" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
                    <input name="household_note" defaultValue={content?.household_note} placeholder="Up to 30 kg / month" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-[#FFB300]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Apartment Price</label>
                    <input name="apartment_price" defaultValue={content?.apartment_price} placeholder="₹100" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
                    <input name="apartment_note" defaultValue={content?.apartment_note} placeholder="/ flat / month" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-[#FFB300]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Event Price</label>
                    <input name="event_price" defaultValue={content?.event_price} placeholder="₹200" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
                    <input name="event_note" defaultValue={content?.event_note} placeholder="up to 10 kg" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-[#FFB300]" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-4 bg-[#FFB300] text-black font-extrabold rounded-xl text-sm uppercase tracking-wider hover:bg-[#FFCA28]"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save All Content (Text + Pricing + Impact Numbers)
              </button>
            </form>
          </div>
        )}

        {/* ═══════════════ TAB 3: COLLECTION POINTS ═══════════════ */}
        {activeTab === 'points' && (
          <div className="space-y-8">
            <form onSubmit={handleAddPoint} className="bg-[#141414] rounded-3xl p-6 md:p-8 border border-gray-800 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="text-[#FFB300] w-5 h-5" /> Add Collection Point
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <input required value={newPointName} onChange={(e) => setNewPointName(e.target.value)} placeholder="Name e.g. Sampige – Malleshwaram *" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
                <input required value={newPointArea} onChange={(e) => setNewPointArea(e.target.value)} placeholder="Area e.g. Malleshwaram *" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
                <input value={newPointAddress} onChange={(e) => setNewPointAddress(e.target.value)} placeholder="Full address" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFB300]" />
              </div>
              <button type="submit" className="px-6 py-3 bg-[#FFB300] text-black font-bold text-sm uppercase rounded-xl hover:bg-[#FFCA28]">
                Add Point
              </button>
            </form>

            <div className="bg-[#141414] rounded-3xl border border-gray-800 overflow-hidden">
              <div className="p-5 border-b border-gray-800 font-bold text-white">All Collection Points</div>
              <div className="divide-y divide-gray-800">
                {points.length === 0 && <div className="p-8 text-center text-gray-500">No points yet.</div>}
                {points.map((pt) => (
                  <div key={pt.id} className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        {pt.name}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${pt.is_active ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                          {pt.is_active ? 'Active' : 'Off'}
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs mt-1">{pt.address || pt.area}</div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => togglePointStatus(pt.id, pt.is_active)} className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-800 text-gray-300">
                        {pt.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button type="button" onClick={() => deletePoint(pt.id)} className="p-2 bg-red-900/30 text-red-400 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
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
    <div className="bg-black p-4 rounded-2xl border border-gray-800 space-y-3">
      <div>
        <div className="font-bold text-white text-sm">{label}</div>
        <div className="text-gray-500 text-xs">{sublabel}</div>
      </div>
      <div className="aspect-video bg-[#111] rounded-xl border border-gray-800 overflow-hidden relative flex items-center justify-center">
        {currentUrl ? (
          <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-600 text-xs">No image</div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#FFB300] animate-spin" />
          </div>
        )}
      </div>
      <label className="cursor-pointer block w-full text-center bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 text-xs font-bold py-2.5 rounded-xl">
        {uploading ? 'Uploading...' : 'Choose & Upload Photo'}
        <input type="file" accept="image/*" className="hidden" onChange={onFileChange} disabled={uploading} />
      </label>
    </div>
  )
}