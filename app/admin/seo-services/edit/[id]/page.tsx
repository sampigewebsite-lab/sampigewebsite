'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Upload, X, Plus, Trash2, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'

const ICON_OPTIONS = [
  'Recycle', 'TreePine', 'Heart', 'Shield', 'Truck', 'Layers',
  'Sparkles', 'Users', 'MapPin', 'Phone', 'Clock', 'CheckCircle2',
  'Mail', 'Building2', 'HandHeart', 'Leaf', 'Droplets', 'Sun',
  'Star', 'Target', 'Zap',
]

export default function EditSeoService() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const isNew = id === 'new'
  const supabase = createClient()

  const [saving, setSaving] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)

  const [form, setForm] = useState({
    slug: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    published: true,

    hero_badge: 'Eco-Friendly Service',
    hero_heading: '',
    hero_subtext: '',
    hero_image: '',
    hero_cta_1_label: 'Get Drop-Off Details',
    hero_cta_1_link: '/contact',
    hero_cta_2_label: 'Learn More',
    hero_cta_2_link: '#features',

    hero_strip_items: [
      { icon: 'MapPin', title: 'Malleshwaram Based', desc: 'Local community center' },
      { icon: 'Recycle', title: '100% Recycled', desc: 'Zero landfill policy' },
      { icon: 'Users', title: 'Community Led', desc: 'Working together for Bangalore' },
      { icon: 'Shield', title: 'CSR Certified', desc: 'Documented social impact' },
    ],

    split_badge: 'Grow Together',
    split_heading: '',
    split_subtext: '',
    split_list_items: [
      { icon: 'Users', title: 'Community Driven', desc: 'Join volunteers working for a cleaner Bangalore.' },
      { icon: 'Leaf', title: 'Eco Friendly Processing', desc: 'Materials separated and processed safely.' },
    ],
    split_image: '',
    split_floating_title: 'Create a Greener Tomorrow',
    split_floating_text: 'Every action leads to a cleaner, safer city for everyone.',
    split_floating_link: '/get-involved/volunteer',

    grid_badge: 'What We Offer',
    grid_heading: 'Our Service Highlights',
    grid_items: [
      { image: '', icon: 'TreePine', title: 'Material Sorting', text: 'Careful breakdown of wood, glass, and metal.', link: '/contact' },
    ],

    related_project_slug: '',
    project_card_heading: 'Explore Our Full NGO Project',
    project_card_text: 'Discover how our team handles recycling drives and community impact in Bangalore.',

    service_areas: ['Malleshwaram', 'Rajajinagar', 'Yeshwanthpur', 'Sadashivanagar', 'Bangalore'],
    faqs: [
      { question: 'Where can I drop these off?', answer: 'You can drop them at our office in Malleshwaram during working hours.' },
    ],
  })

  useEffect(() => {
    if (!isNew) {
      supabase.from('seo_services').select('*').eq('id', id).single().then(({ data, error }) => {
        if (data) {
          setForm({
            slug: data.slug || '',
            meta_title: data.meta_title || '',
            meta_description: data.meta_description || '',
            meta_keywords: data.meta_keywords || '',
            published: data.published ?? true,

            hero_badge: data.hero_badge || 'Eco-Friendly Service',
            hero_heading: data.hero_heading || '',
            hero_subtext: data.hero_subtext || '',
            hero_image: data.hero_image || '',
            hero_cta_1_label: data.hero_cta_1_label || 'Get Drop-Off Details',
            hero_cta_1_link: data.hero_cta_1_link || '/contact',
            hero_cta_2_label: data.hero_cta_2_label || 'Learn More',
            hero_cta_2_link: data.hero_cta_2_link || '#features',

            hero_strip_items: data.hero_strip_items || [],
            split_badge: data.split_badge || '',
            split_heading: data.split_heading || '',
            split_subtext: data.split_subtext || '',
            split_list_items: data.split_list_items || [],
            split_image: data.split_image || '',
            split_floating_title: data.split_floating_title || '',
            split_floating_text: data.split_floating_text || '',
            split_floating_link: data.split_floating_link || '',

            grid_badge: data.grid_badge || '',
            grid_heading: data.grid_heading || '',
            grid_items: data.grid_items || [],

            related_project_slug: data.related_project_slug || '',
            project_card_heading: data.project_card_heading || '',
            project_card_text: data.project_card_text || '',

            service_areas: data.service_areas || [],
            faqs: data.faqs || [],
          })
        }
        setInitialLoading(false)
      })
    } else {
      setInitialLoading(false)
    }
  }, [id, isNew])

  const handleImageUpload = async (file: File, keyName: string, gridIdx?: number) => {
    if (!file.type.startsWith('image/')) return toast.error('Please upload an image file')
    setUploading(keyName + (gridIdx !== undefined ? `_${gridIdx}` : ''))
    try {
      const ext = file.name.split('.').pop()
      const path = `seo-services/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('media').upload(path, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)

      if (gridIdx !== undefined) {
        const nextGrid = [...form.grid_items]
        nextGrid[gridIdx].image = publicUrl
        setForm((prev) => ({ ...prev, grid_items: nextGrid }))
      } else {
        setForm((prev) => ({ ...prev, [keyName]: publicUrl }))
      }
      toast.success('Image uploaded!')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(null)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.slug || !form.meta_title || !form.hero_heading) {
      return toast.error('Slug, Meta Title, and Hero Heading are required!')
    }
    setSaving(true)

    const payload = {
      ...form,
      updated_at: new Date().toISOString(),
    }

    let error
    if (isNew) {
      ;({ error } = await supabase.from('seo_services').insert(payload))
    } else {
      ;({ error } = await supabase.from('seo_services').update(payload).eq('id', id))
    }

    setSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('SEO Landing Page Saved!')
      router.push('/admin/seo-services')
    }
  }

  const inputClass = 'w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500 transition-colors'
  const labelClass = 'block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1'

  if (initialLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-gold-500">Loading editor...</div>
  }

  return (
    <div className="flex min-h-screen bg-black text-white w-full justify-between">
      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto overflow-y-auto">
        <div className="flex items-center justify-between mb-8 border-b border-gold-500/10 pb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin/seo-services')} className="p-2 text-gray-400 hover:text-white rounded-lg">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{isNew ? 'Create New SEO Landing Page' : 'Edit SEO Landing Page'}</h1>
              <p className="text-xs text-gray-400 mt-1">Structured GreenRoots layout adapted for Sampige dark/gold theme.</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gold-500 text-black font-bold rounded-full hover:bg-gold-400 transition-all text-sm shadow-lg shadow-gold-500/20"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Page'}
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gold-500/10 space-y-4">
            <h2 className="text-lg font-bold text-gold-500 border-b border-gold-500/10 pb-2">1. Page Meta & URL Slug</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>URL Slug * (e.g. photo-frame-recycling-bangalore)</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono">/services/</span>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })}
                    placeholder="temple-waste-recycling"
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Optional Related Project Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono">/projects/</span>
                  <input
                    value={form.related_project_slug}
                    onChange={(e) => setForm({ ...form, related_project_slug: e.target.value })}
                    placeholder="divine-items-photo-frame-disposal"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className={labelClass}>Meta Title * (Google search snippet heading)</label>
              <input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} placeholder="Photo Frame Recycling in Malleshwaram, Bangalore | Sampige NGO" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Meta Description (Google description paragraph)</label>
              <textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} rows={2} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Target Keywords (Comma separated)</label>
              <input value={form.meta_keywords} onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })} placeholder="photo frame recycling, recycle frames, Malleshwaram NGO" className={inputClass} />
            </div>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gold-500/10 space-y-4">
            <h2 className="text-lg font-bold text-gold-500 border-b border-gold-500/10 pb-2">2. Hero Banner (Left Text, Right Image)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Hero Badge</label>
                <input value={form.hero_badge} onChange={(e) => setForm({ ...form, hero_badge: e.target.value })} placeholder="Eco-Friendly Recycling Service" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hero Main Heading *</label>
                <input value={form.hero_heading} onChange={(e) => setForm({ ...form, hero_heading: e.target.value })} placeholder="Everything You Need for Frame Recycling" className={inputClass} required />
              </div>
            </div>
            <div>
              <label className={labelClass}>Hero Subtext Paragraph</label>
              <textarea value={form.hero_subtext} onChange={(e) => setForm({ ...form, hero_subtext: e.target.value })} rows={3} className={inputClass} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input value={form.hero_cta_1_label} onChange={(e) => setForm({ ...form, hero_cta_1_label: e.target.value })} placeholder="Primary Button Label (e.g. Get Drop-Off Details)" className={inputClass} />
              <input value={form.hero_cta_1_link} onChange={(e) => setForm({ ...form, hero_cta_1_link: e.target.value })} placeholder="Link (e.g. /contact)" className={inputClass} />
              <input value={form.hero_cta_2_label} onChange={(e) => setForm({ ...form, hero_cta_2_label: e.target.value })} placeholder="Secondary Label" className={inputClass} />
              <input value={form.hero_cta_2_link} onChange={(e) => setForm({ ...form, hero_cta_2_link: e.target.value })} placeholder="Secondary Link" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hero Right Image</label>
              <div className="flex items-center gap-4">
                {form.hero_image ? (
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gold-500/30">
                    <img src={form.hero_image} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setForm({ ...form, hero_image: '' })} className="absolute top-1 right-1 bg-red-600 rounded-full p-1"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <div className="w-32 h-20 bg-black/50 border border-dashed border-gray-700 rounded-lg flex items-center justify-center"><ImageIcon className="text-gray-600" /></div>
                )}
                <label className="px-4 py-2 bg-gold-500 text-black text-xs font-bold rounded-lg cursor-pointer hover:bg-gold-400 flex items-center gap-2">
                  <Upload className="w-4 h-4" /> {uploading === 'hero_image' ? 'Uploading...' : 'Upload Hero Photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'hero_image')} />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gold-500/10 space-y-4">
            <h2 className="text-lg font-bold text-gold-500 border-b border-gold-500/10 pb-2">3. Hero Overlapping Feature Strip (4 Cards)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {form.hero_strip_items.map((item, idx) => (
                <div key={idx} className="bg-black/50 p-4 rounded-xl border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gold-500">Card {idx + 1}</span>
                  </div>
                  <select value={item.icon} onChange={(e) => { const next = [...form.hero_strip_items]; next[idx].icon = e.target.value; setForm({ ...form, hero_strip_items: next }) }} className={inputClass}>
                    {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                  <input value={item.title} onChange={(e) => { const next = [...form.hero_strip_items]; next[idx].title = e.target.value; setForm({ ...form, hero_strip_items: next }) }} placeholder="Card Title" className={inputClass} />
                  <input value={item.desc} onChange={(e) => { const next = [...form.hero_strip_items]; next[idx].desc = e.target.value; setForm({ ...form, hero_strip_items: next }) }} placeholder="Card Description" className={inputClass} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gold-500/10 space-y-4">
            <h2 className="text-lg font-bold text-gold-500 border-b border-gold-500/10 pb-2">4. Split Section ("Grow Together" Layout)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Section Badge</label>
                <input value={form.split_badge} onChange={(e) => setForm({ ...form, split_badge: e.target.value })} placeholder="How It Works" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Section Heading</label>
                <input value={form.split_heading} onChange={(e) => setForm({ ...form, split_heading: e.target.value })} placeholder="Drop Off. We Sort. We Recycle." className={inputClass} />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className={labelClass}>Left Side Icon List Items</label>
              {form.split_list_items.map((item, idx) => (
                <div key={idx} className="flex gap-2 bg-black/40 p-3 rounded-xl items-center border border-gray-800">
                  <select value={item.icon} onChange={(e) => { const next = [...form.split_list_items]; next[idx].icon = e.target.value; setForm({ ...form, split_list_items: next }) }} className="bg-black text-white text-xs border border-gray-700 rounded px-2 py-1">
                    {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                  <input value={item.title} onChange={(e) => { const next = [...form.split_list_items]; next[idx].title = e.target.value; setForm({ ...form, split_list_items: next }) }} placeholder="Point Title" className={inputClass} />
                  <input value={item.desc} onChange={(e) => { const next = [...form.split_list_items]; next[idx].desc = e.target.value; setForm({ ...form, split_list_items: next }) }} placeholder="Point Subtext" className={inputClass} />
                  <button type="button" onClick={() => setForm({ ...form, split_list_items: form.split_list_items.filter((_, i) => i !== idx) })} className="text-red-400 p-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button type="button" onClick={() => setForm({ ...form, split_list_items: [...form.split_list_items, { icon: 'Heart', title: '', desc: '' }] })} className="text-xs text-gold-500 flex items-center gap-1 font-bold">+ Add List Point</button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 border-t border-gray-800 pt-4">
              <div>
                <label className={labelClass}>Right Main Image</label>
                <div className="flex items-center gap-4">
                  {form.split_image ? (
                    <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-gold-500/30">
                      <img src={form.split_image} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setForm({ ...form, split_image: '' })} className="absolute top-1 right-1 bg-red-600 rounded-full p-1"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <div className="w-28 h-20 bg-black/50 border border-dashed border-gray-700 rounded-lg flex items-center justify-center"><ImageIcon className="text-gray-600" /></div>
                  )}
                  <label className="px-4 py-2 bg-gold-500 text-black text-xs font-bold rounded-lg cursor-pointer hover:bg-gold-400">
                    Upload Split Photo
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'split_image')} />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Right Floating Card</label>
                <input value={form.split_floating_title} onChange={(e) => setForm({ ...form, split_floating_title: e.target.value })} placeholder="Floating Card Title" className={inputClass} />
                <input value={form.split_floating_text} onChange={(e) => setForm({ ...form, split_floating_text: e.target.value })} placeholder="Floating Card Subtext" className={inputClass} />
                <input value={form.split_floating_link} onChange={(e) => setForm({ ...form, split_floating_link: e.target.value })} placeholder="Card Link (e.g. /contact)" className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gold-500/10 space-y-4">
            <h2 className="text-lg font-bold text-gold-500 border-b border-gold-500/10 pb-2">5. Grid Cards Section ("What We Offer")</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input value={form.grid_badge} onChange={(e) => setForm({ ...form, grid_badge: e.target.value })} placeholder="Section Badge (e.g. What We Accept)" className={inputClass} />
              <input value={form.grid_heading} onChange={(e) => setForm({ ...form, grid_heading: e.target.value })} placeholder="Section Heading" className={inputClass} />
            </div>

            <div className="space-y-4 pt-2">
              {form.grid_items.map((card, idx) => (
                <div key={idx} className="bg-black/50 p-4 rounded-xl border border-gray-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gold-500">Grid Card {idx + 1}</span>
                    <button type="button" onClick={() => setForm({ ...form, grid_items: form.grid_items.filter((_, i) => i !== idx) })} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <input value={card.title} onChange={(e) => { const next = [...form.grid_items]; next[idx].title = e.target.value; setForm({ ...form, grid_items: next }) }} placeholder="Card Title" className={inputClass} />
                    <select value={card.icon} onChange={(e) => { const next = [...form.grid_items]; next[idx].icon = e.target.value; setForm({ ...form, grid_items: next }) }} className={inputClass}>
                      {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                    <input value={card.link} onChange={(e) => { const next = [...form.grid_items]; next[idx].link = e.target.value; setForm({ ...form, grid_items: next }) }} placeholder="Card Link" className={inputClass} />
                  </div>
                  <textarea value={card.text} onChange={(e) => { const next = [...form.grid_items]; next[idx].text = e.target.value; setForm({ ...form, grid_items: next }) }} rows={2} placeholder="Card description" className={inputClass} />
                  
                  <div className="flex items-center gap-3">
                    {card.image ? (
                      <img src={card.image} className="w-16 h-12 object-cover rounded border border-gold-500/20" />
                    ) : (
                      <span className="text-xs text-gray-500">No Image</span>
                    )}
                    <label className="text-xs bg-gold-500/10 text-gold-500 border border-gold-500/20 px-3 py-1.5 rounded cursor-pointer hover:bg-gold-500/20">
                      Upload Card Photo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'grid_image', idx)} />
                    </label>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setForm({ ...form, grid_items: [...form.grid_items, { image: '', icon: 'TreePine', title: '', text: '', link: '/contact' }] })} className="text-xs text-gold-500 font-bold flex items-center gap-1">+ Add Grid Card</button>
            </div>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gold-500/10 space-y-4">
            <h2 className="text-lg font-bold text-gold-500 border-b border-gold-500/10 pb-2">6. FAQ Accordion & Service Areas</h2>
            
            <div className="space-y-3">
              <label className={labelClass}>FAQ List (Auto generates Google FAQ Schema)</label>
              {form.faqs.map((faq, idx) => (
                <div key={idx} className="bg-black/50 p-4 rounded-xl border border-gray-800 space-y-2">
                  <div className="flex justify-between">
                    <input value={faq.question} onChange={(e) => { const next = [...form.faqs]; next[idx].question = e.target.value; setForm({ ...form, faqs: next }) }} placeholder="Question" className={inputClass} />
                    <button type="button" onClick={() => setForm({ ...form, faqs: form.faqs.filter((_, i) => i !== idx) })} className="text-red-400 p-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <textarea value={faq.answer} onChange={(e) => { const next = [...form.faqs]; next[idx].answer = e.target.value; setForm({ ...form, faqs: next }) }} rows={2} placeholder="Answer" className={inputClass} />
                </div>
              ))}
              <button type="button" onClick={() => setForm({ ...form, faqs: [...form.faqs, { question: '', answer: '' }] })} className="text-xs text-gold-500 font-bold">+ Add FAQ Item</button>
            </div>
          </div>

          <div className="flex justify-between items-center bg-[#1A1A1A] p-6 rounded-2xl border border-gold-500/10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 accent-gold-500" />
              <span className="text-sm font-bold text-white">Publish Immediately</span>
            </label>
            <button type="submit" disabled={saving} className="bg-gold-500 text-black font-extrabold px-8 py-3 rounded-full uppercase text-xs hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20">
              {saving ? 'Saving Page...' : 'Save & Publish SEO Page'}
            </button>
          </div>
        </form>
      </main>
      <Sidebar />
    </div>
  )
}