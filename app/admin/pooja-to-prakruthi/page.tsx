'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import {
  Loader2, Save, Mail, Settings, MapPin, Upload, Plus,
  Trash2, Image as ImageIcon, Edit2, CheckCircle2, DollarSign, Scale
} from 'lucide-react'

export default function PoojaAdminPage() {
  const [activeTab, setActiveTab] = useState<'enquiries' | 'content' | 'points'>('enquiries')
  const [content, setContent] = useState<any>(null)
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [points, setPoints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  // Selected enquiry for editing payment & impact
  const [editingEnquiry, setEditingEnquiry] = useState<any>(null)

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

  // Handle image upload
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, fieldName: string) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingField(fieldName)
    const fileExt = file.name.split('.').pop()
    const fileName = `pooja_${fieldName}_${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`)
      setUploadingField(null)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName)
    const publicUrl = publicUrlData.publicUrl

    setContent((prev: any) => ({ ...prev, [fieldName]: publicUrl }))

    await supabase.from('pooja_to_prakruthi_content').update({ [fieldName]: publicUrl }).eq('id', 1)
    toast.success('Image uploaded!')
    setUploadingField(null)
  }

  // Save Member Payment & Impact Details
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
      admin_notes: formData.get('admin_notes') as string,
    }

    const { error } = await supabase
      .from('pooja_enquiries')
      .update(updates)
      .eq('id', editingEnquiry.id)

    if (error) {
      toast.error('Failed to update member details')
    } else {
      toast.success('Member payment & impact details updated!')
      setEditingEnquiry(null)
      fetchData()
    }
    setSaving(false)
  }

  // Save Content Form
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
    }

    await supabase.from('pooja_to_prakruthi_content').update(updates).eq('id', 1)
    toast.success('Saved content changes!')
    setSaving(false)
  }

  // Add Collection Point
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

  async function togglePointStatus(id: string, currentStatus: boolean) {
    await supabase.from('pooja_collection_points').update({ is_active: !currentStatus }).eq('id', id)
    fetchData()
  }

  async function deletePoint(id: string) {
    if (!confirm('Delete this collection point?')) return
    await supabase.from('pooja_collection_points').delete().eq('id', id)
    fetchData()
  }

  if (loading) {
    return <div className="p-10 text-white flex justify-center"><Loader2 className="animate-spin text-[#FFB300]" /></div>
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto text-gray-200">
      <Toaster position="top-right" />

      <div className="mb-8 border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Pooja to Prakruthi Admin</h1>
        <p className="text-gray-400 text-sm">
          Manage member subscriptions, payment status, flower kilograms collected, real photographs, and collection points.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { id: 'enquiries', label: `Members & Enquiries (${enquiries.length})`, icon: Mail },
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

      {/* ═══════════════════════════════════════════════════════════
          TAB 1: ENQUIRIES, PAYMENTS & IMPACT TRACKING
          ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'enquiries' && (
        <div className="space-y-6">
          <div className="bg-[#141414] rounded-2xl border border-gray-800 overflow-hidden">
            {enquiries.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No members or enquiries received yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-black text-gray-400 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Name & Contact</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Payment</th>
                      <th className="px-6 py-4">Flower Waste Saved</th>
                      <th className="px-6 py-4">Action</th>
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
                          <div className="text-gray-500 text-xs">{enq.area_locality || 'Bangalore'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-800 text-[#FFB300] rounded-full text-xs font-bold uppercase">
                            {enq.participation_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                            enq.payment_status === 'Paid' ? 'bg-green-900/40 text-green-400 border border-green-800' :
                            enq.payment_status === 'Pending' ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-800' :
                            'bg-red-900/40 text-red-400 border border-red-800'
                          }`}>
                            {enq.payment_status || 'Unpaid'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white text-base">{enq.total_kg_saved || 0} kg</div>
                          <div className="text-xs text-green-400">{enq.compost_kg_produced || 0} kg compost</div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setEditingEnquiry(enq)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFB300] text-black rounded-lg text-xs font-bold hover:bg-[#FFCA28]"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit Payment & Impact
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* EDIT MEMBER PAYMENT & IMPACT MODAL */}
          {editingEnquiry && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#141414] border border-[#FFB300]/30 rounded-3xl p-6 md:p-8 max-w-xl w-full text-left space-y-6 shadow-2xl">
                <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Update Member Details</h3>
                    <p className="text-xs text-gray-400">{editingEnquiry.full_name} · {editingEnquiry.phone}</p>
                  </div>
                  <button onClick={() => setEditingEnquiry(null)} className="text-gray-500 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSaveEnquiryDetails} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-400 uppercase">Payment Status</label>
                      <select name="payment_status" defaultValue={editingEnquiry.payment_status || 'Unpaid'} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none text-sm">
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Waived">Waived</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-400 uppercase">Subscription Status</label>
                      <select name="subscription_status" defaultValue={editingEnquiry.subscription_status || 'Pending'} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none text-sm">
                        <option value="Pending">Pending</option>
                        <option value="Active">Active</option>
                        <option value="Expired">Expired</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-400 uppercase">Total Flower Waste Saved (KG)</label>
                      <input type="number" step="0.5" name="total_kg_saved" defaultValue={editingEnquiry.total_kg_saved || 0} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none text-sm" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-400 uppercase">Compost Produced (KG)</label>
                      <input type="number" step="0.5" name="compost_kg_produced" defaultValue={editingEnquiry.compost_kg_produced || 0} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none text-sm" />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Admin Notes / Receipt Ref</label>
                    <textarea name="admin_notes" rows={2} defaultValue={editingEnquiry.admin_notes || ''} placeholder="e.g. Paid via GPay on 24th Sept" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none text-sm" />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-800">
                    <button type="submit" disabled={saving} className="flex-1 bg-[#FFB300] text-black font-extrabold py-3.5 rounded-xl hover:bg-[#FFCA28] text-sm uppercase">
                      {saving ? 'Saving...' : 'Save & Publish Impact'}
                    </button>
                    <button type="button" onClick={() => setEditingEnquiry(null)} className="px-5 bg-gray-800 text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-700">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONTENT & IMAGES */}
      {activeTab === 'content' && (
        <div className="space-y-10">
          <div className="bg-[#141414] rounded-3xl p-8 border border-gray-800 space-y-8">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <ImageIcon className="text-[#FFB300] w-6 h-6" /> Section Photographs
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ImageUploadCard label="1. Hero Side Photo" sublabel="Main hero right image" currentUrl={content?.hero_side_image} uploading={uploadingField === 'hero_side_image'} onFileChange={(e) => handleImageUpload(e, 'hero_side_image')} />
              <ImageUploadCard label="2. Solution Photo" sublabel="Composting process" currentUrl={content?.solution_image} uploading={uploadingField === 'solution_image'} onFileChange={(e) => handleImageUpload(e, 'solution_image')} />
              <ImageUploadCard label="3. Accepted Flowers" sublabel="Top of YES card" currentUrl={content?.accepted_image} uploading={uploadingField === 'accepted_image'} onFileChange={(e) => handleImageUpload(e, 'accepted_image')} />
              <ImageUploadCard label="4. Offered With Devotion" sublabel="Step 1 photo" currentUrl={content?.problem_scene_1_image} uploading={uploadingField === 'problem_scene_1_image'} onFileChange={(e) => handleImageUpload(e, 'problem_scene_1_image')} />
              <ImageUploadCard label="5. Pooja Ends Photo" sublabel="Step 2 photo" currentUrl={content?.problem_scene_2_image} uploading={uploadingField === 'problem_scene_2_image'} onFileChange={(e) => handleImageUpload(e, 'problem_scene_2_image')} />
              <ImageUploadCard label="6. Mixed Waste Photo" sublabel="Step 3 photo" currentUrl={content?.problem_scene_3_image} uploading={uploadingField === 'problem_scene_3_image'} onFileChange={(e) => handleImageUpload(e, 'problem_scene_3_image')} />
            </div>
          </div>

          <form onSubmit={handleSaveContent} className="bg-[#141414] rounded-3xl p-8 border border-gray-800 space-y-8">
            <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-4">Edit Text & Pricing</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase">Hero Headline Line 1</label>
                <input type="text" name="hero_title_line1" defaultValue={content?.hero_title_line1} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase">Hero Headline Line 2 (Gold)</label>
                <input type="text" name="hero_title_line2" defaultValue={content?.hero_title_line2} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="px-8 py-4 bg-[#FFB300] text-black font-extrabold text-sm uppercase tracking-wider rounded-xl hover:bg-[#FFCA28]">
              {saving ? 'Saving...' : 'Save All Text Changes'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: POINTS */}
      {activeTab === 'points' && (
        <div className="space-y-8">
          <form onSubmit={handleAddPoint} className="bg-[#141414] rounded-3xl p-8 border border-gray-800 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="text-[#FFB300] w-5 h-5" /> Add Collection Point
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
            <div className="p-6 border-b border-gray-800 font-bold text-white text-lg">Active Points</div>
            <div className="divide-y divide-gray-800">
              {points.map((pt) => (
                <div key={pt.id} className="p-6 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white">{pt.name}</div>
                    <div className="text-gray-400 text-xs mt-1">{pt.address || pt.area}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => togglePointStatus(pt.id, pt.is_active)} className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-800 text-gray-300">
                      {pt.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => deletePoint(pt.id)} className="p-2 bg-red-900/30 text-red-400 rounded-xl">
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

function ImageUploadCard({ label, sublabel, currentUrl, uploading, onFileChange }: {
  label: string; sublabel: string; currentUrl?: string; uploading: boolean; onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="bg-black p-5 rounded-2xl border border-gray-800 space-y-3">
      <div>
        <div className="font-bold text-white text-sm">{label}</div>
        <div className="text-gray-500 text-xs">{sublabel}</div>
      </div>
      <div className="aspect-video bg-[#111] rounded-xl border border-gray-800 overflow-hidden relative flex items-center justify-center">
        {currentUrl ? <img src={currentUrl} alt={label} className="w-full h-full object-cover" /> : <div className="text-gray-600 text-xs">No image</div>}
      </div>
      <label className="cursor-pointer block w-full text-center bg-gray-900 border border-gray-700 text-gray-300 text-xs font-bold py-2.5 rounded-xl">
        {uploading ? 'Uploading...' : 'Choose & Upload Photo'}
        <input type="file" accept="image/*" className="hidden" onChange={onFileChange} disabled={uploading} />
      </label>
    </div>
  )
}