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
  Globe
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
  const [userAddresses, setUserAddresses] = useState<any[]>([])

  // Booking Form State
  const [selectedLocation, setSelectedLocation] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [areaName, setAreaName] = useState('Malleshwaram')
  const [pincode, setPincode] = useState('560003')
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

  async function checkUserSession() {
    setLoading(true)
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/green-rewards/login')
      return
    }

    setUser(authUser)

    // Fetch Profile
    const { data: prof } = await supabase.from('gr_profiles').select('*').eq('id', authUser.id).single()
    setProfile(prof || {})
    if (prof?.language_preference) setLang(prof.language_preference)

    // Fetch Saved Addresses
    const { data: addrs } = await supabase.from('gr_addresses').select('*').eq('user_id', authUser.id)
    setUserAddresses(addrs || [])

    // Fetch Settings, Categories & Active Locations
    const settingsRes = await fetch('/api/green-rewards/admin/settings')
    if (settingsRes.ok) {
      const sData = await settingsRes.json()
      setLocations(sData.locations || [])
      setCategories(sData.categories || [])
      if (sData.locations && sData.locations.length > 0) {
        setSelectedLocation(sData.locations[0].id)
        setAreaName(sData.locations[0].name_en)
        setPincode(sData.locations[0].pincode)
      }
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
    if (!streetAddress || !pickupDate) {
      toast.error(lang === 'en' ? 'Please fill street address and pickup date' : 'ವಿಳಾಸ ಮತ್ತು ದಿನಾಂಕವನ್ನು ನಮೂದಿಸಿ')
      return
    }

    setIsBooking(true)

    try {
      let addressId = userAddresses.find((a) => a.street_address === streetAddress)?.id

      if (!addressId) {
        const { data: newAddr, error: addrErr } = await supabase
          .from('gr_addresses')
          .insert([
            {
              user_id: user.id,
              address_title: 'Home',
              street_address: streetAddress,
              area_name: areaName,
              pincode: pincode,
              city: 'Bengaluru'
            }
          ])
          .select()
          .single()

        if (addrErr) throw addrErr
        addressId = newAddr.id
      }

      const res = await fetch('/api/green-rewards/pickup-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address_id: addressId,
          location_id: selectedLocation || null,
          preferred_date: pickupDate,
          time_slot: timeSlot,
          user_notes: userNotes
        })
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(
          lang === 'en' 
            ? `Pickup scheduled! Tracking ID: ${data.request.request_number}` 
            : `ಪಿಕಪ್ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ! ID: ${data.request.request_number}`
        )
        setStreetAddress('')
        setUserNotes('')
        setActiveTab('history')
        fetchPickupRequests()
      } else {
        const err = await res.json()
        toast.error('Booking failed: ' + err.error)
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

  return (
    <div className="min-h-screen bg-black text-white pt-20 md:pt-24 pb-16">
      {/* Top Header - Positioned safely below main site header */}
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
                {balance.current_balance || 0} <span className="text-xl font-normal text-zinc-400">pts</span>
              </div>
              <div className="text-xs text-zinc-400 mt-2">
                ≈ ₹{((balance.current_balance || 0) * 0.10).toFixed(2)} INR {lang === 'en' ? 'Value' : 'ಮೌಲ್ಯ'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
              <div className="text-center px-4 py-1 border-r border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block">{lang === 'en' ? 'Total Earned' : 'ಒಟ್ಟು ಗಳಿಸಿದ್ದು'}</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">+{balance.total_earned || 0}</span>
              </div>
              <div className="text-center px-4 py-1">
                <span className="text-[10px] text-zinc-500 uppercase block">{lang === 'en' ? 'Total Redeemed' : 'ಒಟ್ಟು ಬಳಸಿದ್ದು'}</span>
                <span className="text-lg font-bold text-amber-500 font-mono">-{balance.total_spent || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex overflow-x-auto gap-2 border-b border-zinc-800 pb-3">
          {[
            { id: 'book', label: lang === 'en' ? 'Book Waste Pickup' : 'ತ್ಯಾಜ್ಯ ಪಿಕಪ್ ಕಾಯ್ದಿರಿಸಿ', icon: Recycle },
            { id: 'rewards', label: lang === 'en' ? 'Redeem Rewards' : 'ಬಹುಮಾನಗಳನ್ನು ಪಡೆದುಕೊಳ್ಳಿ', icon: Gift },
            { id: 'history', label: lang === 'en' ? 'Collection History' : 'ಇತಿಹಾಸ', icon: History },
            { id: 'rates', label: lang === 'en' ? 'Accepted Waste Rates' : 'ತ್ಯಾಜ್ಯ ದರಗಳು', icon: Scale }
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

        {/* TAB 1: BOOK PICKUP */}
        {activeTab === 'book' && (
          <form onSubmit={handleBookPickup} className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-3xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                {lang === 'en' ? 'Schedule Doorstep Waste Pickup' : 'ಮನೆಯ ಬಾಗಿಲಲ್ಲಿ ತ್ಯಾಜ್ಯ ಸಂಗ್ರಹಣೆ'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {lang === 'en' 
                  ? 'We collect dry recyclables, sacred pooja flowers & brass scrap directly from your doorstep.'
                  : 'ನಾವು ನಿಮ್ಮ ಮನೆಯಿಂದ ಒಣ ಮರುಬಳಕೆ ವಸ್ತುಗಳು ಮತ್ತು ಪೂಜಾ ತ್ಯಾಜ್ಯವನ್ನು ಸಂಗ್ರಹಿಸುತ್ತೇವೆ.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup Area */}
              <div>
                <label className="text-xs text-zinc-300 block mb-2 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FFB300]" />
                  {lang === 'en' ? 'Select Service Zone / Pincode' : 'ಸೇವಾ ಪ್ರದೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ'}
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value)
                    const loc = locations.find((l) => l.id === e.target.value)
                    if (loc) {
                      setAreaName(loc.name_en)
                      setPincode(loc.pincode)
                    }
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FFB300] outline-none"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name_en} ({loc.name_kn}) - {loc.pincode}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs text-zinc-300 block mb-2 font-medium">
                  {lang === 'en' ? 'Street Address / House Number' : 'ಮನೆಯ ವಿಳಾಸ'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. #45, 8th Main, 3rd Cross, Malleshwaram"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FFB300] outline-none"
                />
              </div>

              {/* Pickup Date */}
              <div>
                <label className="text-xs text-zinc-300 block mb-2 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FFB300]" />
                  {lang === 'en' ? 'Preferred Pickup Date' : 'ಆದ್ಯತೆಯ ದಿನಾಂಕ'}
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

              {/* Time Slot */}
              <div>
                <label className="text-xs text-zinc-300 block mb-2 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FFB300]" />
                  {lang === 'en' ? 'Time Slot' : 'ಸಮಯದ ಅವಧಿ'}
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FFB300] outline-none"
                >
                  <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM (Morning)</option>
                  <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM (Afternoon)</option>
                  <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM (Evening)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-300 block mb-2 font-medium">
                {lang === 'en' ? 'Additional Notes / Waste Details' : 'ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿಗಳು'}
              </label>
              <textarea
                rows={2}
                placeholder="e.g. 2 bags of sacred flowers and 1 box of cardboard"
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
              {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {lang === 'en' ? 'Confirm Doorstep Pickup Booking' : 'ಬುಕಿಂಗ್ ಖಚಿತಪಡಿಸಿ'}
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
                <div key={rw.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 bg-[#FFB300]/10 border border-[#FFB300]/30 text-[#FFB300] font-mono text-xs font-bold rounded-lg">
                        {rw.points_required} pts
                      </span>
                      {rw.monetary_value_inr > 0 && (
                        <span className="text-xs text-emerald-400 font-semibold">₹{rw.monetary_value_inr} Value</span>
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
                      ? (lang === 'en' ? 'Redeem Now' : 'ಈಗ ಪಡೆದುಕೊಳ್ಳಿ')
                      : (lang === 'en' ? 'Insufficient Points' : 'ಸಾಕಷ್ಟು ಪಾಯಿಂಟ್‌ಗಳಿಲ್ಲ')}
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
              {lang === 'en' ? 'Your Collection & Payout History' : 'ನಿಮ್ಮ ಇತಿಹಾಸ'}
            </h2>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-zinc-800 text-sm font-bold text-[#FFB300]">
                {lang === 'en' ? 'Recent Collection Requests' : 'ಇತ್ತೀಚಿನ ಪಿಕಪ್‌ಗಳು'}
              </div>
              <div className="divide-y divide-zinc-800">
                {userRequests.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500">No collection requests found.</div>
                ) : (
                  userRequests.map((req) => (
                    <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-mono text-xs font-bold text-white">{req.request_number}</div>
                        <div className="text-xs text-zinc-400 mt-1">
                          Date: {req.preferred_date} ({req.time_slot})
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          req.status === 'verified'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
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
                <div key={cat.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-3">
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
                {isRedeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Redemption'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}