'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'
import {
  Loader2, Save, Mail, Settings, MapPin, Upload, Plus,
  Trash2, Image as ImageIcon, Edit2, Calendar, BarChart3, CreditCard,
  Phone, MessageSquare, AlertCircle, Copy, Check, Filter
} from 'lucide-react'

export default function PoojaAdminPage() {
  const [activeTab, setActiveTab] = useState<'enquiries' | 'content' | 'points' | 'proofs'>('enquiries')
  const [content, setContent] = useState<any>(null)
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [points, setPoints] = useState<any[]>([])
  const [proofs, setProofs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [editingEnquiry, setEditingEnquiry] = useState<any>(null)

  // Filter State
  const [filterType, setFilterType] = useState<'all' | 'due' | 'overdue' | 'unpaid' | 'paid'>('all')

  // Impact stats variables for the form
  const [impact1Value, setImpact1Value] = useState('')
  const [impact1Label, setImpact1Label] = useState('')
  const [impact2Value, setImpact2Value] = useState('')
  const [impact2Label, setImpact2Label] = useState('')
  const [impact3Value, setImpact3Value] = useState('')
  const [impact3Label, setImpact3Label] = useState('')
  const [impact4Value, setImpact4Value] = useState('')
  const [impact4Label, setImpact4Label] = useState('')

  // New Collection Point variables
  const [newPointName, setNewPointName] = useState('')
  const [newPointArea, setNewPointArea] = useState('')
  const [newPointAddress, setNewPointAddress] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    const [{ data: enqData }, { data: contentData }, { data: pointsData }, { data: proofsData }] = await Promise.all([
      supabase.from('pooja_enquiries').select('*').order('created_at', { ascending: false }),
      supabase.from('pooja_to_prakruthi_content').select('*').eq('id', 1).single(),
      supabase.from('pooja_collection_points').select('*').order('display_order', { ascending: true }),
      supabase.from('donation_payment_proofs').select('*').order('created_at', { ascending: false })
    ])

    setEnquiries(enqData || [])
    setContent(contentData || {})
    setPoints(pointsData || [])
    setProofs(proofsData || [])

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

  // Handle single image upload
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
      toast.error('Upload failed')
      setUploadingField(null)
      return
    }

    const { data: pub } = supabase.storage.from('media').getPublicUrl(fileName)
    
    setContent((prev: any) => ({ ...prev, [fieldName]: pub.publicUrl }))
    await supabase.from('pooja_to_prakruthi_content').update({ [fieldName]: pub.publicUrl }).eq('id', 1)

    toast.success('Image saved!')
    setUploadingField(null)
    e.target.value = ''
  }

  // Handle gallery upload
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
      toast.error('Upload failed')
      setUploadingField(null)
      return
    }

    const { data: pub } = supabase.storage.from('media').getPublicUrl(fileName)
    const updatedGallery = [...(content?.real_work_images || []), pub.publicUrl]
    
    setContent((prev: any) => ({ ...prev, real_work_images: updatedGallery }))
    await supabase.from('pooja_to_prakruthi_content').update({ real_work_images: updatedGallery }).eq('id', 1)

    toast.success('Gallery photo added!')
    setUploadingField(null)
    e.target.value = ''
  }

  async function removeGalleryImage(index: number) {
    const updatedGallery = (content?.real_work_images || []).filter((_: any, i: number) => i !== index)
    setContent((prev: any) => ({ ...prev, real_work_images: updatedGallery }))
    await supabase.from('pooja_to_prakruthi_content').update({ real_work_images: updatedGallery }).eq('id', 1)
    toast.success('Photo removed')
  }

  // Handle Member Edits & Auto Next Due Date Calculation (Feature B)
  async function handleSaveEnquiryDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingEnquiry) return
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    const pStatus = formData.get('payment_status') as string
    
    // Auto shift next due date if marked paid manually
    let calculatedDueDate = (formData.get('next_due_date') as string) || null
    let calculatedLastPayment = editingEnquiry.last_payment_date

    if (pStatus === 'Paid' && editingEnquiry.payment_status !== 'Paid') {
      const today = new Date()
      calculatedLastPayment = today.toISOString().split('T')[0]
      calculatedDueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }

    const updates = {
      payment_status: pStatus,
      subscription_status: formData.get('subscription_status') as string,
      total_kg_saved: Number(formData.get('total_kg_saved') || 0),
      compost_kg_produced: Number(formData.get('compost_kg_produced') || 0),
      last_payment_date: calculatedLastPayment,
      next_due_date: calculatedDueDate,
      admin_notes: formData.get('admin_notes') as string,
    }

    const { error } = await supabase.from('pooja_enquiries').update(updates).eq('id', editingEnquiry.id)
    
    if (error) {
      toast.error('Update failed')
    } else {
      toast.success('Member details updated!')
      setEditingEnquiry(null)
      fetchData()
    }
    setSaving(false)
  }

  // Handle Content / Text Save
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
    
    if (error) {
      toast.error('Save failed')
    } else {
      toast.success('Content saved live!')
    }
    setSaving(false)
  }

  // Handle Points
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
      is_active: true 
    }])
    toast.success('Point added!')
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
    if (!confirm('Delete this?')) return
    await supabase.from('pooja_collection_points').delete().eq('id', id)
    fetchData()
  }

  // Auto sets last_payment_date & shifts next_due_date forward by 30 days dynamically on verification
  async function markProofStatus(id: string, status: string, phone: string) {
    await supabase.from('donation_payment_proofs').update({ status }).eq('id', id)
    
    if (status === 'verified') {
      const today = new Date()
      const calculatedLastPayment = today.toISOString().split('T')[0]
      const calculatedDueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      await supabase.from('pooja_enquiries').update({ 
        payment_status: 'Paid', 
        subscription_status: 'Active',
        last_payment_date: calculatedLastPayment,
        next_due_date: calculatedDueDate
      }).or(`phone.eq.${phone},phone.ilike.%${phone}%`)
      
      toast.success('Payment verified & subscription extended 30 days!')
    } else {
      toast.success('Proof updated')
    }
    fetchData()
  }

  async function deleteProof(id: string, screenshotUrl?: string) {
    if (!confirm('Delete proof?')) return
    
    if (screenshotUrl && screenshotUrl.includes('/storage/v1/object/public/media/')) {
      const path = screenshotUrl.split('/storage/v1/object/public/media/')[1]?.split('?')[0]
      if (path) await supabase.storage.from('media').remove([path])
    }
    
    await supabase.from('donation_payment_proofs').delete().eq('id', id)
    toast.success('Deleted')
    fetchData()
  }

  // Direct WhatsApp Reminder Generator (Feature B & C)
  function getWhatsAppReminderLink(name: string, phone: string) {
    const cleanPhone = phone.replace(/\D/g, '')
    const formattedPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone : `91${cleanPhone.slice(-10)}`
    
    const message = `Hi ${name || 'Member'}, this is a gentle reminder from Sampige Foundation. Your monthly subscription of ₹300 for the Pooja to Prakruthi flower recycling initiative is due. You can renew easily online here: https://sampigefoundation.com/pooja-to-prakruthi/pay?phone=${phone}. Thank you for helping keep Bangalore green and clean! 🌸`
    
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
  }

  // Filter Logic (Feature B)
  const filteredEnquiries = enquiries.filter((enq) => {
    const todayStr = new Date().toISOString().split('T')[0]
    
    // Is Overdue if next_due_date exists, is less than today, and status is not Paid
    const isOverdue = enq.next_due_date && enq.next_due_date < todayStr && enq.payment_status !== 'Paid'
    
    // Is Due This Month if next_due_date is in current month
    const isDueThisMonth = enq.next_due_date && enq.next_due_date.slice(0, 7) === todayStr.slice(0, 7) && enq.payment_status !== 'Paid'

    if (filterType === 'overdue') return isOverdue
    if (filterType === 'due') return isDueThisMonth
    if (filterType === 'unpaid') return enq.payment_status === 'Unpaid' || enq.payment_status === 'Pending'
    if (filterType === 'paid') return enq.payment_status === 'Paid'
    return true
  })

  // Bulk Clipboard Copy utility for Reminder messages
  function copyBulkReminderNumbers() {
    const overdueList = enquiries.filter(enq => {
      const todayStr = new Date().toISOString().split('T')[0]
      return enq.next_due_date && enq.next_due_date < todayStr && enq.payment_status !== 'Paid'
    }).map(enq => enq.phone)

    if (overdueList.length === 0) {
      toast.error('No overdue members found.')
      return
    }

    navigator.clipboard.writeText(overdueList.join(', '))
    toast.success(`Copied ${overdueList.length} phone numbers!`)
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

        <div className="mb-8 border-b border-gray-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Pooja to Prakruthi Admin</h1>
            <p className="text-gray-400 text-sm">
              Manage members, automated next due dates, WhatsApp reminders, and live images.
            </p>
          </div>

          {/* Quick Stats Helper Panel */}
          <div className="flex gap-4">
            <button
              onClick={copyBulkReminderNumbers}
              className="px-4 py-2 border border-amber-500/40 text-amber-400 text-xs font-bold rounded-xl hover:bg-amber-500/10 flex items-center gap-1.5 transition-all"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Overdue Numbers
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button 
            onClick={() => setActiveTab('enquiries')} 
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold ${activeTab === 'enquiries' ? 'bg-[#FFB300] text-black' : 'bg-[#141414] text-gray-400 border border-gray-800'}`}
          >
            <Mail className="w-4 h-4" /> Members ({enquiries.length})
          </button>
          
          <button 
            onClick={() => setActiveTab('proofs')} 
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold ${activeTab === 'proofs' ? 'bg-[#FFB300] text-black' : 'bg-[#141414] text-gray-400 border border-gray-800'}`}
          >
            <CreditCard className="w-4 h-4" /> Payment Proofs ({proofs.length})
          </button>
          
          <button 
            onClick={() => setActiveTab('content')} 
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold ${activeTab === 'content' ? 'bg-[#FFB300] text-black' : 'bg-[#141414] text-gray-400 border border-gray-800'}`}
          >
            <Settings className="w-4 h-4" /> Edit Content
          </button>
          
          <button 
            onClick={() => setActiveTab('points')} 
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold ${activeTab === 'points' ? 'bg-[#FFB300] text-black' : 'bg-[#141414] text-gray-400 border border-gray-800'}`}
          >
            <MapPin className="w-4 h-4" /> Points ({points.length})
          </button>
        </div>

        {/* ═══════════════════════════════════════════
            TAB 1: ENQUIRIES & MEMBERS
            ═══════════════════════════════════════════ */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4">
            
            {/* Filter Pill Actions (Feature B) */}
            <div className="flex flex-wrap items-center gap-2 bg-[#141414] p-3 rounded-xl border border-gray-800">
              <span className="text-xs text-gray-400 px-2 flex items-center gap-1.5 font-bold uppercase">
                <Filter className="w-3.5 h-3.5 text-[#FFB300]" /> Filters:
              </span>
              {(['all', 'due', 'overdue', 'unpaid', 'paid'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    filterType === t 
                      ? 'bg-[#FFB300] text-black' 
                      : 'bg-black text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {t === 'due' ? 'Due This Month' : t === 'overdue' ? 'Overdue ⚠️' : t}
                </button>
              ))}
            </div>

            <div className="bg-[#141414] rounded-2xl border border-gray-800 overflow-hidden">
              {filteredEnquiries.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No members match this filter.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-black text-gray-400 uppercase text-xs">
                      <tr>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Payment</th>
                        <th className="px-6 py-4">Next Due</th>
                        <th className="px-6 py-4">Impact</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {filteredEnquiries.map((enq) => {
                        const todayStr = new Date().toISOString().split('T')[0]
                        const isOverdue = enq.next_due_date && enq.next_due_date < todayStr && enq.payment_status !== 'Paid'

                        return (
                          <tr key={enq.id} className="hover:bg-black/40">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white">{enq.full_name || enq.contact_person}</div>
                              <div className="text-[#FFB300] text-xs font-mono">{enq.phone} • {enq.participation_type}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${enq.payment_status === 'Paid' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                                {enq.payment_status || 'Unpaid'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs">
                              {enq.next_due_date ? (
                                <span className={`flex items-center gap-1 font-semibold ${isOverdue ? 'text-red-500 animate-pulse font-extrabold' : 'text-amber-400'}`}>
                                  {isOverdue && <AlertCircle className="w-3.5 h-3.5" />}
                                  <Calendar className="w-3 h-3"/> {enq.next_due_date}
                                  {isOverdue && ' (Overdue)'}
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs">
                              <div className="text-white font-bold">{enq.total_kg_saved || 0} kg saved</div>
                              <div className="text-green-400">{enq.compost_kg_produced || 0} kg compost</div>
                            </td>
                            <td className="px-6 py-4 flex gap-2">
                              <button 
                                onClick={() => setEditingEnquiry(enq)} 
                                className="px-3 py-2 bg-[#FFB300] text-black rounded-lg text-xs font-bold hover:bg-[#FFCA28] flex items-center gap-1"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Manage
                              </button>
                              
                              {/* Direct WhatsApp Reminder Action */}
                              <a
                                href={getWhatsAppReminderLink(enq.full_name || enq.contact_person, enq.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                              >
                                <MessageSquare className="w-3.5 h-3.5" /> Remind
                              </a>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Member Edit Modal */}
        {editingEnquiry && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#141414] border border-[#FFB300]/30 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between border-b border-gray-800 pb-3 mb-2">
                <h3 className="text-xl font-bold text-white">Edit Member</h3>
                <button onClick={() => setEditingEnquiry(null)} className="text-gray-500 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleSaveEnquiryDetails} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Payment Status</label>
                    <select name="payment_status" defaultValue={editingEnquiry.payment_status} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2 text-white">
                      <option value="Unpaid">Unpaid</option>
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Next Due Date</label>
                    <input type="date" name="next_due_date" defaultValue={editingEnquiry.next_due_date || ''} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">KG Saved</label>
                    <input type="number" name="total_kg_saved" defaultValue={editingEnquiry.total_kg_saved || 0} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Compost KG</label>
                    <input type="number" name="compost_kg_produced" defaultValue={editingEnquiry.compost_kg_produced || 0} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Notes (UTR / Ref)</label>
                  <textarea name="admin_notes" defaultValue={editingEnquiry.admin_notes} rows={2} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2 text-white" />
                </div>
                <button type="submit" disabled={saving} className="w-full py-3 bg-[#FFB300] text-black font-extrabold rounded-xl uppercase hover:bg-[#FFCA28]">
                  Save Details
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            TAB 2: PAYMENT PROOFS
            ═══════════════════════════════════════════ */}
        {activeTab === 'proofs' && (
          <div className="bg-[#141414] rounded-2xl border border-gray-800 p-6">
            {proofs.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No proofs submitted.</p>
            ) : (
              <div className="space-y-6">
                {proofs.map((p) => (
                  <div key={p.id} className="flex flex-col md:flex-row gap-6 p-4 border border-gray-800 rounded-2xl bg-black/40">
                    
                    <div className="w-48 shrink-0">
                      {p.screenshot_url ? (
                        <a href={p.screenshot_url} target="_blank" rel="noopener noreferrer">
                          <img src={p.screenshot_url} className="w-full h-32 object-cover rounded-xl border border-gray-700 hover:border-[#FFB300]" />
                          <span className="text-[10px] text-[#FFB300] mt-1 block text-center">Click to enlarge</span>
                        </a>
                      ) : (
                        <div className="h-32 bg-gray-900 rounded-xl flex items-center justify-center text-xs text-gray-500">
                          No screenshot
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-lg">{p.full_name}</h4>
                          <p className="text-[#FFB300] text-sm font-mono">{p.phone}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                          p.status === 'verified' ? 'bg-green-900/40 text-green-400' : p.status === 'rejected' ? 'bg-red-900/40 text-red-400' : 'bg-yellow-900/40 text-yellow-400'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Ref / UTR: <span className="text-white font-mono">{p.payment_ref || 'None'}</span></p>
                      <p className="text-xs text-gray-400">Date: {new Date(p.created_at).toLocaleString()}</p>
                      <p className="text-xs text-gray-500 italic mt-2">{p.notes}</p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 justify-center border-l border-gray-800 pl-6">
                      {p.status !== 'verified' && (
                        <button onClick={() => markProofStatus(p.id, 'verified', p.phone)} className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-500">
                          Mark Verified + Paid
                        </button>
                      )}
                      <button onClick={() => markProofStatus(p.id, 'rejected', p.phone)} className="px-4 py-2 bg-gray-800 text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-700">
                        Reject
                      </button>
                      <button onClick={() => deleteProof(p.id, p.screenshot_url)} className="px-4 py-2 bg-red-900/30 text-red-400 text-xs font-bold rounded-xl hover:bg-red-900 hover:text-white flex items-center gap-1 justify-center">
                        <Trash2 className="w-3.5 h-3.5"/> Delete
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════
            TAB 3: CONTENT & IMAGES
            ═══════════════════════════════════════════ */}
        {activeTab === 'content' && (
          <div className="space-y-10">
            
            <div className="bg-[#141414] p-8 rounded-3xl border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <BarChart3 className="text-[#FFB300] w-5 h-5"/> Universal Impact Stats
              </h2>
              <p className="text-gray-400 text-xs mb-6">These 4 numbers appear on the public page for everyone to see.</p>
              
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-black p-4 rounded-xl border border-gray-800 space-y-2">
                  <input value={impact1Value} onChange={(e) => setImpact1Value(e.target.value)} placeholder="Value (1,250+)" className="w-full bg-transparent text-[#FFB300] font-bold outline-none border-b border-gray-800 pb-1" />
                  <input value={impact1Label} onChange={(e) => setImpact1Label(e.target.value)} placeholder="Label (kg Collected)" className="w-full bg-transparent text-gray-400 text-xs outline-none" />
                </div>
                <div className="bg-black p-4 rounded-xl border border-gray-800 space-y-2">
                  <input value={impact2Value} onChange={(e) => setImpact2Value(e.target.value)} placeholder="Value (350+)" className="w-full bg-transparent text-[#FFB300] font-bold outline-none border-b border-gray-800 pb-1" />
                  <input value={impact2Label} onChange={(e) => setImpact2Label(e.target.value)} placeholder="Label (Households)" className="w-full bg-transparent text-gray-400 text-xs outline-none" />
                </div>
                <div className="bg-black p-4 rounded-xl border border-gray-800 space-y-2">
                  <input value={impact3Value} onChange={(e) => setImpact3Value(e.target.value)} placeholder="Value (25+)" className="w-full bg-transparent text-[#FFB300] font-bold outline-none border-b border-gray-800 pb-1" />
                  <input value={impact3Label} onChange={(e) => setImpact3Label(e.target.value)} placeholder="Label (Collections)" className="w-full bg-transparent text-gray-400 text-xs outline-none" />
                </div>
                <div className="bg-black p-4 rounded-xl border border-gray-800 space-y-2">
                  <input value={impact4Value} onChange={(e) => setImpact4Value(e.target.value)} placeholder="Value (450+)" className="w-full bg-transparent text-[#FFB300] font-bold outline-none border-b border-gray-800 pb-1" />
                  <input value={impact4Label} onChange={(e) => setImpact4Label(e.target.value)} placeholder="Label (kg Compost)" className="w-full bg-transparent text-gray-400 text-xs outline-none" />
                </div>
              </div>
            </div>

            <div className="bg-[#141414] p-8 rounded-3xl border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-6">Upload Section Photos</h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                <ImageUploadCard label="1. Hero Side Photo" currentUrl={content?.hero_side_image} uploading={uploadingField === 'hero_side_image'} onFileChange={(e) => handleImageUpload(e, 'hero_side_image')} />
                <ImageUploadCard label="2. Solution Photo" currentUrl={content?.solution_image} uploading={uploadingField === 'solution_image'} onFileChange={(e) => handleImageUpload(e, 'solution_image')} />
                <ImageUploadCard label="3. Accepted Flowers" currentUrl={content?.accepted_image} uploading={uploadingField === 'accepted_image'} onFileChange={(e) => handleImageUpload(e, 'accepted_image')} />
                <ImageUploadCard label="4. Offered With Devotion" currentUrl={content?.problem_scene_1_image} uploading={uploadingField === 'problem_scene_1_image'} onFileChange={(e) => handleImageUpload(e, 'problem_scene_1_image')} />
                <ImageUploadCard label="5. Pooja Ends" currentUrl={content?.problem_scene_2_image} uploading={uploadingField === 'problem_scene_2_image'} onFileChange={(e) => handleImageUpload(e, 'problem_scene_2_image')} />
                <ImageUploadCard label="6. Mixed Waste" currentUrl={content?.problem_scene_3_image} uploading={uploadingField === 'problem_scene_3_image'} onFileChange={(e) => handleImageUpload(e, 'problem_scene_3_image')} />
                <ImageUploadCard label="7. Journey Ends" currentUrl={content?.problem_scene_4_image} uploading={uploadingField === 'problem_scene_4_image'} onFileChange={(e) => handleImageUpload(e, 'problem_scene_4_image')} />
                <ImageUploadCard label="8. Not Accepted Photo" currentUrl={content?.not_accepted_image} uploading={uploadingField === 'not_accepted_image'} onFileChange={(e) => handleImageUpload(e, 'not_accepted_image')} />
              </div>

              <div className="mt-8 border-t border-gray-800 pt-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                  Real Work Gallery
                  <label className="bg-[#FFB300] text-black px-4 py-2 rounded-lg text-xs cursor-pointer hover:bg-[#FFCA28]">
                    Add Photo
                    <input type="file" className="hidden" onChange={handleGalleryUpload} />
                  </label>
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {(content?.real_work_images || []).map((url: string, i: number) => (
                    <div key={i} className="relative aspect-square bg-black rounded-xl overflow-hidden group">
                      <img src={url} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 p-1.5 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveContent} className="bg-[#141414] p-8 rounded-3xl border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-6">Edit Text & Pricing</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Hero Line 1</label>
                    <input name="hero_title_line1" defaultValue={content?.hero_title_line1} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Hero Line 2 (Gold)</label>
                    <input name="hero_title_line2" defaultValue={content?.hero_title_line2} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Hero Description</label>
                  <textarea name="hero_description" defaultValue={content?.hero_description} rows={2} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2 text-white" />
                </div>
                
                <h3 className="text-lg font-bold text-white pt-4 border-t border-gray-800">Pricing</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Household Price</label>
                    <input name="household_price" defaultValue={content?.household_price} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2 text-white" />
                    <input name="household_note" defaultValue={content?.household_note} placeholder="Note (e.g. Up to 30 kg/month)" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2 text-gray-400 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Apartment Price</label>
                    <input name="apartment_price" defaultValue={content?.apartment_price} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2 text-white" />
                    <input name="apartment_note" defaultValue={content?.apartment_note} placeholder="Note (e.g. per flat/month)" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2 text-gray-400 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Event Price</label>
                    <input name="event_price" defaultValue={content?.event_price} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2 text-white" />
                    <input name="event_note" defaultValue={content?.event_note} placeholder="Note (e.g. up to 10 kg)" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2 text-gray-400 text-xs" />
                  </div>
                </div>
                
                <div className="pt-4">
                  <button type="submit" disabled={saving} className="w-full bg-[#FFB300] text-black font-extrabold py-4 rounded-xl uppercase hover:bg-[#FFCA28]">
                    {saving ? 'Saving...' : 'Save Text & Impact Stats'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            TAB 4: POINTS
            ═══════════════════════════════════════════ */}
        {activeTab === 'points' && (
          <div className="bg-[#141414] rounded-3xl p-8 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-6">Collection Points</h2>
            <form onSubmit={handleAddPoint} className="flex gap-4 mb-8">
              <input required value={newPointName} onChange={(e) => setNewPointName(e.target.value)} placeholder="Point Name" className="flex-1 bg-black border border-gray-800 rounded-xl px-4 py-3 text-white" />
              <input required value={newPointArea} onChange={(e) => setNewPointArea(e.target.value)} placeholder="Area" className="flex-1 bg-black border border-gray-800 rounded-xl px-4 py-3 text-white" />
              <button type="submit" className="px-6 bg-[#FFB300] text-black font-bold rounded-xl">Add</button>
            </form>
            <div className="space-y-2">
              {points.map(pt => (
                <div key={pt.id} className="bg-black p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">{pt.name} <span className="text-gray-500 text-xs font-normal">({pt.area})</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => togglePointStatus(pt.id, pt.is_active)} className="px-3 py-1.5 bg-gray-800 text-xs rounded-lg text-white">
                      {pt.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => deletePoint(pt.id)} className="px-3 py-1.5 bg-red-900/40 text-red-400 text-xs rounded-lg">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function ImageUploadCard({ label, sublabel, currentUrl, uploading, onFileChange }: { label: string; sublabel?: string; currentUrl?: string; uploading: boolean; onFileChange: any }) {
  return (
    <div className="bg-black p-4 rounded-2xl border border-gray-800">
      <div className="font-bold text-white text-xs mb-1">{label}</div>
      {sublabel && <div className="text-gray-500 text-[10px] mb-3">{sublabel}</div>}
      <div className="aspect-video bg-[#111] rounded-xl border border-gray-800 overflow-hidden relative my-3">
        {currentUrl ? <img src={currentUrl} className="w-full h-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-600 text-xs">No image</div>}
      </div>
      <label className="cursor-pointer block text-center bg-gray-900 border border-gray-700 text-gray-300 text-xs font-bold py-2 rounded-xl hover:bg-gray-800">
        {uploading ? 'Uploading...' : 'Upload'}
        <input type="file" accept="image/*" className="hidden" onChange={onFileChange} disabled={uploading} />
      </label>
    </div>
  )
}