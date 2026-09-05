'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Save, Upload } from 'lucide-react'
import Sidebar from '@/components/admin/Sidebar'

type InternPageSettings = {
  badge: string
  title: string
  description: string
  background_image: string
  stat_1_value: string
  stat_1_label: string
  stat_2_value: string
  stat_2_label: string
  stat_3_value: string
  stat_3_label: string
  why_title: string
  why_points: string[]
  resume_title: string
  resume_description: string
  contact_email_override: string
}

const DEFAULTS: InternPageSettings = {
  badge: 'Join The Team',
  title: 'Intern With Us',
  description:
    'Kickstart your career while creating meaningful change. We are always looking for passionate students and young professionals to join our grassroots initiatives.',
  background_image:
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop',
  stat_1_value: '50+',
  stat_1_label: 'Past Interns',
  stat_2_value: '100%',
  stat_2_label: 'Mentorship',
  stat_3_value: 'Cert',
  stat_3_label: 'Awarded',
  why_title: 'Why Intern With Us?',
  why_points: [
    'Gain real-world grassroots experience',
    'Certificate of Internship upon completion',
    'Mentorship from experienced social workers',
    'Make a tangible difference in society',
  ],
  resume_title: 'Have a Resume Ready?',
  resume_description: 'Email us your resume with a short cover letter.',
  contact_email_override: '',
}

export default function InternPageSettingsAdmin() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [settings, setSettings] = useState<InternPageSettings>(DEFAULTS)
  const [pointsText, setPointsText] = useState(DEFAULTS.why_points.join('\n'))

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'intern_page')
        .single()
      if (error && error.code !== 'PGRST116') throw error
      if (data?.value) {
        const merged = { ...DEFAULTS, ...data.value }
        setSettings(merged)
        setPointsText((merged.why_points || []).join('\n'))
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  async function save() {
    setSaving(true)
    try {
      const payload = {
        ...settings,
        why_points: pointsText
          .split('\n')
          .map((p) => p.trim())
          .filter(Boolean),
      }
      const { error } = await supabase.from('site_settings').upsert({
        key: 'intern_page',
        value: payload,
      })
      if (error) throw error
      toast.success('Intern page saved!')
    } catch (err: any) {
      toast.error(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function uploadImage(file: File) {
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `intern-page/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('media').upload(fileName, file)
      if (uploadError) throw uploadError
      const {
        data: { publicUrl },
      } = supabase.storage.from('media').getPublicUrl(fileName)
      setSettings((s) => ({ ...s, background_image: publicUrl }))
      toast.success('Image uploaded')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black w-full">
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </main>
        <Sidebar />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-black w-full text-white">
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Intern Page Content</h1>
            <p className="text-gray-400">
              Edit hero text, stats, benefits, and resume email section.
            </p>
          </div>

          <div className="bg-[#1A1A1A] border border-gold-500/20 rounded-2xl p-6 space-y-5 mb-12">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Badge</label>
                <input
                  value={settings.badge}
                  onChange={(e) => setSettings({ ...settings, badge: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#FFB300]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#FFB300]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                rows={3}
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#FFB300] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Hero Background Image</label>
              {settings.background_image && (
                <img
                  src={settings.background_image}
                  alt="Hero"
                  className="w-full h-40 object-cover rounded-lg mb-3 border border-gray-700"
                />
              )}
              <input
                value={settings.background_image}
                onChange={(e) => setSettings({ ...settings, background_image: e.target.value })}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#FFB300] mb-2"
              />
              <label className="inline-flex items-center gap-2 cursor-pointer bg-black border border-gray-700 hover:border-[#FFB300] text-gray-300 px-4 py-2 rounded-lg text-sm">
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) uploadImage(f)
                  }}
                />
              </label>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Stat 1 Value</label>
                <input
                  value={settings.stat_1_value}
                  onChange={(e) => setSettings({ ...settings, stat_1_value: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#FFB300]"
                />
                <input
                  value={settings.stat_1_label}
                  onChange={(e) => setSettings({ ...settings, stat_1_label: e.target.value })}
                  className="w-full mt-2 bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#FFB300]"
                  placeholder="Label"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Stat 2 Value</label>
                <input
                  value={settings.stat_2_value}
                  onChange={(e) => setSettings({ ...settings, stat_2_value: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#FFB300]"
                />
                <input
                  value={settings.stat_2_label}
                  onChange={(e) => setSettings({ ...settings, stat_2_label: e.target.value })}
                  className="w-full mt-2 bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#FFB300]"
                  placeholder="Label"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Stat 3 Value</label>
                <input
                  value={settings.stat_3_value}
                  onChange={(e) => setSettings({ ...settings, stat_3_value: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#FFB300]"
                />
                <input
                  value={settings.stat_3_label}
                  onChange={(e) => setSettings({ ...settings, stat_3_label: e.target.value })}
                  className="w-full mt-2 bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#FFB300]"
                  placeholder="Label"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Why section title</label>
              <input
                value={settings.why_title}
                onChange={(e) => setSettings({ ...settings, why_title: e.target.value })}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#FFB300]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Why points (one per line)
              </label>
              <textarea
                rows={5}
                value={pointsText}
                onChange={(e) => setPointsText(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#FFB300] resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Resume box title</label>
                <input
                  value={settings.resume_title}
                  onChange={(e) => setSettings({ ...settings, resume_title: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#FFB300]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Resume email override (optional)
                </label>
                <input
                  value={settings.contact_email_override}
                  onChange={(e) =>
                    setSettings({ ...settings, contact_email_override: e.target.value })
                  }
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#FFB300]"
                  placeholder="Leave blank to use Settings email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Resume box description</label>
              <input
                value={settings.resume_description}
                onChange={(e) => setSettings({ ...settings, resume_description: e.target.value })}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#FFB300]"
              />
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#FFB300] text-black font-semibold px-5 py-2.5 rounded-full hover:scale-105 transition-transform disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Intern Page'}
            </button>
          </div>
        </div>
      </main>
      <Sidebar />
    </div>
  )
}