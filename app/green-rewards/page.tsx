'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Recycle,
  Gift,
  History,
  Scale,
  MapPin,
  Calendar,
  Clock,
  Award,
  Loader2,
  LogOut,
  CheckCircle2,
  Globe,
  Building2,
  Home,
  Truck
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function GreenRewardsDashboard() {
  const supabase = createClient()
  const router = useRouter()

  const [lang, setLang] = useState<'en' | 'kn'>('en')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [balance, setBalance] = useState<any>({ current_balance: 0, total_earned: 0, total_spent: 0 })
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<'book' | 'rewards' | 'history' | 'rates'>('book')

  // Data
  const [locations, setLocations] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [rewards, setRewards] = useState<any[]>([])
  const [userRequests, setUserRequests] = useState<any[]>([])
  const [userRedemptions, setUserRedemptions] = useState<any[]>([])

  // Normalized system settings (from gr_settings global row OR legacy key/value rows)
  const [isHomePickupEnabled, setIsHomePickupEnabled] = useState(false)
  const [pointsToRupeeRate, setPointsToRupeeRate] = useState(0.1)
  const [parsedTimeSlots, setParsedTimeSlots] = useState<string[]>([
    '09:00 AM - 12:00 PM',
    '02:00 PM - 05:00 PM'
  ])

  // Drop-off / Pickup Form State
  // 'dropoff' = self drop at hub | 'doorstep' = home pickup
  const [pickupMode, setPickupMode] = useState<'dropoff' | 'doorstep'>('dropoff')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedHubObj, setSelectedHubObj] = useState<any>(null)
  const [homeAddress, setHomeAddress] = useState('')
  const [homeLandmark, setHomeLandmark] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 12:00 PM')
  const [userNotes, setUserNotes] = useState('')
  const [isBooking, setIsBooking] = useState(false)

  // Redemption Form Modal State
  const [selectedReward, setSelectedReward] = useState<any>(null)
  const [upiId, setUpiId] = useState('')
  const [treeName, setTreeName] = useState('')
  const [isRedeeming, setIsRedeeming] = useState(false)

  useEffect(() => {
    checkUserSession()
  }, [])

  /** Normalize gr_settings whether stored as:
   *  A) single row { key: 'global', enable_home_pickup, points_to_rupee_rate, allowed_time_slots }
   *  B) legacy rows { key: 'enable_home_pickup', value: 'true' }
   */
  function applySettings(stgData: any[]) {
    const rows = stgData || []
    const globalRow = rows.find((s: any) => s.key === 'global') || rows[0] || null

    // --- enable_home_pickup ---
    let homeEnabled = false
    if (globalRow && typeof globalRow.enable_home_pickup === 'boolean') {
      homeEnabled = globalRow.enable_home_pickup
    } else if (globalRow && globalRow.enable_home_pickup != null) {
      homeEnabled = String(globalRow.enable_home_pickup) === 'true' || globalRow.enable_home_pickup === true
    } else {
      const legacy = rows.find((s: any) => s.key === 'enable_home_pickup')
      homeEnabled = String(legacy?.value) === 'true' || legacy?.value === true
    }
    setIsHomePickupEnabled(homeEnabled)
    // If home pickup disabled, force drop-off mode
    if (!homeEnabled) setPickupMode('dropoff')

    // --- points_to_rupee_rate ---
    let rate = 0.1
    if (globalRow?.points_to_rupee_rate != null) {
      rate = parseFloat(String(globalRow.points_to_rupee_rate)) || 0.1
    } else {
      const legacy = rows.find((s: any) => s.key === 'points_to_rupee_rate')
      rate = parseFloat(String(legacy?.value ?? '0.10')) || 0.1
    }
    setPointsToRupeeRate(rate)

    // --- allowed_time_slots ---
    let slots: string[] = ['09:00 AM - 12:00 PM', '02:00 PM - 05:00 PM']
    const rawSlots = globalRow?.allowed_time_slots
    if (Array.isArray(rawSlots) && rawSlots.length > 0) {
      slots = rawSlots.map(String)
    } else if (typeof rawSlots === 'string' && rawSlots.trim()) {
      slots = rawSlots.split(',').map((s: string) => s.trim()).filter(Boolean)
    } else {
      const legacy = rows.find((s: any) => s.key === 'allowed_time_slots')
      if (legacy?.value) {
        if (Array.isArray(legacy.value)) slots = legacy.value.map(String)
        else slots = String(legacy.value).split(',').map((s: string) => s.trim()).filter(Boolean)
      }
    }
    setParsedTimeSlots(slots)
    if (slots.length > 0) setTimeSlot(slots[0])
  }

  async function checkUserSession() {
    setLoading(true)
    const {
      data: { user: authUser }
    } = await supabase.auth.getUser()

    if (!authUser) {
      router.push('/green-rewards/login')
      return
    }

    setUser(authUser)

    // 1. Fetch Profile
    const { data: prof } = await supabase.from('gr_profiles').select('*').eq('id', authUser.id).single()
    setProfile(prof || {})
    if (prof?.language_preference) setLang(prof.language_preference)
    // Prefill home address from profile if available
    if (prof?.address) setHomeAddress(prof.address)

    // 2. Fetch Locations, Waste Categories, and Settings
    const [locRes, catRes, stgRes] = await Promise.all([
      supabase.from('gr_collection_locations').select('*').eq('is_active', true).order('created_at'),
      supabase.from('gr_waste_categories').select('*').eq('is_active', true).order('display_order'),
      supabase.from('gr_settings').select('*')
    ])

    const activeLocations = locRes.data || []
    const activeCategories = catRes.data || []
    const stgData = stgRes.data || []

    setLocations(activeLocations)
    setCategories(activeCategories)
    applySettings(stgData)

    if (activeLocations.length > 0) {
      setSelectedLocation(activeLocations[0].id)
      setSelectedHubObj(activeLocations[0])
    }

    fetchRedemptionsData()
    fetchPickupRequests()

    setLoading(false)
  }

  async function fetchRedemptionsData() {
    const res = await fetch('/api/green-rewards/redemption')
    if (res.ok) {
      const rData = await res.json()
      setBalance(rData.balance || { current_balance: 0, total_earned: 0, total_spent: 0 })
      setRewards(rData.rewards || [])
      setUserRedemptions(rData.redemptions || [])
    }
  }

  async function fetchPickupRequests() {
    const res = await fetch('/api/green-rewards/pickup-request')
    if (res.ok) {
      const pData = await res.json()
      setUserRequests(pData.requests || [])
    }
  }

  async function handleBookPickup(e: React.FormEvent) {
    e.preventDefault()
    if (!pickupDate) {
      toast.error(lang === 'en' ? 'Please select a date' : 'ದಿನಾಂಕವನ್ನು ನಮೂದಿಸಿ')
      return
    }

    const isDoorstep = pickupMode === 'doorstep' && isHomePickupEnabled

    if (isDoorstep && !homeAddress.trim()) {
      toast.error(lang === 'en' ? 'Please enter your home address' : 'ಮನೆ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ')
      return
    }

    if (!isDoorstep && !selectedLocation) {
      toast.error(lang === 'en' ? 'Please select a collection center' : 'ಸಂಗ್ರಹಣಾ ಕೇಂದ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ')
      return
    }

    setIsBooking(true)

    try {
      // Build address record
      const addressPayload = isDoorstep
        ? {
            user_id: user.id,
            address_title: 'Home Pickup Address',
            street_address: homeAddress.trim(),
            area_name: homeLandmark.trim() || 'Bengaluru',
            pincode: profile?.pincode || '',
            city: 'Bengaluru',
            landmark: homeLandmark.trim() || null
          }
        : {
            user_id: user.id,
            address_title: 'Sampige Collection Hub',
            street_address:
              selectedHubObj?.address_en ||
              selectedHubObj?.address ||
              selectedHubObj?.notes ||
              selectedHubObj?.name_en ||
              'Malleshwaram Drop-Off Center',
            area_name: selectedHubObj?.name_en || selectedHubObj?.name || 'Malleshwaram',
            pincode: selectedHubObj?.pincode || '560003',
            city: 'Bengaluru'
          }

      const { data: newAddr, error: addrErr } = await supabase
        .from('gr_addresses')
        .insert([addressPayload])
        .select()
        .single()

      if (addrErr) throw addrErr

      const res = await fetch('/api/green-rewards/pickup-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address_id: newAddr.id,
          location_id: isDoorstep ? null : selectedLocation || null,
          preferred_date: pickupDate,
          time_slot: timeSlot,
          user_notes: userNotes,
          request_type: isDoorstep ? 'home_pickup' : 'dropoff',
          // Extra fields some backends may store
          pickup_address: isDoorstep ? homeAddress.trim() : null,
          landmark: isDoorstep ? homeLandmark.trim() : null
        })
      })

      if (res.ok) {
        const data = await res.json()
        const reqNo = data.request?.request_number || data.request_number || ''
        toast.success(
          lang === 'en'
            ? isDoorstep
              ? `Home pickup booked! ID: ${reqNo}`
              : `Drop-off appointment booked! ID: ${reqNo}`
            : `ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ! ID: ${reqNo}`
        )
        setUserNotes('')
        setHomeLandmark('')
        setActiveTab('history')
        fetchPickupRequests()
      } else {
        const err = await res.json()
        toast.error('Booking failed: ' + (err.error || 'Unknown error'))
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    } finally {
      setIsBooking(false)
    }
  }

  async function handleRedeemReward() {
    if (!selectedReward) return
    setIsRedeeming(true)

    let payoutDetails: any = {}
    if (selectedReward.reward_type === 'upi') {
      if (!upiId) {
        toast.error('Please enter your UPI ID')
        setIsRedeeming(false)
        return
      }
      payoutDetails = { upi_id: upiId }
    } else if (selectedReward.reward_type === 'donation_tree') {
      payoutDetails = { tree_certificate_name: treeName || profile.full_name }
    }

    const res = await fetch('/api/green-rewards/redemption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reward_id: selectedReward.id,
        payout_details: payoutDetails
      })
    })

    setIsRedeeming(false)
    if (res.ok) {
      toast.success(lang === 'en' ? 'Redemption request submitted!' : 'ವಿನಂತಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!')
      setSelectedReward(null)
      setUpiId('')
      setTreeName('')
      fetchRedemptionsData()
    } else {
      const err = await res.json()
      toast.error(err.error || 'Redemption failed')
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/green-rewards/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-24">
        <Loader2 className="w-8 h-8 text-[#FFB300] animate-spin" />
      </div>
    )
  }

  const showDoorstep = isHomePickupEnabled && pickupMode === 'doorstep'

  return (
    <div className="min-h-screen bg-black text-white pt-20 md:pt-24 pb-16">
      {/* Top Header */}
      <div className="bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 sticky top-[72px] md:top-[80px] z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FFB300]/10 border border-[#FFB300]/30 rounded-xl flex items-center justify-center text-[#FFB300]">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#FFB300] font-semibold uppercase tracking-wider block">
                Sampige Green Rewards
              </span>
              <h1 className="text-base font-bold text-white leading-tight">
                {profile.full_name || 'Eco Member'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'en' ? 'kn' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 hover:text-white"
            >
              <Globe className="w-3.5 h-3.5 text-[#FFB300]" />
              {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
            </button>

            <button
              onClick={handleSignOut}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Points Balance Card */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-64 h-64 bg-[#FFB300]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFB300]/10 border border-[#FFB300]/20 rounded-full text-[#FFB300] text-xs font-semibold mb-3">
                <Award className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Eco Tier' : 'ಪರಿಸರ ಶ್ರೇಣಿ'}: {profile.green_tier || 'Bronze'}
              </div>
              <span className="text-xs text-zinc-400 block uppercase tracking-wider">
                {lang === 'en' ? 'Available Balance' : 'ಲಭ್ಯವಿರುವ ಪಾಯಿಂಟ್‌ಗಳು'}
              </span>
              <div className="text-4xl md:text-5xl font-extrabold text-[#FFB300] font-mono mt-1">
                {balance.current_balance || 0}{' '}
                <span className="text-xl font-normal text-zinc-400">pts</span>
              </div>
              <div className="text-xs text-zinc-400 mt-2">
                ≈ ₹{((balance.current_balance || 0) * pointsToRupeeRate).toFixed(2)} INR{' '}
                {lang === 'en' ? 'Value' : 'ಮೌಲ್ಯ'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
              <div className="text-center px-4 py-1 border-r border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block">
                  {lang === 'en' ? 'Total Earned' : 'ಒಟ್ಟು ಗಳಿಸಿದ್ದು'}
                </span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  +{balance.total_earned || 0}
                </span>
              </div>
              <div className="text-center px-4 py-1">
                <span className="text-[10px] text-zinc-500 uppercase block">
                  {lang === 'en' ? 'Total Redeemed' : 'ಒಟ್ಟು ಬಳಸಿದ್ದು'}
                </span>
                <span className="text-lg font-bold text-amber-500 font-mono">
                  -{balance.total_spent || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex overflow-x-auto gap-2 border-b border-zinc-800 pb-3">
          {[
            {
              id: 'book',
              label: lang === 'en' ? 'Schedule Waste Drop-Off' : 'ತ್ಯಾಜ್ಯ ಡ್ರಾಪ್-ಆಫ್ ಕಾಯ್ದಿರಿಸಿ',
              icon: Recycle
            },
            {
              id: 'rewards',
              label: lang === 'en' ? 'Redeem Rewards' : 'ಬಹುಮಾನಗಳನ್ನು ಪಡೆದುಕೊಳ್ಳಿ',
              icon: Gift
            },
            {
              id: 'history',
              label: lang === 'en' ? 'Collection History' : 'ಇತಿಹಾಸ',
              icon: History
            },
            {
              id: 'rates',
              label: lang === 'en' ? 'Accepted Waste Rates' : 'ತ್ಯಾಜ್ಯ ದರಗಳು',
              icon: Scale
            }
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  active
                    ? 'bg-[#FFB300] text-black font-bold shadow-lg shadow-[#FFB300]/20'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* TAB 1: SCHEDULE DROP-OFF / HOME PICKUP */}
        {activeTab === 'book' && (
          <form
            onSubmit={handleBookPickup}
            className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-3xl space-y-6"
          >
            {/* Mode badge OR mode toggle */}
            {isHomePickupEnabled ? (
              <div className="flex bg-zinc-950 border border-zinc-800 p-1 rounded-xl max-w-lg">
                <button
                  type="button"
                  onClick={() => setPickupMode('doorstep')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    pickupMode === 'doorstep'
                      ? 'bg-[#FFB300] text-black shadow-lg'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'Doorstep Home Pickup' : 'ಮನೆ ಪಿಕಪ್'}
                </button>
                <button
                  type="button"
                  onClick={() => setPickupMode('dropoff')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    pickupMode === 'dropoff'
                      ? 'bg-[#FFB300] text-black shadow-lg'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'Self Drop-Off at Center' : 'ಕೇಂದ್ರಕ್ಕೆ ಡ್ರಾಪ್-ಆಫ್'}
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFB300]/10 border border-[#FFB300]/20 rounded-full text-[#FFB300] text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Self Drop-Off Mode Active' : 'ಆಫೀಸ್ ಡ್ರಾಪ್-ಆಫ್ ಮೋಡ್'}
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-white">
                {showDoorstep
                  ? lang === 'en'
                    ? 'Schedule Doorstep Home Pickup'
                    : 'ಮನೆ ಪಿಕಪ್ ಕಾಯ್ದಿರಿಸಿ'
                  : lang === 'en'
                    ? 'Schedule Waste Drop-Off Appointment'
                    : 'ಸಂಪಿಗೆ ಕಚೇರಿಯಲ್ಲಿ ತ್ಯಾಜ್ಯ ನೀಡಿ'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {showDoorstep
                  ? lang === 'en'
                    ? 'Our team will visit your address to collect segregated dry waste, brass scrap & sacred flowers.'
                    : 'ನಮ್ಮ ತಂಡ ನಿಮ್ಮ ವಿಳಾಸಕ್ಕೆ ಬಂದು ತ್ಯಾಜ್ಯವನ್ನು ಸಂಗ್ರಹಿಸುತ್ತದೆ.'
                  : lang === 'en'
                    ? 'Please bring your segregated dry waste, divine brass scrap & sacred flowers to our Malleshwaram Center.'
                    : 'ನಿಮ್ಮ ತ್ಯಾಜ್ಯವನ್ನು ನಮ್ಮ ಮಲ್ಲೇಶ್ವರಂ ಕೇಂದ್ರಕ್ಕೆ ತಂದು ಕೊಡಿ.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT: Address OR Center selector */}
              {showDoorstep ? (
                <>
                  <div className="md:col-span-2">
                    <label className="text-xs text-zinc-300 block mb-2 font-medium flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-[#FFB300]" />
                      {lang === 'en'
                        ? 'Full Home / Collection Address'
                        : 'ಸಂಪೂರ್ಣ ಮನೆ ವಿಳಾಸ'}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={homeAddress}
                      onChange={(e) => setHomeAddress(e.target.value)}
                      placeholder={
                        lang === 'en'
                          ? 'Door / Flat No., Building Name, Street, Area...'
                          : 'ಮನೆ/ಫ್ಲಾಟ್ ನಂ., ಕಟ್ಟಡ, ರಸ್ತೆ, ಪ್ರದೇಶ...'
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FFB300] outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-zinc-300 block mb-2 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#FFB300]" />
                      {lang === 'en' ? 'Landmark (optional)' : 'ಹೆಗ್ಗುರುತು (ಐಚ್ಛಿಕ)'}
                    </label>
                    <input
                      type="text"
                      value={homeLandmark}
                      onChange={(e) => setHomeLandmark(e.target.value)}
                      placeholder={
                        lang === 'en'
                          ? 'Near temple / bus stop / apartment gate...'
                          : 'ದೇವಾಲಯ / ಬಸ್ ನಿಲ್ದಾಣ ಹತ್ತಿರ...'
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FFB300] outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Select Drop-off Center */}
                  <div>
                    <label className="text-xs text-zinc-300 block mb-2 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#FFB300]" />
                      {lang === 'en'
                        ? 'Select Sampige Collection Center'
                        : 'ಸಂಗ್ರಹಣಾ ಕೇಂದ್ರ ಆಯ್ಕೆಮಾಡಿ'}
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => {
                        setSelectedLocation(e.target.value)
                        const loc = locations.find((l) => l.id === e.target.value)
                        if (loc) setSelectedHubObj(loc)
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FFB300] outline-none"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name_en || loc.name}
                          {loc.name_kn ? ` (${loc.name_kn})` : ''} - Drop-Off Point
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Drop-Off Hub Address Details */}
                  <div>
                    <label className="text-xs text-zinc-300 block mb-2 font-medium">
                      {lang === 'en' ? 'Center Address & Operating Hours' : 'ಕೇಂದ್ರದ ವಿಳಾಸ'}
                    </label>
                    <div className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-xl px-4 py-3 text-xs text-[#FFB300] font-mono leading-relaxed min-h-[48px]">
                      {selectedHubObj?.address_en ||
                        selectedHubObj?.address ||
                        selectedHubObj?.notes ||
                        selectedHubObj?.operating_hours ||
                        'Sampige Foundation Office, Malleshwaram, Bengaluru'}
                      {selectedHubObj?.operating_hours
                        ? ` · ${selectedHubObj.operating_hours}`
                        : ''}
                    </div>
                  </div>
                </>
              )}

              {/* Preferred Date */}
              <div>
                <label className="text-xs text-zinc-300 block mb-2 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FFB300]" />
                  {showDoorstep
                    ? lang === 'en'
                      ? 'Preferred Pickup Date'
                      : 'ಪಿಕಪ್ ದಿನಾಂಕ'
                    : lang === 'en'
                      ? 'Preferred Drop-Off Date'
                      : 'ಆದ್ಯತೆಯ ದಿನಾಂಕ'}
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FFB300] outline-none"
                />
              </div>

              {/* Dynamic Time Window from Settings */}
              <div>
                <label className="text-xs text-zinc-300 block mb-2 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FFB300]" />
                  {showDoorstep
                    ? lang === 'en'
                      ? 'Pickup Time Window'
                      : 'ಪಿಕಪ್ ಸಮಯ'
                    : lang === 'en'
                      ? 'Arrival Window'
                      : 'ಸಮಯದ ಅವಧಿ'}
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FFB300] outline-none"
                >
                  {parsedTimeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-300 block mb-2 font-medium">
                {lang === 'en' ? 'Estimated Waste Details' : 'ತ್ಯಾಜ್ಯದ ವಿವರಗಳು'}
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Bringing 2 kg flowers and 1 box dry paper"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#FFB300] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isBooking}
              className="w-full py-3.5 bg-[#FFB300] hover:bg-amber-400 text-black font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FFB300]/20 transition-all"
            >
              {isBooking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {showDoorstep
                    ? lang === 'en'
                      ? 'Confirm Home Pickup'
                      : 'ಮನೆ ಪಿಕಪ್ ಖಚಿತಪಡಿಸಿ'
                    : lang === 'en'
                      ? 'Confirm Drop-Off Appointment'
                      : 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಖಚಿತಪಡಿಸಿ'}
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: REWARDS CATALOG */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                {lang === 'en' ? 'Rewards Catalog' : 'ಬಹುಮಾನಗಳ ಪಟ್ಟಿ'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {lang === 'en'
                  ? 'Redeem your points for instant UPI transfers, tree sapling certificates, or compost packs.'
                  : 'ನಿಮ್ಮ ಪಾಯಿಂಟ್‌ಗಳನ್ನು ಯುಪಿಐ ನಗದು ಅಥವಾ ಗಿಡ ನೆಡುವಿಕೆಗೆ ಬದಲಾಯಿಸಿ.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((rw) => (
                <div
                  key={rw.id}
                  className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 bg-[#FFB300]/10 border border-[#FFB300]/30 text-[#FFB300] font-mono text-xs font-bold rounded-lg">
                        {rw.points_required} pts
                      </span>
                      {rw.monetary_value_inr > 0 && (
                        <span className="text-xs text-emerald-400 font-semibold">
                          ₹{rw.monetary_value_inr} Value
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-base">
                      {lang === 'en' ? rw.title_en : rw.title_kn}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-2">
                      {lang === 'en' ? rw.description_en : rw.description_kn}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedReward(rw)}
                    disabled={(balance.current_balance || 0) < rw.points_required}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${
                      (balance.current_balance || 0) >= rw.points_required
                        ? 'bg-[#FFB300] text-black hover:bg-amber-400'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {(balance.current_balance || 0) >= rw.points_required
                      ? lang === 'en'
                        ? 'Redeem Now'
                        : 'ಈಗ ಪಡೆದುಕೊಳ್ಳಿ'
                      : lang === 'en'
                        ? 'Insufficient Points'
                        : 'ಸಾಕಷ್ಟು ಪಾಯಿಂಟ್‌ಗಳಿಲ್ಲ'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">
              {lang === 'en' ? 'Your Drop-Off & Payout History' : 'ನಿಮ್ಮ ಇತಿಹಾಸ'}
            </h2>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-zinc-800 text-sm font-bold text-[#FFB300]">
                {lang === 'en' ? 'Recent Appointments' : 'ಇತ್ತೀಚಿನ ಪಿಕಪ್‌ಗಳು'}
              </div>
              <div className="divide-y divide-zinc-800">
                {userRequests.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    No drop-off records found.
                  </div>
                ) : (
                  userRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-mono text-xs font-bold text-white">
                          {req.request_number}
                        </div>
                        <div className="text-xs text-zinc-400 mt-1">
                          Date: {req.preferred_date} ({req.time_slot})
                          {req.request_type === 'home_pickup' && (
                            <span className="ml-2 text-[#FFB300]">· Home Pickup</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            req.status === 'verified' || req.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {req.status}
                        </span>
                        {req.total_points_awarded > 0 && (
                          <span className="text-xs font-bold text-[#FFB300] font-mono">
                            +{req.total_points_awarded} pts
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ACCEPTED RATES */}
        {activeTab === 'rates' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#FFB300]">
              {lang === 'en' ? 'Points Earned Per Kilogram' : 'ಪ್ರತಿ ಕೆಜಿಗೆ ಪಾಯಿಂಟ್‌ಗಳು'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-3"
                >
                  <h3 className="font-bold text-white text-base">
                    {lang === 'en' ? cat.name_en : cat.name_kn}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {lang === 'en' ? cat.description_en : cat.description_kn}
                  </p>
                  <div className="pt-2 text-xl font-extrabold text-[#FFB300] font-mono">
                    {cat.points_per_kg} pts / kg
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* REDEMPTION CONFIRMATION MODAL */}
      {selectedReward && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-6">
            <h3 className="font-bold text-white text-lg">
              {lang === 'en' ? 'Confirm Reward Redemption' : 'ರಿಡೀಮ್ ಮಾಡಲು ದೃಢೀಕರಿಸಿ'}
            </h3>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
              <div className="text-sm font-bold text-[#FFB300]">
                {lang === 'en' ? selectedReward.title_en : selectedReward.title_kn}
              </div>
              <div className="text-xs text-zinc-400 font-mono">
                Points Required: {selectedReward.points_required} pts
              </div>
            </div>

            {selectedReward.reward_type === 'upi' && (
              <div>
                <label className="text-xs text-zinc-300 block mb-1">
                  Enter your UPI ID (Google Pay / PhonePe / Paytm)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9886000000@paytm or name@okaxis"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FFB300] outline-none"
                />
              </div>
            )}

            {selectedReward.reward_type === 'donation_tree' && (
              <div>
                <label className="text-xs text-zinc-300 block mb-1">
                  Name to print on Digital Tree Certificate
                </label>
                <input
                  type="text"
                  placeholder={profile.full_name}
                  value={treeName}
                  onChange={(e) => setTreeName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FFB300] outline-none"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedReward(null)}
                className="w-1/2 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRedeemReward}
                disabled={isRedeeming}
                className="w-1/2 py-2.5 bg-[#FFB300] hover:bg-amber-400 text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                {isRedeeming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Confirm Redemption'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}