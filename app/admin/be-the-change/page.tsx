'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Save, Plus, Trash2, Upload, Eye, EyeOff } from 'lucide-react'
import Sidebar from '@/components/admin/Sidebar'

type Card = {
  id?: string
  title: string
  link: string
  image_url: string
  bg_color: string
  border_color: string
  icon_name: string
  display_order: number
  published: boolean
}

type SectionSettings = {
  title: string
  highlight: string
  subtitle: string
}

const EMPTY_CARD: Card = {
  title: '',
  link: '#',
  image_url: '',
  bg_color: '#FFB300',
  border_color: '',
  icon_name: 'Heart',
  display_order: 0,
  published: true,
}

const ICON_OPTIONS = [
  'Heart',
  'GraduationCap',
  'Star',
  'Handshake',
  'Laptop',
  'Users',
  'HandHeart',
  'Briefcase',
]

const COLOR_OPTIONS = [
  { label: 'Gold', value: '#FFB300' },
  { label: 'Orange', value: '#FF7A00' },
  { label: 'Dark', value: '#1A1A1A' },
  { label: 'Red', value: '#E53935' },
  { label: 'Blue', value: '#1E88E5' },
]

export default function BeTheChangeAdminPage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  const [settings, setSettings] = useState<SectionSettings>({
    title: 'I WANT TO',
    highlight: '#BETHECHANGE',
    subtitle: 'Choose how you want to make an impact with Sampige Foundation',
  })

  const [cards, setCards] = useState<Card[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'be_the_change')
        .single()

      if (settingsData?.value) {
        setSettings({
          title: settingsData.value.title || 'I WANT TO',
          highlight: settingsData.value.highlight || '#BETHECHANGE',
          subtitle: settingsData.value.subtitle || '',
        })
      }

      const { data: cardsData, error } = await supabase
        .from('be_the_change_cards')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setCards(cardsData || [])
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    setSaving(true)
    try {
      const { error } = await supabase.from('site_settings').upsert({
        key: 'be_the_change',
        value: settings,
      })
      if (error) throw error
      toast.success('Section text saved!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  async function saveCard(card: Card, index: number) {
    setSaving(true)
    try {
      if (card.id) {
        const { error } = await supabase
          .from('be_the_change_cards')
          .update({
            title: card.title,
            link: card.link,
            image_url: card.image_url,
            bg_color: card.bg_color,
            border_color: card.border_color,
            icon_name: card.icon_name,
            display_order: card.display_order,
            published: card.published,
            updated_at: new Date().toISOString(),
          })
          .eq('id', card.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('be_the_change_cards')
          .insert({
            title: card.title,
            link: card.link,
            image_url: card.image_url,
            bg_color: card.bg_color,
            border_color: card.border_color,
            icon_name: card.icon_name,
            display_order: card.display_order || index + 1,
            published: card.published,
          })
          .select()
          .single()
        if (error) throw error

        const updated = [...cards]
        updated[index] = data
        setCards(updated)
      }
      toast.success('Card saved!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save card')
    } finally {
      setSaving(false)
    }
  }

  async function deleteCard(id: string | undefined, index: number) {
    if (!id) {
      setCards(cards.filter((_, i) => i !== index))
      return
    }
    if (!confirm('Delete this card?')) return

    try {
      const { error } = await supabase.from('be_the_change_cards').delete().eq('id', id)
      if (error) throw error
      setCards(cards.filter((_, i) => i !== index))
      toast.success('Card deleted')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  async function uploadImage(file: File, index: number) {
    if (!file) return
    setUploading(String(index))
    try {
      const ext = file.name.split('.').pop()
      const fileName = `be-the-change/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage.from('media').upload(fileName, file)
      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('media').getPublicUrl(fileName)

      const updated = [...cards]
      updated[index] = { ...updated[index], image_url: publicUrl }
      setCards(updated)
      toast.success('Image uploaded!')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(null)
    }
  }

  function updateCard(index: number, field: keyof Card, value: any) {
    const updated = [...cards]
    updated[index] = { ...updated[index], [field]: value }
    setCards(updated)
  }

  function addCard() {
    setCards([
      ...cards,
      {
        ...EMPTY_CARD,
        title: 'NEW CARD',
        display_order: cards.length + 1,
      },
    ])
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-white w-full">
        <main className="flex-1 p-8 text-gray-400">Loading...</main>
        <Sidebar />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-black text-white w-full justify-between">
      <main className="flex-1 min-w-0 p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">#BeTheChange Section</h1>
          <p className="text-gray-400">
            Control the homepage cards — text, images, links, and colors.
          </p>
        </div>

        {/* Section Settings */}
        <div className="bg-[#1A1A1A] border border-gold-500/20 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-[#FFB300] mb-4">Section Title</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title (left part)</label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-[#FFB300] outline-none"
                placeholder="I WANT TO"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Highlight (gold part)</label>
              <input
                type="text"
                value={settings.highlight}
                onChange={(e) => setSettings({ ...settings, highlight: e.target.value })}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-[#FFB300] outline-none"
                placeholder="#BETHECHANGE"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Subtitle</label>
            <input
              type="text"
              value={settings.subtitle}
              onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-[#FFB300] outline-none"
              placeholder="Choose how you want to make an impact..."
            />
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#FFB300] text-black font-semibold px-5 py-2.5 rounded-full hover:scale-105 transition-transform disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Section Text
          </button>
        </div>

        {/* Cards */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Cards ({cards.length})</h2>
          <button
            onClick={addCard}
            className="inline-flex items-center gap-2 bg-[#1A1A1A] border border-[#FFB300]/40 text-[#FFB300] font-medium px-4 py-2 rounded-full hover:bg-[#FFB300]/10 transition"
          >
            <Plus className="w-4 h-4" />
            Add Card
          </button>
        </div>

        <div className="space-y-6 pb-12">
          {cards.map((card, index) => (
            <div
              key={card.id || `new-${index}`}
              className="bg-[#1A1A1A] border border-gold-500/20 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Card {index + 1}:{' '}
                  <span className="text-[#FFB300]">{card.title || 'Untitled'}</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCard(index, 'published', !card.published)}
                    className={`p-2 rounded-lg border ${
                      card.published
                        ? 'border-green-500/40 text-green-400'
                        : 'border-gray-600 text-gray-500'
                    }`}
                    title={card.published ? 'Published' : 'Hidden'}
                  >
                    {card.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteCard(card.id, index)}
                    className="p-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => updateCard(index, 'title', e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-[#FFB300] outline-none"
                    placeholder="VOLUNTEER"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Link (where it goes)</label>
                  <input
                    type="text"
                    value={card.link}
                    onChange={(e) => updateCard(index, 'link', e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-[#FFB300] outline-none"
                    placeholder="/get-involved/volunteer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Background Color</label>
                  <select
                    value={card.bg_color}
                    onChange={(e) => updateCard(index, 'bg_color', e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-[#FFB300] outline-none"
                  >
                    {COLOR_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label} ({c.value})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Border Color (optional, for dark cards)
                  </label>
                  <select
                    value={card.border_color || ''}
                    onChange={(e) => updateCard(index, 'border_color', e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-[#FFB300] outline-none"
                  >
                    <option value="">No border</option>
                    {COLOR_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Icon</label>
                  <select
                    value={card.icon_name}
                    onChange={(e) => updateCard(index, 'icon_name', e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-[#FFB300] outline-none"
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={card.display_order}
                    onChange={(e) =>
                      updateCard(index, 'display_order', parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-[#FFB300] outline-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Card Image</label>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  {card.image_url ? (
                    <img
                      src={card.image_url}
                      alt={card.title}
                      className="w-28 h-36 object-cover rounded-lg border border-gray-700 grayscale"
                    />
                  ) : (
                    <div className="w-28 h-36 bg-black border border-gray-700 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                      No image
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={card.image_url}
                      onChange={(e) => updateCard(index, 'image_url', e.target.value)}
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-[#FFB300] outline-none text-sm"
                      placeholder="Image URL or upload below"
                    />
                    <label className="inline-flex items-center gap-2 cursor-pointer bg-black border border-gray-700 hover:border-[#FFB300] text-gray-300 px-4 py-2 rounded-lg text-sm transition">
                      <Upload className="w-4 h-4" />
                      {uploading === String(index) ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading === String(index)}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) uploadImage(file, index)
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={() => saveCard(card, index)}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-[#FFB300] text-black font-semibold px-5 py-2.5 rounded-full hover:scale-105 transition-transform disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Card
              </button>
            </div>
          ))}
        </div>

        {cards.length === 0 && (
          <div className="text-center py-16 text-gray-500 border border-dashed border-gray-700 rounded-2xl">
            No cards yet. Click &quot;Add Card&quot; to create one.
          </div>
        )}
      </main>
      <Sidebar />
    </div>
  )
}