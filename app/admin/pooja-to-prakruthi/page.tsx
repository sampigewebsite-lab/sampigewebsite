'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'
import {
  Loader2, Save, Mail, Settings, MapPin, Upload, Plus,
  Trash2, Image as ImageIcon, Edit2, Calendar
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

    setUploadingField(fieldName)
    const fileExt = file.name.split('.').pop()
    const fileName = `pooja_${fieldName}_${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from('media').upload(fileName, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      toast.error('Upload failed')
      setUploadingField(null)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName)
    const publicUrl = publicUrlData.publicUrl

    setContent((prev: any) => ({ ...prev, [fieldName]: publicUrl }))
    await supabase.from('pooja_to_prakruthi_content').update({ [fieldName]: publicUrl }).eq('id', 1)
    
    toast.success('Image saved!')
    setUploadingField(null)
    e.target.value = ''
  }

  async function handleSaveEnquiryDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingEnquiry) return

    setSaving(true)
    const formData = new FormData(e.currentTarget)
    
    const updates = {
      payment_status: formData.get('payment_status'),
      subscription_status: formData.get('subscription_status'),
      total_kg_saved: Number(formData.get('total_kg_saved') || 0),
      compost_kg_produced: Number(formData.get('compost_kg_produced') || 0),
      next_due_date: formData.get('next_due_date') || null,
      admin_notes: formData.get('admin_notes'),
    }

    const { error } = await supabase.from('pooja_enquiries').update(updates).eq('id', editingEnquiry.id)

    if (error) toast.error('Failed to update details')
    else {
      toast.success('Member details updated!')
      setEditingEnquiry(null)
      fetchData()
    }
    setSaving(false)
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
    }

    await supabase.from('pooja_to_prakruthi_content').update(updates).eq('id', 1)
    toast.success('Content saved!')
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#FFB300]" /></div>

  return (
    <div className="min-h-screen bg-black flex">
      {/* SIDEBAR WRAPPER FIXED HERE */}
      <Sidebar />
      
      <main className="flex-1 overflow-auto p-6 md:p-10 text-gray-200">
        <Toaster position="top-right" />

        <div className="mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Pooja to Prakruthi Admin</h1>
          <p className="text-gray-400 text-sm">Manage member subscriptions, payment status, tracking, and website content.</p>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button onClick={() => setActiveTab('enquiries')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'enquiries' ? 'bg-[#FFB300] text-black' : 'bg-[#141414] text-gray-400 border border-gray-800'}`}>
            <Mail className="w-4 h-4" /> Members & Payments ({enquiries.length})
          </button>
          <button onClick={() => setActiveTab('content')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'content' ? 'bg-[#FFB300] text-black' : 'bg-[#141414] text-gray-400 border border-gray-800'}`}>
            <Settings className="w-4 h-4" /> Edit Content
          </button>
        </div>

        {/* TAB 1: MEMBERS & PAYMENTS */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <div className="bg-[#141414] rounded-2xl border border-gray-800 overflow-hidden">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-black text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Name & Contact</th>
                    <th className="px-6 py-4">Status & Renewal</th>
                    <th className="px-6 py-4">Impact Tracking</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {enquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-black/40">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-base">{enq.full_name || enq.contact_person}</div>
                        <div className="text-gray-400 text-xs">{enq.phone} • {enq.participation_type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${enq.payment_status === 'Paid' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                            {enq.payment_status || 'Unpaid'}
                          </span>
                        </div>
                        {enq.next_due_date && <div className="text-xs text-amber-400 flex items-center gap-1"><Calendar className="w-3 h-3"/> Due: {enq.next_due_date}</div>}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="text-white font-bold">{enq.total_kg_saved || 0} kg saved</div>
                        <div className="text-green-400">{enq.compost_kg_produced || 0} kg compost</div>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => setEditingEnquiry(enq)} className="px-4 py-2 bg-[#FFB300] text-black rounded-lg text-xs font-bold hover:bg-[#FFCA28] flex items-center gap-2">
                          <Edit2 className="w-3.5 h-3.5" /> Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* EDIT MEMBER MODAL */}
            {editingEnquiry && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#141414] border border-[#FFB300]/30 rounded-3xl p-6 md:p-8 max-w-xl w-full space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Manage Member</h3>
                      <p className="text-xs text-gray-400">{editingEnquiry.full_name} • {editingEnquiry.phone}</p>
                    </div>
                    <button onClick={() => setEditingEnquiry(null)} className="text-gray-500 hover:text-white">✕</button>
                  </div>

                  <form onSubmit={handleSaveEnquiryDetails} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase">Payment Status</label>
                        <select name="payment_status" defaultValue={editingEnquiry.payment_status || 'Unpaid'} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none text-sm">
                          <option value="Unpaid">Unpaid</option>
                          <option value="Pending">Pending (Reviewing Proof)</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase">Next Renewal Date</label>
                        <input type="date" name="next_due_date" defaultValue={editingEnquiry.next_due_date || ''} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase">Total KG Saved</label>
                        <input type="number" step="0.5" name="total_kg_saved" defaultValue={editingEnquiry.total_kg_saved || 0} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white outline-none text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase">Compost KG Produced</label>
                        <input type="number" step="0.5" name="compost_kg_produced" defaultValue={editingEnquiry.compost_kg_produced || 0} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white outline-none text-sm" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-400 uppercase">Admin Notes / UTR Reference</label>
                      <textarea name="admin_notes" rows={2} defaultValue={editingEnquiry.admin_notes || ''} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white outline-none text-sm" />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-800">
                      <button type="submit" disabled={saving} className="flex-1 bg-[#FFB300] text-black font-extrabold py-3.5 rounded-xl hover:bg-[#FFCA28] text-sm uppercase">
                        {saving ? 'Saving...' : 'Save Member Details'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONTENT */}
        {activeTab === 'content' && (
          <form onSubmit={handleSaveContent} className="bg-[#141414] rounded-3xl p-8 border border-gray-800 space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-4">Edit Text & Pricing</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <input type="text" name="household_price" defaultValue={content?.household_price} placeholder="Household Price" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white" />
              <input type="text" name="apartment_price" defaultValue={content?.apartment_price} placeholder="Apartment Price" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white" />
              <input type="text" name="event_price" defaultValue={content?.event_price} placeholder="Event Base Price" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white" />
            </div>
            <button type="submit" className="px-8 py-4 bg-[#FFB300] text-black font-bold rounded-xl">Save Content</button>
          </form>
        )}
      </main>
    </div>
  )
}