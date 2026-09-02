'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, Settings as SettingsIcon, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const [settings, setSettings] = useState({
    organization: {
      name: 'Sampige',
      tagline: 'Creating Change. Building Hope.',
      description: '',
      email: '',
      phone: '',
      address: '',
    },
    social: {
      instagram: '',
      facebook: '',
      linkedin: '',
      youtube: '',
      twitter: '',
      whatsapp: '',
    },
    general: {
      favicon: '',
      logo: '',
      default_og_image: '',
      google_analytics_id: '',
    },
    donation: {
      upi_id: '',
      bank_details: '',
      qr_code: '',
      payment_gateway: 'razorpay',
      donation_url: '',
    },
    homepage_hero: {
      badge: 'Architecture of Hope since 2019',
      title_line1: 'Creating Change.',
      title_line2: 'Building Hope.',
      description:
        'Sampige is committed to transforming lives through education, healthcare, and sustainable development initiatives in our community.',
      sub_description: 'We turn compassion into organized, documented, community-led action.',
      background_image: '',
      cta_primary_label: 'Explore Our Work',
      cta_primary_link: '/projects',
      cta_secondary_label: 'Donate Now',
      cta_secondary_link: '/get-involved/donate',
    },
  })

  useEffect(() => {
    checkAuth()
    fetchSettings()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/admin/login')
  }

  const fetchSettings = async () => {
    setInitialLoading(true)
    setError('')
    try {
      const { data, error } = await supabase.from('site_settings').select('*')
      if (error) {
        setError(error.message)
        return
      }

      if (data && data.length > 0) {
        const map: Record<string, any> = {}
        data.forEach((item) => {
          map[item.key] = item.value
        })

        setSettings((prev) => ({
          organization: { ...prev.organization, ...(map.organization || {}) },
          social: { ...prev.social, ...(map.social || {}) },
          general: { ...prev.general, ...(map.general || {}) },
          donation: { ...prev.donation, ...(map.donation || {}) },
          homepage_hero: { ...prev.homepage_hero, ...(map.homepage_hero || {}) },
        }))
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch settings')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleOrg = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      organization: { ...prev.organization, [name]: value },
    }))
  }

  const handleSocial = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      social: { ...prev.social, [name]: value },
    }))
  }

  const handleDonation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      donation: { ...prev.donation, [name]: value },
    }))
  }

  const handleHero = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      homepage_hero: { ...prev.homepage_hero, [name]: value },
    }))
  }

  const uploadToMedia = async (
    file: File,
    folder: string,
    onDone: (url: string) => void,
    key: string
  ) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    setUploading(key)
    try {
      const ext = file.name.split('.').pop()
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('media').upload(path, file)
      if (uploadError) {
        if (uploadError.message.includes('bucket not found')) {
          toast.error('Create a public Storage bucket named "media" in Supabase')
        } else {
          toast.error(uploadError.message)
        }
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
      onDone(publicUrl)
      toast.success('Uploaded successfully')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const rows = [
        { key: 'organization', value: settings.organization },
        { key: 'social', value: settings.social },
        { key: 'general', value: settings.general },
        { key: 'donation', value: settings.donation },
        { key: 'homepage_hero', value: settings.homepage_hero },
      ]

      for (const item of rows) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({ key: item.key, value: item.value }, { onConflict: 'key' })
        if (error) throw new Error(`Failed to save ${item.key}: ${error.message}`)
      }

      toast.success('Settings saved successfully!')
      await fetchSettings()
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
      toast.error(err.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-black flex">
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-gold-500 text-xl">Loading settings...</div>
        </main>
        <Sidebar />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <SettingsIcon className="h-8 w-8 text-gold-500" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
              <p className="text-gray-400 mt-1 text-sm">Logo, hero, social, donation & organization</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
              Error: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Branding: Logo + Favicon */}
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 space-y-6">
              <h2 className="text-lg md:text-xl font-semibold text-white">Branding</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Website Logo</label>
                  <div className="flex items-center gap-4">
                    {settings.general.logo ? (
                      <div className="relative">
                        <img
                          src={settings.general.logo}
                          alt="Logo"
                          className="h-16 w-auto max-w-[160px] object-contain rounded-lg border border-gold-500/20 bg-black p-2"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setSettings((p) => ({
                              ...p,
                              general: { ...p.general, logo: '' },
                            }))
                          }
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-16 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-black/50">
                        <ImageIcon className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    <label className="px-4 py-2 bg-gold-500 text-black font-semibold rounded-lg cursor-pointer text-sm hover:bg-gold-600 inline-flex items-center gap-2">
                      {uploading === 'logo' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" /> Upload Logo
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!!uploading}
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (!f) return
                          uploadToMedia(f, 'logo', (url) => {
                            setSettings((p) => ({
                              ...p,
                              general: { ...p.general, logo: url },
                            }))
                          }, 'logo')
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">PNG/SVG preferred • Shows in header</p>
                </div>

                {/* Favicon */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Favicon</label>
                  <div className="flex items-center gap-4">
                    {settings.general.favicon ? (
                      <div className="relative">
                        <img
                          src={settings.general.favicon}
                          alt="Favicon"
                          className="h-12 w-12 object-contain rounded border border-gold-500/20 bg-black p-1"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setSettings((p) => ({
                              ...p,
                              general: { ...p.general, favicon: '' },
                            }))
                          }
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-12 w-12 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-black/50">
                        <ImageIcon className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <label className="px-4 py-2 bg-gold-500 text-black font-semibold rounded-lg cursor-pointer text-sm hover:bg-gold-600 inline-flex items-center gap-2">
                      {uploading === 'favicon' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" /> Upload Favicon
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/png,image/x-icon,image/svg+xml,image/webp"
                        className="hidden"
                        disabled={!!uploading}
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (!f) return
                          uploadToMedia(f, 'favicon', (url) => {
                            setSettings((p) => ({
                              ...p,
                              general: { ...p.general, favicon: url },
                            }))
                          }, 'favicon')
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">32×32 or 64×64 PNG/ICO</p>
                </div>
              </div>
            </div>

            {/* Homepage Hero */}
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 space-y-4">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-white">Homepage Hero</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Controls the big first section on the homepage (like your reference design)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Background Image</label>
                <div className="flex flex-wrap items-center gap-4">
                  {settings.homepage_hero.background_image ? (
                    <div className="relative">
                      <img
                        src={settings.homepage_hero.background_image}
                        alt="Hero"
                        className="w-40 h-24 object-cover rounded-lg border border-gold-500/20"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSettings((p) => ({
                            ...p,
                            homepage_hero: { ...p.homepage_hero, background_image: '' },
                          }))
                        }
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-40 h-24 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-black/50">
                      <ImageIcon className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                  <label className="px-4 py-2 bg-gold-500 text-black font-semibold rounded-lg cursor-pointer text-sm hover:bg-gold-600 inline-flex items-center gap-2">
                    {uploading === 'hero' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" /> Upload Hero Image
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!!uploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        uploadToMedia(f, 'hero', (url) => {
                          setSettings((p) => ({
                            ...p,
                            homepage_hero: { ...p.homepage_hero, background_image: url },
                          }))
                        }, 'hero')
                      }}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Landscape photo works best (1920×1080+). Any orientation is supported.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Badge Text</label>
                <input
                  type="text"
                  name="badge"
                  value={settings.homepage_hero.badge}
                  onChange={handleHero}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  placeholder="Architecture of Hope since 2019"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title Line 1</label>
                  <input
                    type="text"
                    name="title_line1"
                    value={settings.homepage_hero.title_line1}
                    onChange={handleHero}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title Line 2</label>
                  <input
                    type="text"
                    name="title_line2"
                    value={settings.homepage_hero.title_line2}
                    onChange={handleHero}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Main Description</label>
                <textarea
                  name="description"
                  value={settings.homepage_hero.description}
                  onChange={handleHero}
                  rows={3}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sub Description</label>
                <textarea
                  name="sub_description"
                  value={settings.homepage_hero.sub_description}
                  onChange={handleHero}
                  rows={2}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Primary Button Label</label>
                  <input
                    type="text"
                    name="cta_primary_label"
                    value={settings.homepage_hero.cta_primary_label}
                    onChange={handleHero}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Primary Button Link</label>
                  <input
                    type="text"
                    name="cta_primary_link"
                    value={settings.homepage_hero.cta_primary_link}
                    onChange={handleHero}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                    placeholder="/projects"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Button Label</label>
                  <input
                    type="text"
                    name="cta_secondary_label"
                    value={settings.homepage_hero.cta_secondary_label}
                    onChange={handleHero}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Button Link</label>
                  <input
                    type="text"
                    name="cta_secondary_link"
                    value={settings.homepage_hero.cta_secondary_link}
                    onChange={handleHero}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                    placeholder="/get-involved/donate"
                  />
                </div>
              </div>
            </div>

            {/* Organization */}
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Organization</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Organization Name</label>
                  <input
                    type="text"
                    name="name"
                    value={settings.organization.name}
                    onChange={handleOrg}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tagline</label>
                  <input
                    type="text"
                    name="tagline"
                    value={settings.organization.tagline}
                    onChange={handleOrg}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={settings.organization.description}
                    onChange={handleOrg}
                    rows={3}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={settings.organization.email}
                      onChange={handleOrg}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={settings.organization.phone}
                      onChange={handleOrg}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={settings.organization.address}
                    onChange={handleOrg}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>
            </div>

            {/* Social + WhatsApp */}
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Social Media</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['instagram', 'facebook', 'linkedin', 'youtube', 'twitter'] as const).map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">{key === 'twitter' ? 'Twitter/X' : key}</label>
                    <input
                      type="url"
                      name={key}
                      value={(settings.social as any)[key]}
                      onChange={handleSocial}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                      placeholder={`https://${key}.com/...`}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp Number</label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={settings.social.whatsapp}
                    onChange={handleSocial}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                    placeholder="919876543210 (country code, no + or spaces)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for the floating WhatsApp button</p>
                </div>
              </div>
            </div>

            {/* Donation */}
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Donation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">UPI ID</label>
                  <input
                    type="text"
                    name="upi_id"
                    value={settings.donation.upi_id}
                    onChange={handleDonation}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                    placeholder="sampige@upi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bank Details</label>
                  <input
                    type="text"
                    name="bank_details"
                    value={settings.donation.bank_details}
                    onChange={handleDonation}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Donation URL</label>
                  <input
                    type="url"
                    name="donation_url"
                    value={settings.donation.donation_url}
                    onChange={handleDonation}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                    placeholder="https://rzp.io/l/..."
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!uploading}
              className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </main>
      <Sidebar />
    </div>
  )
}