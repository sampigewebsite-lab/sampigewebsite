'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, Settings as SettingsIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
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
  })

  useEffect(() => {
    checkAuth()
    fetchSettings()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
    }
  }

  const fetchSettings = async () => {
    setInitialLoading(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')

      if (error) {
        console.error('Error fetching settings:', error)
        setError(error.message)
        return
      }

      if (data && data.length > 0) {
        const settingsMap: Record<string, any> = {}
        data.forEach(item => {
          settingsMap[item.key] = item.value
        })

        setSettings({
          organization: settingsMap.organization || settings.organization,
          social: settingsMap.social || settings.social,
          general: settingsMap.general || settings.general,
          donation: settingsMap.donation || settings.donation,
        })
      }
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'Failed to fetch settings')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleOrganizationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      organization: {
        ...prev.organization,
        [name]: value,
      },
    }))
  }

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [name]: value,
      },
    }))
  }

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [name]: value,
      },
    }))
  }

  const handleDonationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      donation: {
        ...prev.donation,
        [name]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const settingsData = [
        { key: 'organization', value: settings.organization },
        { key: 'social', value: settings.social },
        { key: 'general', value: settings.general },
        { key: 'donation', value: settings.donation },
      ]

      for (const item of settingsData) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({ key: item.key, value: item.value }, { onConflict: 'key' })

        if (error) {
          console.error('Error saving:', item.key, error)
          throw new Error(`Failed to save ${item.key}: ${error.message}`)
        }
      }

      toast.success('Settings saved successfully!')
      await fetchSettings() // Refresh to show updated values
    } catch (err: any) {
      console.error('Submit error:', err)
      setError(err.message || 'Failed to save settings')
      toast.error(err.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-black flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto flex items-center justify-center">
          <div className="text-gold-500 text-xl">Loading settings...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <SettingsIcon className="h-8 w-8 text-gold-500" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">Manage your website settings</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
              Error: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Settings */}
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Organization</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Organization Name</label>
                  <input
                    type="text"
                    name="name"
                    value={settings.organization.name}
                    onChange={handleOrganizationChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tagline</label>
                  <input
                    type="text"
                    name="tagline"
                    value={settings.organization.tagline}
                    onChange={handleOrganizationChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={settings.organization.description}
                    onChange={handleOrganizationChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={settings.organization.email}
                      onChange={handleOrganizationChange}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={settings.organization.phone}
                      onChange={handleOrganizationChange}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={settings.organization.address}
                    onChange={handleOrganizationChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Settings */}
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Social Media</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Instagram</label>
                  <input
                    type="url"
                    name="instagram"
                    value={settings.social.instagram}
                    onChange={handleSocialChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Facebook</label>
                  <input
                    type="url"
                    name="facebook"
                    value={settings.social.facebook}
                    onChange={handleSocialChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={settings.social.linkedin}
                    onChange={handleSocialChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="https://linkedin.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">YouTube</label>
                  <input
                    type="url"
                    name="youtube"
                    value={settings.social.youtube}
                    onChange={handleSocialChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Twitter/X</label>
                  <input
                    type="url"
                    name="twitter"
                    value={settings.social.twitter}
                    onChange={handleSocialChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Donation Settings */}
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Donation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">UPI ID</label>
                  <input
                    type="text"
                    name="upi_id"
                    value={settings.donation.upi_id}
                    onChange={handleDonationChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="sampige@upi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bank Details</label>
                  <input
                    type="text"
                    name="bank_details"
                    value={settings.donation.bank_details}
                    onChange={handleDonationChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Donation URL</label>
                  <input
                    type="url"
                    name="donation_url"
                    value={settings.donation.donation_url}
                    onChange={handleDonationChange}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="https://rzp.io/l/..."
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}