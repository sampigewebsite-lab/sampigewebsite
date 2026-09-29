'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'
import {
  Loader2, Save, Settings, Plus, Trash2, 
  Image as ImageIcon, Edit2, BarChart3, 
  CheckCircle2, Share2, Download,
  Link as LinkIcon, Layers, Sparkles, X, Upload
} from 'lucide-react'

export default function GreensAndBrownsAdminPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'steps' | 'impact' | 'monthly' | 'gallery' | 'participation' | 'seo_qr'>('general')
  const [settings, setSettings] = useState<any>(null)
  const [steps, setSteps] = useState<any[]>([])
  const [stats, setStats] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [gallery, setGallery] = useState<any[]>([])
  const [participation, setParticipation] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  // Edit states
  const [editingStep, setEditingStep] = useState<any>(null)
  const [editingStat, setEditingStat] = useState<any>(null)
  const [editingCard, setEditingCard] = useState<any>(null)

  const [newStep, setNewStep] = useState({ step_number: 1, title: '', description: '', why_text: '', icon_name: 'Leaf' })
  const [newMonth, setNewMonth] = useState({ month_name: 'January', year: 2026, waste_collected_kg: 0, waste_diverted_kg: 0, volunteers_count: 0 })
  const [newGallery, setNewGallery] = useState({ category: 'Collection', caption: '', image_url: '' })

  const supabase = createClient()
  const publicUrl = 'https://www.sampigefoundation.com/greens-and-browns/temple-flower-composting'
  const trackedQrUrl = `${publicUrl}?utm_source=temple_board&utm_medium=qr_scan&utm_campaign=greens_and_browns_physical`

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [
        { data: settingsList },
        { data: stepsData },
        { data: statsData },
        { data: monthlyDataRes },
        { data: galleryData },
        { data: partData }
      ] = await Promise.all([
        supabase.from('gb_project_settings').select('*').order('created_at', { ascending: false }),
        supabase.from('gb_process_steps').select('*').order('sort_order', { ascending: true }),
        supabase.from('gb_impact_stats').select('*').order('sort_order', { ascending: true }),
        supabase.from('gb_monthly_impact').select('*').order('year', { ascending: false }).order('sort_order', { ascending: true }),
        supabase.from('gb_gallery').select('*').order('sort_order', { ascending: true }),
        supabase.from('gb_participation').select('*').order('sort_order', { ascending: true })
      ])

      if (settingsList && settingsList.length > 0) {
        setSettings(settingsList[0])
      } else {
        const { data: created } = await supabase.from('gb_project_settings').insert([{}]).select().single()
        setSettings(created)
      }

      setSteps(stepsData || [])
      setStats(statsData || [])
      setMonthlyData(monthlyDataRes || [])
      setGallery(galleryData || [])
      setParticipation(partData || [])
    } catch (error) {
      console.error(error)
      toast.error('Error fetching settings')
    } finally {
      setLoading(false)
    }
  }

  // Handle direct image uploads securely
  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>, fieldName: string, table: string = 'gb_project_settings', recordId?: string) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingField(fieldName)
    const fileExt = file.name.split('.').pop()
    const fileName = `gb_${fieldName}_${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      toast.error('Image upload failed')
      setUploadingField(null)
      return
    }

    const { data: pub } = supabase.storage.from('media').getPublicUrl(fileName)
    const publicMediaUrl = pub.publicUrl

    if (table === 'gb_project_settings') {
      const targetId = settings?.id
      if (targetId) {
        await supabase.from('gb_project_settings').update({ [fieldName]: publicMediaUrl }).eq('id', targetId)
      } else {
        const { data: created } = await supabase.from('gb_project_settings').insert([{ [fieldName]: publicMediaUrl }]).select().single()
        if (created) setSettings(created)
      }
      setSettings((prev: any) => ({ ...prev, [fieldName]: publicMediaUrl }))
    } else if (table === 'gb_process_steps' && recordId) {
      setSteps(prev => prev.map(s => s.id === recordId ? { ...s, image_url: publicMediaUrl } : s))
      if (editingStep && editingStep.id === recordId) {
        setEditingStep((prev: any) => ({ ...prev, image_url: publicMediaUrl }))
      }
      await supabase.from('gb_process_steps').update({ image_url: publicMediaUrl }).eq('id', recordId)
    } else if (table === 'gb_gallery_new') {
      setNewGallery(prev => ({ ...prev, image_url: publicMediaUrl }))
    }

    toast.success('Image saved live!')
    setUploadingField(null)
    e.target.value = ''
  }

  // Save Text Fields
  async function handleSaveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)

    const updates = {
      project_name: formData.get('project_name'),
      hero_heading: formData.get('hero_heading'),
      hero_subheading: formData.get('hero_subheading'),
      hero_description: formData.get('hero_description'),
      hero_cta_text: formData.get('hero_cta_text'),
      hero_cta_secondary_text: formData.get('hero_cta_secondary_text'),
      problem_heading: formData.get('problem_heading'),
      problem_description: formData.get('problem_description'),
      problem_quote: formData.get('problem_quote'),
      why_heading: formData.get('why_heading'),
      why_description: formData.get('why_description'),
      why_current_flow_heading: formData.get('why_current_flow_heading'),
      why_greens_flow_heading: formData.get('why_greens_flow_heading'),
      final_cta_heading: formData.get('final_cta_heading'),
      final_cta_description: formData.get('final_cta_description'),
      final_cta_button_text: formData.get('final_cta_button_text'),
      final_cta_button_url: formData.get('final_cta_button_url'),
      final_cta_secondary_text: formData.get('final_cta_secondary_text'),
      final_cta_secondary_url: formData.get('final_cta_secondary_url'),
      video_url: formData.get('video_url'),
      video_title: formData.get('video_title'),
      video_description: formData.get('video_description'),
      composting_duration: formData.get('composting_duration'),
    }

    if (settings?.id) {
      await supabase.from('gb_project_settings').update(updates).eq('id', settings.id)
    } else {
      const { data: created } = await supabase.from('gb_project_settings').insert([updates]).select().single()
      if (created) setSettings(created)
    }

    toast.success('Settings saved live!')
    setSaving(false)
  }

  // Manage Steps
  async function handleCreateStep(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('gb_process_steps').insert([{ ...newStep, sort_order: newStep.step_number }])
    toast.success('Step added!')
    setNewStep({ step_number: steps.length + 2, title: '', description: '', why_text: '', icon_name: 'Leaf' })
    fetchData()
  }

  async function handleUpdateStep(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingStep) return
    const formData = new FormData(e.currentTarget)
    const updates = {
      step_number: Number(formData.get('step_number')),
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      why_text: formData.get('why_text') as string,
      icon_name: formData.get('icon_name') as string,
      sort_order: Number(formData.get('step_number'))
    }
    await supabase.from('gb_process_steps').update(updates).eq('id', editingStep.id)
    toast.success('Step saved successfully!')
    setEditingStep(null)
    fetchData()
  }

  async function handleDeleteStep(id: string) {
    if (!confirm('Remove step?')) return
    await supabase.from('gb_process_steps').delete().eq('id', id)
    fetchData()
  }

  // Manage Counters
  async function handleSaveStat(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingStat) return
    const formData = new FormData(e.currentTarget)
    const updates = {
      value: formData.get('value') as string,
      label: formData.get('label') as string,
      unit: formData.get('unit') as string,
    }
    await supabase.from('gb_impact_stats').update(updates).eq('id', editingStat.id)
    toast.success('Counter updated')
    setEditingStat(null)
    fetchData()
  }

  // Manage Monthly
  async function handleAddMonth(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('gb_monthly_impact').insert([newMonth])
    toast.success('Monthly record added')
    setNewMonth({ month_name: 'January', year: 2026, waste_collected_kg: 0, waste_diverted_kg: 0, volunteers_count: 0 })
    fetchData()
  }

  async function handleDeleteMonth(id: string) {
    if (!confirm('Delete record?')) return
    await supabase.from('gb_monthly_impact').delete().eq('id', id)
    fetchData()
  }

  // Manage Gallery
  async function handleAddGalleryItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newGallery.image_url) {
      toast.error('Upload an image first')
      return
    }
    await supabase.from('gb_gallery').insert([newGallery])
    toast.success('Photo added')
    setNewGallery({ category: 'Collection', caption: '', image_url: '' })
    fetchData()
  }

  async function handleDeleteGalleryItem(id: string) {
    if (!confirm('Delete photo?')) return
    await supabase.from('gb_gallery').delete().eq('id', id)
    fetchData()
  }

  // Manage Cards
  async function handleUpdateCard(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingCard) return
    const formData = new FormData(e.currentTarget)
    const updates = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      icon_emoji: formData.get('icon_emoji') as string,
      cta_text: formData.get('cta_text') as string,
      cta_url: formData.get('cta_url') as string,
    }
    await supabase.from('gb_participation').update(updates).eq('id', editingCard.id)
    toast.success('Card updated')
    setEditingCard(null)
    fetchData()
  }

  // SEO Save
  async function handleSaveSEO(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const updates = {
      meta_title: formData.get('meta_title'),
      meta_description: formData.get('meta_description'),
      og_title: formData.get('og_title'),
      og_description: formData.get('og_description'),
    }
    if (settings?.id) {
      await supabase.from('gb_project_settings').update(updates).eq('id', settings.id)
    }
    toast.success('SEO updated!')
    setSaving(false)
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

        {/* Top Header */}
        <div className="mb-8 border-b border-gray-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#FFB300]/10 text-[#FFB300] text-xs px-2.5 py-1 rounded-full font-extrabold tracking-widest uppercase">
                Campaign Ecosystem
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Greens & Browns CMS</h1>
            <p className="text-gray-400 text-sm mt-1">
              Diverting temple flower and organic waste from landfills.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#141414] border border-gray-800 text-gray-300 text-xs font-bold rounded-xl hover:text-[#FFB300] flex items-center gap-1.5 transition-all"
            >
              <LinkIcon className="w-3.5 h-3.5" /> View Public Page
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {[
            { id: 'general', label: 'Branding & Content', icon: Settings },
            { id: 'steps', label: 'Process Steps', icon: Layers },
            { id: 'impact', label: 'Counters', icon: BarChart3 },
            { id: 'monthly', label: 'Monthly Records', icon: CheckCircle2 },
            { id: 'gallery', label: 'Work Gallery', icon: ImageIcon },
            { id: 'participation', label: 'Involvement Cards', icon: Sparkles },
            { id: 'seo_qr', label: 'SEO & QR Code', icon: Share2 }
          ].map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  activeTab === t.id 
                    ? 'bg-[#FFB300] text-black border-[#FFB300]' 
                    : 'bg-[#141414] text-gray-400 border-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            )
          })}
        </div>

        {/* TAB 1: GENERAL BRANDING & TEXT */}
        {activeTab === 'general' && (
          <div className="space-y-8">
            <form onSubmit={handleSaveSettings} className="space-y-8">
              
              {/* Logo Section */}
              <div className="bg-[#141414] p-6 md:p-8 rounded-3xl border border-gray-800 space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-4">
                  <Sparkles className="w-5 h-5 text-[#FFB300]" /> Logo Placement Area
                </h3>
                
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-extrabold tracking-wider">
                      Greens & Browns Campaign Logo
                    </label>
                    <p className="text-xs text-gray-500">
                      Upload campaign logo. Appears in the top header and hero section.
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      {settings?.logo_url ? (
                        <div className="p-4 bg-black rounded-2xl border border-gray-800 w-44 aspect-video flex items-center justify-center">
                          <img src={settings.logo_url} className="max-h-full max-w-full object-contain" />
                        </div>
                      ) : (
                        <div className="p-4 bg-black rounded-2xl border border-gray-800 text-gray-500 text-xs w-44 aspect-video flex items-center justify-center">
                          No Logo Specified
                        </div>
                      )}
                      <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs">
                        {uploadingField === 'logo_url' ? 'Uploading...' : 'Replace logo'}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaUpload(e, 'logo_url')} />
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Campaign Initiative Name</label>
                      <input name="project_name" defaultValue={settings?.project_name || 'Greens & Browns'} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Composting Duration</label>
                      <input name="composting_duration" defaultValue={settings?.composting_duration || '90 Days'} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" placeholder="e.g. 90 Days" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Section */}
              <div className="bg-[#141414] p-6 md:p-8 rounded-3xl border border-gray-800 space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-4">Hero Section & Photo</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Hero Badge Subheading</label>
                    <input name="hero_subheading" defaultValue={settings?.hero_subheading || 'Greens & Browns Initiative'} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Hero Title</label>
                    <input name="hero_heading" defaultValue={settings?.hero_heading || 'From Temple Flowers to Compost'} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Hero Description</label>
                  <textarea name="hero_description" defaultValue={settings?.hero_description} rows={3} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
                </div>
                
                <div className="pt-4 border-t border-gray-800">
                  <label className="text-xs text-gray-400 uppercase font-extrabold tracking-wider block mb-2">
                    Hero Section Photo
                  </label>
                  <div className="flex items-center gap-4">
                    {settings?.hero_image_url ? (
                      <div className="w-48 aspect-video bg-black rounded-xl overflow-hidden border border-gray-800">
                        <img src={settings.hero_image_url} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-48 aspect-video bg-black rounded-xl border border-gray-800 flex items-center justify-center text-xs text-gray-600">No Photo Uploaded</div>
                    )}
                    <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-xl text-xs">
                      {uploadingField === 'hero_image_url' ? 'Uploading...' : 'Upload Hero Photo'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaUpload(e, 'hero_image_url')} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Problem Section */}
              <div className="bg-[#141414] p-6 md:p-8 rounded-3xl border border-gray-800 space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-4">The Problem & Photo</h3>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Problem Title</label>
                  <input name="problem_heading" defaultValue={settings?.problem_heading} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Problem Explanation Text</label>
                    <textarea name="problem_description" defaultValue={settings?.problem_description} rows={4} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Core Quote / Goal Highlight</label>
                    <textarea name="problem_quote" defaultValue={settings?.problem_quote} rows={4} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-800">
                  <label className="text-xs text-gray-400 uppercase font-extrabold tracking-wider block mb-2">
                    Problem Section Photo
                  </label>
                  <div className="flex items-center gap-4">
                    {settings?.problem_image_url ? (
                      <div className="w-48 aspect-video bg-black rounded-xl overflow-hidden border border-gray-800">
                        <img src={settings.problem_image_url} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-48 aspect-video bg-black rounded-xl border border-gray-800 flex items-center justify-center text-xs text-gray-600">No Photo Uploaded</div>
                    )}
                    <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-xl text-xs">
                      {uploadingField === 'problem_image_url' ? 'Uploading...' : 'Upload Problem Photo'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaUpload(e, 'problem_image_url')} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Video Embedding */}
              <div className="bg-[#141414] p-6 md:p-8 rounded-3xl border border-gray-800 space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-4">Video Highlight</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Video Title</label>
                    <input name="video_title" defaultValue={settings?.video_title || 'Watch the Journey'} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">YouTube Embed Link</label>
                    <input name="video_url" defaultValue={settings?.video_url} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none text-xs" placeholder="https://www.youtube.com/embed/XXXXXX" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Video Description</label>
                  <input name="video_description" defaultValue={settings?.video_description} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
                </div>
              </div>

              {/* Closing Call To Action */}
              <div className="bg-[#141414] p-6 md:p-8 rounded-3xl border border-gray-800 space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-4">Bottom Closing CTA</h3>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Heading</label>
                  <input name="final_cta_heading" defaultValue={settings?.final_cta_heading || 'Every Flower Diverted Matters'} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Description</label>
                  <textarea name="final_cta_description" defaultValue={settings?.final_cta_description} rows={2} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Primary Button Label</label>
                    <input name="final_cta_button_text" defaultValue={settings?.final_cta_button_text || 'Get Involved'} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Primary Button Link</label>
                    <input name="final_cta_button_url" defaultValue={settings?.final_cta_button_url || '/contact'} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none text-xs" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-4 bg-[#FFB300] text-black text-sm font-extrabold uppercase rounded-xl hover:bg-[#FFCA28] flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Text Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: PROCESS STEPS */}
        {activeTab === 'steps' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#141414] p-6 rounded-3xl border border-gray-800 h-fit space-y-4">
                <h3 className="text-md font-bold text-white pb-3 border-b border-gray-800 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#FFB300]" /> Add New Step
                </h3>
                <form onSubmit={handleCreateStep} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Step #</label>
                      <input
                        type="number"
                        value={newStep.step_number}
                        onChange={(e) => setNewStep(prev => ({ ...prev, step_number: Number(e.target.value) }))}
                        className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Icon Name</label>
                      <input
                        value={newStep.icon_name}
                        onChange={(e) => setNewStep(prev => ({ ...prev, icon_name: e.target.value }))}
                        className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white outline-none text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Title</label>
                    <input
                      required
                      value={newStep.title}
                      onChange={(e) => setNewStep(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white outline-none"
                      placeholder="e.g. Collection"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Description</label>
                    <textarea
                      value={newStep.description}
                      onChange={(e) => setNewStep(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Why explanation</label>
                    <textarea
                      value={newStep.why_text}
                      onChange={(e) => setNewStep(prev => ({ ...prev, why_text: e.target.value }))}
                      rows={2}
                      className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white outline-none text-xs"
                    />
                  </div>
                  <button type="submit" className="w-full py-3 bg-[#FFB300] hover:bg-[#FFCA28] text-black font-bold text-xs rounded-xl uppercase">
                    Insert Step
                  </button>
                </form>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="bg-[#141414] p-6 rounded-3xl border border-gray-800">
                  <h3 className="text-md font-bold text-white pb-3 border-b border-gray-800 mb-4">
                    Sequence Steps
                  </h3>
                  <div className="space-y-3">
                    {steps.map((st) => (
                      <div key={st.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-800 rounded-2xl bg-black/40 items-start sm:items-center justify-between">
                        <div className="flex gap-4 items-center">
                          <span className="text-2xl font-black text-amber-500/30">#{st.step_number}</span>
                          <div>
                            <h4 className="font-bold text-white text-sm">{st.title}</h4>
                            <p className="text-xs text-gray-400 max-w-md line-clamp-1">{st.description}</p>
                          </div>
                        </div>

                        {/* Step Image & Action Buttons */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="flex items-center gap-2">
                            {st.image_url ? (
                              <img src={st.image_url} className="w-10 h-10 rounded-xl object-cover border border-gray-800" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-black border border-gray-800 flex items-center justify-center text-[10px] text-gray-600">No Image</div>
                            )}
                            <label className="cursor-pointer p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-[10px] font-bold flex items-center gap-1">
                              <Upload className="w-3 h-3" />
                              {uploadingField === `step_${st.id}` ? '...' : 'Photo'}
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaUpload(e, `step_${st.id}`, 'gb_process_steps', st.id)} />
                            </label>
                          </div>

                          <button
                            onClick={() => setEditingStep(st)}
                            className="p-2 bg-gray-800 text-[#FFB300] hover:bg-gray-700 rounded-xl"
                            title="Edit Step Text"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStep(st.id)}
                            className="p-2 bg-red-950/20 text-red-400 hover:bg-red-900/40 rounded-xl"
                            title="Delete Step"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: IMPACT METRICS */}
        {activeTab === 'impact' && (
          <div className="bg-[#141414] p-6 rounded-3xl border border-gray-800">
            <h3 className="text-md font-bold text-white border-b border-gray-800 pb-4 mb-6">
              Impact Counters
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {stats.map((st) => (
                <div key={st.id} className="bg-black p-5 rounded-2xl border border-gray-800 space-y-3">
                  <div className="text-3xl font-black text-[#FFB300] font-mono">
                    {st.value} <span className="text-xs text-gray-400 font-bold uppercase">{st.unit}</span>
                  </div>
                  <p className="text-xs text-gray-300 font-bold">{st.label}</p>
                  <button
                    onClick={() => setEditingStat(st)}
                    className="w-full py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs hover:text-[#FFB300] flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Value
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MONTHLY DATA */}
        {activeTab === 'monthly' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#141414] p-6 rounded-3xl border border-gray-800 h-fit space-y-4">
              <h3 className="text-md font-bold text-white pb-3 border-b border-gray-800">Add Monthly Record</h3>
              <form onSubmit={handleAddMonth} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400">Month</label>
                  <select
                    value={newMonth.month_name}
                    onChange={(e) => setNewMonth(prev => ({ ...prev, month_name: e.target.value }))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Collected (KG)</label>
                  <input
                    type="number"
                    value={newMonth.waste_collected_kg}
                    onChange={(e) => setNewMonth(prev => ({ ...prev, waste_collected_kg: Number(e.target.value) }))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Diverted from Landfill (KG)</label>
                  <input
                    type="number"
                    value={newMonth.waste_diverted_kg}
                    onChange={(e) => setNewMonth(prev => ({ ...prev, waste_diverted_kg: Number(e.target.value) }))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Volunteers</label>
                  <input
                    type="number"
                    value={newMonth.volunteers_count}
                    onChange={(e) => setNewMonth(prev => ({ ...prev, volunteers_count: Number(e.target.value) }))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-[#FFB300] text-black font-bold text-xs rounded-xl uppercase">
                  Add Month Entry
                </button>
              </form>
            </div>

            <div className="md:col-span-2 bg-[#141414] rounded-3xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800"><h3 className="font-bold text-white">Monthly Impact Records</h3></div>
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-black text-gray-400 uppercase">
                  <tr>
                    <th className="px-6 py-4">Month</th>
                    <th className="px-6 py-4 text-right">Collected</th>
                    <th className="px-6 py-4 text-right">Diverted</th>
                    <th className="px-6 py-4 text-right">Volunteers</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 font-mono">
                  {monthlyData.map((m) => (
                    <tr key={m.id}>
                      <td className="px-6 py-4 text-white font-sans font-bold">{m.month_name} {m.year}</td>
                      <td className="px-6 py-4 text-right text-amber-400">{m.waste_collected_kg} kg</td>
                      <td className="px-6 py-4 text-right text-green-400">{m.waste_diverted_kg} kg</td>
                      <td className="px-6 py-4 text-right">{m.volunteers_count}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDeleteMonth(m.id)} className="text-red-400 p-1 bg-red-950/20 rounded"><Trash2 className="w-3.5 h-3.5"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: WORK GALLERY */}
        {activeTab === 'gallery' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#141414] p-6 rounded-3xl border border-gray-800 h-fit space-y-4">
              <h3 className="text-md font-bold text-white pb-3 border-b border-gray-800">Upload Photo</h3>
              <form onSubmit={handleAddGalleryItem} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400">Category</label>
                  <select
                    value={newGallery.category}
                    onChange={(e) => setNewGallery(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    {['Collection', 'Segregation', 'Weighing', 'Shredding', 'Layering', 'Composting', 'Finished Compost'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Caption</label>
                  <input
                    required
                    value={newGallery.caption}
                    onChange={(e) => setNewGallery(prev => ({ ...prev, caption: e.target.value }))}
                    className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  {newGallery.image_url ? (
                    <img src={newGallery.image_url} className="w-full aspect-video object-cover rounded-xl border border-gray-800 mb-2" />
                  ) : null}
                  <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-xl text-center text-xs block">
                    {uploadingField === 'gallery_new' ? 'Uploading...' : 'Choose Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaUpload(e, 'gallery_new', 'gb_gallery_new')} />
                  </label>
                </div>
                <button type="submit" className="w-full py-3 bg-[#FFB300] text-black font-bold text-xs rounded-xl uppercase">
                  Save to Gallery
                </button>
              </form>
            </div>

            <div className="md:col-span-2 bg-[#141414] p-6 rounded-3xl border border-gray-800">
              <h3 className="font-bold text-white mb-4">Gallery Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((g) => (
                  <div key={g.id} className="relative aspect-square bg-black border border-gray-800 rounded-xl overflow-hidden group">
                    <img src={g.image_url} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleDeleteGalleryItem(g.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PARTICIPATION CARDS */}
        {activeTab === 'participation' && (
          <div className="bg-[#141414] p-6 rounded-3xl border border-gray-800">
            <h3 className="font-bold text-white mb-6">Involvement Cards</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {participation.map((card) => (
                <div key={card.id} className="bg-black p-5 border border-gray-800 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{card.icon_emoji}</span>
                    <h4 className="font-bold text-white">{card.title}</h4>
                  </div>
                  <p className="text-xs text-gray-400">{card.description}</p>
                  <button onClick={() => setEditingCard(card)} className="py-2 px-4 bg-gray-900 border border-gray-800 rounded-xl text-xs text-[#FFB300] flex items-center gap-1.5">
                    <Edit2 className="w-3 h-3" /> Edit Card
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: SEO & QR CODE */}
        {activeTab === 'seo_qr' && (
          <div className="grid md:grid-cols-2 gap-8">
            <form onSubmit={handleSaveSEO} className="bg-[#141414] p-6 md:p-8 rounded-3xl border border-gray-800 space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-4">SEO Configurations</h3>
              <div>
                <label className="text-xs text-gray-400">Meta Title</label>
                <input name="meta_title" defaultValue={settings?.meta_title} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-xs" />
              </div>
              <div>
                <label className="text-xs text-gray-400">Meta Description</label>
                <textarea name="meta_description" defaultValue={settings?.meta_description} rows={3} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-xs" />
              </div>
              <button type="submit" disabled={saving} className="w-full py-3 bg-[#FFB300] text-black font-extrabold rounded-xl uppercase text-xs">
                Save SEO Settings
              </button>
            </form>

            <div className="bg-[#141414] p-6 md:p-8 rounded-3xl border border-gray-800 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-4">Physical Campaign QR Code</h3>
              <div className="flex flex-col items-center gap-4 p-4 bg-black rounded-2xl border border-gray-800">
                <div className="bg-white p-3 rounded-2xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=000000&data=${encodeURIComponent(trackedQrUrl)}`}
                    className="w-36 h-36"
                  />
                </div>
                <p className="text-[10px] font-mono text-gray-400 break-all text-center">{trackedQrUrl}</p>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&color=000000&data=${encodeURIComponent(trackedQrUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#FFB300] text-black rounded-xl text-xs font-extrabold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download High-Res 1000px QR
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* EDIT MODAL POPUPS (FIXES THE FROZEN EDIT BUTTON ISSUE)   */}
        {/* ========================================================= */}

        {/* 1. EDIT PROCESS STEP MODAL */}
        {editingStep && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#141414] border border-gray-800 p-6 md:p-8 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-lg font-bold text-white">Edit Step #{editingStep.step_number}</h3>
                <button onClick={() => setEditingStep(null)} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateStep} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Step #</label>
                    <input name="step_number" defaultValue={editingStep.step_number} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white text-xs outline-none focus:border-[#FFB300]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Icon Name</label>
                    <input name="icon_name" defaultValue={editingStep.icon_name} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-[#FFB300]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Title</label>
                  <input name="title" defaultValue={editingStep.title} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white text-xs outline-none focus:border-[#FFB300]" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Description</label>
                  <textarea name="description" defaultValue={editingStep.description} rows={2} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white text-xs outline-none focus:border-[#FFB300]" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Why Explanation</label>
                  <textarea name="why_text" defaultValue={editingStep.why_text} rows={2} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white text-xs outline-none focus:border-[#FFB300]" />
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-xs text-gray-400 block mb-1">Step Photo / Image</label>
                  <div className="flex items-center gap-4">
                    {editingStep.image_url ? (
                      <img src={editingStep.image_url} className="w-16 h-16 rounded-xl object-cover border border-gray-800" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-black border border-gray-800 flex items-center justify-center text-[10px] text-gray-500">No Image</div>
                    )}
                    <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingField === `step_${editingStep.id}` ? 'Uploading...' : 'Upload Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaUpload(e, `step_${editingStep.id}`, 'gb_process_steps', editingStep.id)} />
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-gray-800">
                  <button type="button" onClick={() => setEditingStep(null)} className="px-4 py-2 bg-gray-800 rounded-xl text-xs text-gray-300 hover:bg-gray-700">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#FFB300] text-black font-bold rounded-xl text-xs uppercase hover:bg-[#FFCA28]">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. EDIT COUNTER / METRIC MODAL */}
        {editingStat && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#141414] border border-gray-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-lg font-bold text-white">Edit Impact Counter</h3>
                <button onClick={() => setEditingStat(null)} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStat} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Value (e.g. 5,000+)</label>
                  <input name="value" defaultValue={editingStat.value} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white text-xs outline-none focus:border-[#FFB300]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Unit (e.g. KG, Temples, Tons)</label>
                  <input name="unit" defaultValue={editingStat.unit} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white text-xs outline-none focus:border-[#FFB300]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Label Text</label>
                  <input name="label" defaultValue={editingStat.label} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white text-xs outline-none focus:border-[#FFB300]" />
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-gray-800">
                  <button type="button" onClick={() => setEditingStat(null)} className="px-4 py-2 bg-gray-800 rounded-xl text-xs text-gray-300 hover:bg-gray-700">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#FFB300] text-black font-bold rounded-xl text-xs uppercase hover:bg-[#FFCA28]">Save Counter</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. EDIT INVOLVEMENT CARD MODAL */}
        {editingCard && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#141414] border border-gray-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-lg font-bold text-white">Edit Involvement Card</h3>
                <button onClick={() => setEditingCard(null)} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateCard} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Emoji Icon</label>
                  <input name="icon_emoji" defaultValue={editingCard.icon_emoji} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white text-xs outline-none focus:border-[#FFB300]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Title</label>
                  <input name="title" defaultValue={editingCard.title} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white text-xs outline-none focus:border-[#FFB300]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Description</label>
                  <textarea name="description" defaultValue={editingCard.description} rows={2} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white text-xs outline-none focus:border-[#FFB300]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Button Label</label>
                  <input name="cta_text" defaultValue={editingCard.cta_text} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white text-xs outline-none focus:border-[#FFB300]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Button Link</label>
                  <input name="cta_url" defaultValue={editingCard.cta_url} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white text-xs outline-none focus:border-[#FFB300]" />
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-gray-800">
                  <button type="button" onClick={() => setEditingCard(null)} className="px-4 py-2 bg-gray-800 rounded-xl text-xs text-gray-300 hover:bg-gray-700">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#FFB300] text-black font-bold rounded-xl text-xs uppercase hover:bg-[#FFCA28]">Save Card</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}