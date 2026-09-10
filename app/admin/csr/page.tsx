'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/admin/Sidebar'
import toast from 'react-hot-toast'
import Link from 'next/link'
import {
  Plus, Pencil, Trash2, Save, X, Image as ImageIcon,
  Handshake, Star, Users, Sparkles, Heart, Target, Leaf,
  TrendingUp, GraduationCap, Laptop, Briefcase, Inbox, HandHeart,
  Eye, MessageCircle, FileText, ArrowUpRight, Landmark
} from 'lucide-react'

const supabase = createClient()

const ICON_OPTIONS = [
  'Handshake', 'Star', 'Users', 'Sparkles', 'Heart', 'Target',
  'Leaf', 'Eye', 'MessageCircle', 'TrendingUp', 'GraduationCap',
  'Laptop', 'Briefcase', 'Inbox', 'HandHeart',
]

const ICON_MAP: Record<string, any> = {
  Handshake, Star, Users, Sparkles, Heart, Target, Leaf,
  Eye, MessageCircle, TrendingUp, GraduationCap, Laptop,
  Briefcase, Inbox, HandHeart,
}

type Tab = 'enquiries' | 'partners' | 'activities' | 'statistics' | 'content'

interface Partner {
  id: string
  company_name: string
  logo_url: string
  website_url: string
  display_order: number
  is_active: boolean
}

interface Activity {
  id: string
  pillar_id: string
  title: string
  slug: string
  short_description: string
  description: string
  team_size: string
  duration: string
  outcome: string
  cover_image: string
  gallery: string[]
  steps: { title: string; description: string; image?: string }[]
  metrics: { label: string; value: string; icon: string }[]
  published: boolean
  display_order?: number
  csr_pillars?: { name: string }
}

interface Stat {
  id: string
  number: string
  label: string
  icon_name: string
  display_order: number
  published: boolean
}

interface Enquiry {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone: string
  preferred_activity: string
  employee_count: string
  preferred_date: string
  status: string
  created_at: string
}

export default function AdminCSRPage() {
  const [tab, setTab] = useState<Tab>('enquiries')
  const [loading, setLoading] = useState(true)

  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  
  const [partners, setPartners] = useState<Partner[]>([])
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [showPartnerForm, setShowPartnerForm] = useState(false)
  const [partnerForm, setPartnerForm] = useState({ company_name: '', logo_url: '', website_url: '', display_order: 1, is_active: true })

  const [activities, setActivities] = useState<Activity[]>([])
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [showActivityForm, setShowActivityForm] = useState(false)
  
  const [activityForm, setActivityForm] = useState({
    pillar_id: '',
    title: '',
    slug: '',
    short_description: '',
    description: '',
    team_size: '20–500+ employees',
    duration: '2–3 hours',
    outcome: '',
    cover_image: '',
    gallery: [] as string[],
    steps: [] as { title: string; description: string; image?: string }[],
    metrics: [] as { label: string; value: string; icon: string }[],
    published: true,
  })

  const [pillars, setPillars] = useState<{ id: string; name: string }[]>([])
  const [stats, setStats] = useState<Stat[]>([])
  const [editingStat, setEditingStat] = useState<Stat | null>(null)
  const [showStatForm, setShowStatForm] = useState(false)
  const [statForm, setStatForm] = useState({ number: '', label: '', icon_name: 'Star', display_order: 1, published: true })

  const [content, setContent] = useState<any>({
    hero_badge: '',
    hero_title: '',
    hero_subtitle: '',
    hero_image: '',
    intro_text: '',
  })
  const [savingContent, setSavingContent] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [enqRes, pRes, aRes, sRes, cRes, pilRes] = await Promise.all([
      supabase.from('csr_enquiries').select('*').order('created_at', { ascending: false }),
      supabase.from('csr_partners').select('*').order('display_order'),
      supabase.from('csr_activities').select('*, csr_pillars(name)').order('display_order', { ascending: true }),
      supabase.from('csr_statistics').select('*').order('display_order'),
      supabase.from('site_settings').select('value').eq('key', 'csr_page').single(),
      supabase.from('csr_pillars').select('id, name').order('display_order'),
    ])

    if (enqRes.data) setEnquiries(enqRes.data)
    if (pRes.data) setPartners(pRes.data)
    if (aRes.data) setActivities(aRes.data as any)
    if (sRes.data) setStats(sRes.data)
    if (pilRes.data) setPillars(pilRes.data)
    if (cRes.data?.value) setContent(cRes.data.value)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    const ext = file.name.split('.').pop()
    const path = `csr/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('media').upload(path, file)
    if (error) {
      toast.error('Upload failed: ' + error.message)
      return ''
    }
    const { data } = supabase.storage.from('media').getPublicUrl(path)
    return data.publicUrl
  }

  // Partners CRUD
  const savePartner = async () => {
    if (!partnerForm.company_name.trim()) return toast.error('Company name required')
    if (editingPartner) {
      const { error } = await supabase.from('csr_partners').update({ ...partnerForm, updated_at: new Date().toISOString() }).eq('id', editingPartner.id)
      if (error) return toast.error(error.message)
      toast.success('Partner updated')
    } else {
      const { error } = await supabase.from('csr_partners').insert(partnerForm)
      if (error) return toast.error(error.message)
      toast.success('Partner added')
    }
    setShowPartnerForm(false)
    setEditingPartner(null)
    setPartnerForm({ company_name: '', logo_url: '', website_url: '', display_order: partners.length + 1, is_active: true })
    fetchAll()
  }

  const deletePartner = async (id: string) => {
    if (!confirm('Delete this partner?')) return
    await supabase.from('csr_partners').delete().eq('id', id)
    toast.success('Deleted')
    fetchAll()
  }

  // Activities CRUD
  const saveActivity = async () => {
    if (!activityForm.title.trim()) return toast.error('Title is required')
    if (!activityForm.pillar_id) return toast.error('Associated pillar required')
    const slug = activityForm.slug || activityForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const payload = { ...activityForm, slug }

    if (editingActivity) {
      const { error } = await supabase.from('csr_activities').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editingActivity.id)
      if (error) return toast.error(error.message)
      toast.success('Activity updated')
    } else {
      const { error } = await supabase.from('csr_activities').insert(payload)
      if (error) return toast.error(error.message)
      toast.success('Activity added')
    }
    setShowActivityForm(false)
    setEditingActivity(null)
    fetchAll()
  }

  const deleteActivity = async (id: string) => {
    if (!confirm('Delete this activity?')) return
    await supabase.from('csr_activities').delete().eq('id', id)
    toast.success('Deleted')
    fetchAll()
  }

  // Stats CRUD
  const saveStat = async () => {
    if (!statForm.number.trim() || !statForm.label.trim()) return toast.error('Number and label required')
    if (editingStat) {
      const { error } = await supabase.from('csr_statistics').update(statForm).eq('id', editingStat.id)
      if (error) return toast.error(error.message)
      toast.success('Stat updated')
    } else {
      const { error } = await supabase.from('csr_statistics').insert(statForm)
      if (error) return toast.error(error.message)
      toast.success('Stat added')
    }
    setShowStatForm(false)
    setEditingStat(null)
    setStatForm({ number: '', label: '', icon_name: 'Star', display_order: stats.length + 1, published: true })
    fetchAll()
  }

  const deleteStat = async (id: string) => {
    if (!confirm('Delete this stat?')) return
    await supabase.from('csr_statistics').delete().eq('id', id)
    toast.success('Deleted')
    fetchAll()
  }

  const saveContent = async () => {
    setSavingContent(true)
    const { error } = await supabase.from('site_settings').update({ value: content }).eq('key', 'csr_page')
    if (error) {
      toast.error(error.message)
      setSavingContent(false)
      return
    }
    toast.success('CSR landing content saved!')
    setSavingContent(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-white w-full justify-between">
        <main className="flex-1 p-10 flex items-center justify-center text-[#B0B0B0]">
          Loading CSR CRM Module...
        </main>
        <Sidebar />
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'enquiries', label: 'Partner Enquiries' },
    { key: 'partners', label: 'Partners' },
    { key: 'activities', label: 'Activities' },
    { key: 'statistics', label: 'Statistics' },
    { key: 'content', label: 'Page Content' },
  ]

  return (
    <div className="flex min-h-screen bg-black text-white w-full justify-between">
      <main className="flex-1 min-w-0 p-6 md:p-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">CSR & Corporate Partnerships</h1>
            <p className="text-[#B0B0B0] text-xs mt-1">Manage corporate accounts, program details, and partner intake.</p>
          </div>
          <Link href="/csr" target="_blank" className="text-gold-500 text-xs md:text-sm flex items-center gap-1 hover:underline">
            Open Public CSR Page <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-gray-800">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.key ? 'bg-gold-500 text-black font-bold' : 'bg-[#1A1A1A] text-[#B0B0B0] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══ TAB 1: ENQUIRIES ═══ */}
        {tab === 'enquiries' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Corporate Planning Leads</h2>
            <div className="overflow-x-auto bg-[#111111] rounded-2xl border border-gold-500/10">
              <table className="w-full text-left text-sm text-[#D0D0D0]">
                <thead className="bg-[#1A1A1A] text-[#B0B0B0] uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Format</th>
                    <th className="px-6 py-4 text-center">Employees</th>
                    <th className="px-6 py-4">Date Preference</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-950">
                  {enquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-[#151515] transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{enq.company_name}</td>
                      <td className="px-6 py-4">
                        <div>{enq.contact_name}</div>
                        <div className="text-xs text-[#B0B0B0]">{enq.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gold-500 font-medium">{enq.preferred_activity || 'Guidance Requested'}</td>
                      <td className="px-6 py-4 text-center">{enq.employee_count}</td>
                      <td className="px-6 py-4">
                        {enq.preferred_date ? new Date(enq.preferred_date).toLocaleDateString('en-IN') : 'Flexible'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-gold-500/10 text-gold-500 border border-gold-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                          {enq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/csr/enquiries/${enq.id}`}
                          className="bg-gold-500 text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:scale-105 transition-transform block text-center"
                        >
                          View CRM
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {enquiries.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[#B0B0B0]">
                        No corporate enquiries recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB 2: PARTNERS ═══ */}
        {tab === 'partners' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-[#B0B0B0]">These brand logos are rendered within your horizontal logo marquees.</p>
              <button
                onClick={() => {
                  setEditingPartner(null)
                  setPartnerForm({ company_name: '', logo_url: '', website_url: '', display_order: partners.length + 1, is_active: true })
                  setShowPartnerForm(true)
                }}
                className="flex items-center gap-2 bg-gold-500 text-black px-4 py-2 rounded-full text-sm font-bold hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Corporate Account
              </button>
            </div>

            {showPartnerForm && (
              <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gold-500/20 mb-6 space-y-4">
                <h3 className="font-bold text-lg">{editingPartner ? 'Modify' : 'Register'} Corporate Partner</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#B0B0B0] mb-1 block">Company Name *</label>
                    <input
                      value={partnerForm.company_name}
                      onChange={(e) => setPartnerForm((p) => ({ ...p, company_name: e.target.value }))}
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-gold-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#B0B0B0] mb-1 block">Corporate Website</label>
                    <input
                      value={partnerForm.website_url}
                      onChange={(e) => setPartnerForm((p) => ({ ...p, website_url: e.target.value }))}
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-gold-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#B0B0B0] mb-1 block">Display Sequence</label>
                    <input
                      type="number"
                      value={partnerForm.display_order}
                      onChange={(e) => setPartnerForm((p) => ({ ...p, display_order: +e.target.value }))}
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-gold-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#B0B0B0] mb-1 block">Corporate Brand Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const url = await uploadImage(file, 'partners')
                          if (url) setPartnerForm((p) => ({ ...p, logo_url: url }))
                        }
                      }}
                      className="w-full text-sm text-[#B0B0B0]"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4 border-t border-gray-800">
                  <button onClick={savePartner} className="bg-gold-500 text-black px-6 py-2 rounded-full text-xs font-extrabold uppercase">
                    Save Partner Account
                  </button>
                  <button onClick={() => setShowPartnerForm(false)} className="text-sm text-[#B0B0B0] hover:text-white px-2">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partners.map((p) => (
                <div key={p.id} className="bg-[#111111] p-4 rounded-xl border border-gold-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 bg-black rounded p-1 flex items-center justify-center overflow-hidden shrink-0">
                      {p.logo_url ? <img src={p.logo_url} className="max-h-full max-w-full object-contain" /> : <Landmark className="text-gray-700" />}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{p.company_name}</h4>
                      <p className="text-xs text-[#B0B0B0]">Order: {p.display_order}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingPartner(p)
                        setPartnerForm({ company_name: p.company_name, logo_url: p.logo_url || '', website_url: p.website_url || '', display_order: p.display_order, is_active: p.is_active })
                        setShowPartnerForm(true)
                      }}
                      className="text-gold-500 p-2 hover:bg-white/5 rounded"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deletePartner(p.id)} className="text-red-400 p-2 hover:bg-white/5 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TAB 3: ACTIVITIES ═══ */}
        {tab === 'activities' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-[#B0B0B0]">Configure outcomes, cover photos, steps, gallery, and hover images.</p>
              <button
                onClick={() => {
                  setEditingActivity(null)
                  setActivityForm({
                    pillar_id: '',
                    title: '',
                    slug: '',
                    short_description: '',
                    description: '',
                    team_size: '20–500+ employees',
                    duration: '2–3 hours',
                    outcome: '',
                    cover_image: '',
                    gallery: [],
                    steps: [],
                    metrics: [],
                    published: true,
                  })
                  setShowActivityForm(true)
                }}
                className="flex items-center gap-2 bg-gold-500 text-black px-4 py-2 rounded-full text-sm font-bold hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" /> Add New Format
              </button>
            </div>

            {showActivityForm && (
              <div className="bg-[#1A1A1A] rounded-3xl p-8 border border-gold-500/20 mb-8 space-y-6">
                <h3 className="font-bold text-lg">{editingActivity ? 'Modify' : 'Configure'} Engagement Format</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-[#B0B0B0] mb-2 block">Pillar Category *</label>
                    <select
                      value={activityForm.pillar_id}
                      onChange={(e) => setActivityForm((a) => ({ ...a, pillar_id: e.target.value }))}
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-gold-500 outline-none"
                    >
                      <option value="">Select Pillar...</option>
                      {pillars.map((pil) => (
                        <option key={pil.id} value={pil.id}>
                          {pil.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#B0B0B0] mb-2 block">Activity Title *</label>
                    <input
                      value={activityForm.title}
                      onChange={(e) => setActivityForm((a) => ({ ...a, title: e.target.value }))}
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-gold-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#B0B0B0] mb-2 block">URL Slug</label>
                    <input
                      value={activityForm.slug}
                      onChange={(e) => setActivityForm((a) => ({ ...a, slug: e.target.value }))}
                      placeholder="Auto-generated if blank"
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-gold-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[#B0B0B0] mb-2 block">Team Size</label>
                      <input
                        value={activityForm.team_size}
                        onChange={(e) => setActivityForm((a) => ({ ...a, team_size: e.target.value }))}
                        className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-gold-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#B0B0B0] mb-2 block">Duration</label>
                      <input
                        value={activityForm.duration}
                        onChange={(e) => setActivityForm((a) => ({ ...a, duration: e.target.value }))}
                        className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-gold-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Cover Photo */}
                  <div className="md:col-span-2">
                    <label className="text-xs text-[#B0B0B0] mb-2 block">
                      Cover Photo * <span className="text-gold-500">(Best: 16:9 landscape, e.g. 1920×1080)</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const url = await uploadImage(file, 'covers')
                          if (url) {
                            setActivityForm((a) => ({ ...a, cover_image: url }))
                            toast.success('Cover photo uploaded!')
                          }
                        }}
                        className="flex-1 text-sm text-[#B0B0B0] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gold-500 file:text-black file:font-bold file:cursor-pointer"
                      />
                      {activityForm.cover_image && (
                        <div className="w-28 h-16 rounded-lg overflow-hidden border border-gold-500/40 shrink-0">
                          <img src={activityForm.cover_image} alt="Cover preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event Gallery (optional, max 6) */}
                  <div className="md:col-span-2 space-y-3 border-t border-gray-800 pt-5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gold-500 font-bold uppercase tracking-wider">
                        Event Gallery
                        <span className="text-[#B0B0B0] font-normal normal-case ml-2 text-xs">
                          (optional · max 6 · leave empty to hide on website)
                        </span>
                      </label>
                      <span className="text-xs text-[#B0B0B0]">{activityForm.gallery.length}/6</span>
                    </div>

                    {activityForm.gallery.length > 0 && (
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {activityForm.gallery.map((img, i) => (
                          <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-gold-500/20 bg-black group">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() =>
                                setActivityForm((a) => ({
                                  ...a,
                                  gallery: a.gallery.filter((_, j) => j !== i),
                                }))
                              }
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {i + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activityForm.gallery.length < 6 ? (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || [])
                            if (!files.length) return
                            const remaining = 6 - activityForm.gallery.length
                            const toUpload = files.slice(0, remaining)
                            if (files.length > remaining) {
                              toast.error(`Only ${remaining} more image(s) allowed (max 6)`)
                            }
                            const urls: string[] = []
                            for (const file of toUpload) {
                              const url = await uploadImage(file, 'gallery')
                              if (url) urls.push(url)
                            }
                            if (urls.length) {
                              setActivityForm((a) => ({
                                ...a,
                                gallery: [...a.gallery, ...urls].slice(0, 6),
                              }))
                              toast.success(`${urls.length} photo(s) added`)
                            }
                            e.target.value = ''
                          }}
                          className="w-full text-sm text-[#B0B0B0] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gold-500 file:text-black file:font-bold file:cursor-pointer"
                        />
                        <p className="text-[11px] text-[#666] mt-1.5">
                          Select multiple images at once. They appear only if uploaded — section auto-hides when empty.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gold-500/80 bg-gold-500/10 border border-gold-500/20 rounded-lg px-3 py-2">
                        Gallery full (6/6). Remove a photo to add another.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#B0B0B0] mb-2 block">Short Description</label>
                  <input
                    value={activityForm.short_description}
                    onChange={(e) => setActivityForm((a) => ({ ...a, short_description: e.target.value }))}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-gold-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#B0B0B0] mb-2 block">Full Overview</label>
                  <textarea
                    value={activityForm.description}
                    onChange={(e) => setActivityForm((a) => ({ ...a, description: e.target.value }))}
                    rows={4}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-gold-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#B0B0B0] mb-2 block">Outcome / Environmental Return Description</label>
                  <textarea
                    value={activityForm.outcome}
                    onChange={(e) => setActivityForm((a) => ({ ...a, outcome: e.target.value }))}
                    rows={3}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-gold-500 outline-none"
                  />
                </div>

                {/* Steps + hover images */}
                <div className="space-y-4 border-t border-gray-800 pt-4">
                  <label className="text-sm text-gold-500 font-bold block uppercase tracking-wider">
                    Implementation Steps & Hover Images
                  </label>
                  {activityForm.steps.map((st, idx) => (
                    <div key={idx} className="bg-black p-5 rounded-2xl border border-gray-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-gold-500">Step {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = activityForm.steps.filter((_, i) => i !== idx)
                            setActivityForm((a) => ({ ...a, steps: next }))
                          }}
                          className="text-red-400 p-1 hover:bg-red-500/10 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          value={st.title}
                          placeholder="Step Title (e.g. Site Prep)"
                          onChange={(e) => {
                            const next = [...activityForm.steps]
                            next[idx].title = e.target.value
                            setActivityForm((a) => ({ ...a, steps: next }))
                          }}
                          className="bg-[#1A1A1A] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                        />
                        <input
                          value={st.description}
                          placeholder="Step Description..."
                          onChange={(e) => {
                            const next = [...activityForm.steps]
                            next[idx].description = e.target.value
                            setActivityForm((a) => ({ ...a, steps: next }))
                          }}
                          className="bg-[#1A1A1A] border border-gray-700 rounded-lg px-3 py-2 text-sm text-[#B0B0B0]"
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex-1">
                          <label className="text-xs text-[#B0B0B0] mb-1 block">Step Hover Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const url = await uploadImage(file, 'steps')
                                if (url) {
                                  const next = [...activityForm.steps]
                                  next[idx].image = url
                                  setActivityForm((a) => ({ ...a, steps: next }))
                                  toast.success(`Image uploaded for Step ${idx + 1}`)
                                }
                              }
                            }}
                            className="text-xs text-[#B0B0B0] file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-gold-500 file:text-black file:font-bold file:cursor-pointer"
                          />
                        </div>
                        {st.image && (
                          <div className="w-16 h-12 rounded-lg overflow-hidden border border-gold-500/30 shrink-0 bg-black">
                            <img src={st.image} alt="Step preview" className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setActivityForm((a) => ({ ...a, steps: [...a.steps, { title: '', description: '', image: '' }] }))}
                    className="text-gold-500 text-xs font-bold flex items-center gap-1.5 bg-gold-500/10 px-4 py-2 rounded-full border border-gold-500/20 hover:bg-gold-500/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Step
                  </button>
                </div>

                {/* Metrics */}
                <div className="space-y-3 pt-4 border-t border-gray-800">
                  <label className="text-xs text-[#B0B0B0] font-bold block uppercase">Outcome Statistics</label>
                  {activityForm.metrics.map((met, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-black p-4 rounded-xl">
                      <input
                        value={met.value}
                        placeholder="Value (e.g. 5,000+)"
                        onChange={(e) => {
                          const next = [...activityForm.metrics]
                          next[idx].value = e.target.value
                          setActivityForm((a) => ({ ...a, metrics: next }))
                        }}
                        className="w-32 bg-[#1A1A1A] border border-gray-700 rounded-lg px-3 py-1.5 text-sm"
                      />
                      <input
                        value={met.label}
                        placeholder="Label"
                        onChange={(e) => {
                          const next = [...activityForm.metrics]
                          next[idx].label = e.target.value
                          setActivityForm((a) => ({ ...a, metrics: next }))
                        }}
                        className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded-lg px-3 py-1.5 text-sm"
                      />
                      <select
                        value={met.icon}
                        onChange={(e) => {
                          const next = [...activityForm.metrics]
                          next[idx].icon = e.target.value
                          setActivityForm((a) => ({ ...a, metrics: next }))
                        }}
                        className="bg-[#1A1A1A] border border-gray-700 rounded-lg px-3 py-2 text-xs"
                      >
                        {ICON_OPTIONS.map((ico) => (
                          <option key={ico} value={ico}>
                            {ico}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const next = activityForm.metrics.filter((_, i) => i !== idx)
                          setActivityForm((a) => ({ ...a, metrics: next }))
                        }}
                        className="text-red-400 p-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setActivityForm((a) => ({ ...a, metrics: [...a.metrics, { value: '', label: '', icon: 'Star' }] }))}
                    className="text-gold-500 text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Metric Card
                  </button>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-850">
                  <button onClick={saveActivity} className="bg-gold-500 text-black px-6 py-3 rounded-full text-xs font-extrabold uppercase">
                    Save Format Configuration
                  </button>
                  <button onClick={() => setShowActivityForm(false)} className="text-sm text-[#B0B0B0] hover:text-white px-2">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {activities.map((a) => (
                <div key={a.id} className="bg-[#111111] p-5 rounded-2xl border border-gold-500/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gold-500 font-bold uppercase block mb-1">
                      {a.csr_pillars?.name}
                    </span>
                    <h4 className="text-white font-bold text-lg">{a.title}</h4>
                    <p className="text-xs text-[#B0B0B0] mt-1">/csr/{a.slug} · Gallery: {a.gallery?.length || 0}/6</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingActivity(a)
                        setActivityForm({
                          pillar_id: a.pillar_id || '',
                          title: a.title,
                          slug: a.slug,
                          short_description: a.short_description || '',
                          description: a.description || '',
                          team_size: a.team_size || '20–500+ employees',
                          duration: a.duration || '2–3 hours',
                          outcome: a.outcome || '',
                          cover_image: a.cover_image || '',
                          gallery: a.gallery || [],
                          steps: a.steps || [],
                          metrics: a.metrics || [],
                          published: a.published,
                        })
                        setShowActivityForm(true)
                      }}
                      className="text-gold-500 p-2 hover:bg-white/5 rounded"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteActivity(a.id)} className="text-red-400 p-2 hover:bg-white/5 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TAB 4: STATISTICS ═══ */}
        {tab === 'statistics' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-[#B0B0B0]">Configure the stat points displayed on the public landing page.</p>
              <button
                onClick={() => {
                  setEditingStat(null)
                  setStatForm({ number: '', label: '', icon_name: 'Star', display_order: stats.length + 1, published: true })
                  setShowStatForm(true)
                }}
                className="flex items-center gap-2 bg-gold-500 text-black px-4 py-2 rounded-full text-sm font-bold hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Stat Point
              </button>
            </div>

            {showStatForm && (
              <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gold-500/20 mb-6 space-y-4">
                <h3 className="font-bold text-lg">{editingStat ? 'Modify' : 'Create'} Landing Stat</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#B0B0B0] mb-1 block">Number / Text * (e.g. 5,000+)</label>
                    <input
                      value={statForm.number}
                      onChange={(e) => setStatForm((s) => ({ ...s, number: e.target.value }))}
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#B0B0B0] mb-1 block">Label * (e.g. Trees Planted)</label>
                    <input
                      value={statForm.label}
                      onChange={(e) => setStatForm((s) => ({ ...s, label: e.target.value }))}
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4 border-t border-gray-800">
                  <button onClick={saveStat} className="bg-gold-500 text-black px-6 py-2 rounded-full text-xs font-extrabold uppercase">
                    Save Stat
                  </button>
                  <button onClick={() => setShowStatForm(false)} className="text-sm text-[#B0B0B0] hover:text-white px-2">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.id} className="bg-[#111111] p-6 rounded-xl border border-gold-500/10 text-center relative group">
                  <div className="text-2xl font-extrabold text-gold-500">{s.number}</div>
                  <div className="text-xs text-[#B0B0B0] mt-1 uppercase">{s.label}</div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingStat(s)
                        setStatForm({ number: s.number, label: s.label, icon_name: s.icon_name, display_order: s.display_order, published: s.published })
                        setShowStatForm(true)
                      }}
                      className="text-gold-500"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteStat(s.id)} className="text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TAB 5: CONTENT ═══ */}
        {tab === 'content' && (
          <div className="space-y-6">
            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-gold-500/10 space-y-4">
              <h3 className="font-bold border-b border-gray-800 pb-2 text-lg">Landing Hero Typography</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#B0B0B0] mb-1 block">Hero Badge</label>
                  <input
                    value={content.hero_badge || ''}
                    onChange={(e) => setContent((c: any) => ({ ...c, hero_badge: e.target.value }))}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#B0B0B0] mb-1 block">Hero Main Title</label>
                  <input
                    value={content.hero_title || ''}
                    onChange={(e) => setContent((c: any) => ({ ...c, hero_title: e.target.value }))}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-gold-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-[#B0B0B0] mb-1 block">Hero Supporting Subtitle</label>
                  <input
                    value={content.hero_subtitle || ''}
                    onChange={(e) => setContent((c: any) => ({ ...c, hero_subtitle: e.target.value }))}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-gold-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={saveContent}
              disabled={savingContent}
              className="bg-gold-500 text-black px-6 py-3 rounded-full text-xs font-extrabold uppercase"
            >
              {savingContent ? 'Saving...' : 'Save Configuration Changes'}
            </button>
          </div>
        )}
      </main>
      <Sidebar />
    </div>
  )
}