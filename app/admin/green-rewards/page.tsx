'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Recycle, 
  MapPin, 
  Settings, 
  Plus, 
  Trash2, 
  Loader2,
  Scale,
  Gift,
  XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function GreenRewardsAdminPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'locations' | 'rates' | 'pickups' | 'redemptions' | 'settings'>('pickups')
  const [loading, setLoading] = useState(true)

  // Data states
  const [locations, setLocations] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [settings, setSettings] = useState<any[]>([])
  const [pickups, setPickups] = useState<any[]>([])
  const [redemptions, setRedemptions] = useState<any[]>([])

  // Location Form
  const [newLocNameEn, setNewLocNameEn] = useState('')
  const [newLocNameKn, setNewLocNameKn] = useState('')
  const [newLocPincode, setNewLocPincode] = useState('')

  // Verification Modal State
  const [selectedPickup, setSelectedPickup] = useState<any>(null)
  const [itemWeights, setItemWeights] = useState<{ [key: string]: number }>({})
  const [adminNotes, setAdminNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redemption Action Modal
  const [selectedRedemption, setSelectedRedemption] = useState<any>(null)
  const [voucherCode, setVoucherCode] = useState('')
  const [redemptionNotes, setRedemptionNotes] = useState('')

  useEffect(() => {
    fetchAdminData()
  }, [])

  async function fetchAdminData() {
    setLoading(true)
    try {
      // 1. Fetch settings, locations, categories directly via Supabase client
      const [locRes, catRes, stgRes] = await Promise.all([
        supabase.from('gr_collection_locations').select('*').order('created_at', { ascending: false }),
        supabase.from('gr_waste_categories').select('*').order('display_order'),
        supabase.from('gr_settings').select('*')
      ])

      setLocations(locRes.data || [])
      setCategories(catRes.data || [])
      setSettings(stgRes.data || [])

      // 2. Fetch Pending & Recent Pickup Requests
      const { data: pickupsData } = await supabase
        .from('gr_collection_requests')
        .select(`
          *,
          user:gr_profiles(full_name, phone, email),
          address:gr_addresses(*)
        `)
        .order('created_at', { ascending: false })
      setPickups(pickupsData || [])

      // 3. Fetch Redemptions
      const { data: redemptionsData } = await supabase
        .from('gr_redemptions')
        .select(`
          *,
          user:gr_profiles(full_name, phone, email),
          reward:gr_rewards(*)
        `)
        .order('created_at', { ascending: false })
      setRedemptions(redemptionsData || [])
    } catch (err: any) {
      toast.error('Failed to load admin data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- LOCATION ACTIONS ---
  async function handleAddLocation(e: React.FormEvent) {
    e.preventDefault()
    if (!newLocNameEn || !newLocPincode) {
      toast.error('Location Name and Pincode are required')
      return
    }

    const { data, error } = await supabase
      .from('gr_collection_locations')
      .insert([
        {
          name_en: newLocNameEn,
          name_kn: newLocNameKn || newLocNameEn,
          pincode: newLocPincode,
          is_active: true
        }
      ])

    if (!error) {
      toast.success(`Location ${newLocNameEn} added successfully!`)
      setNewLocNameEn('')
      setNewLocNameKn('')
      setNewLocPincode('')
      fetchAdminData()
    } else {
      toast.error('Error adding location: ' + error.message)
    }
  }

  async function handleDeleteLocation(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete pickup location "${name}"?`)) return

    const { error } = await supabase.from('gr_collection_locations').delete().eq('id', id)

    if (!error) {
      toast.success(`Location ${name} deleted`)
      fetchAdminData()
    } else {
      toast.error('Delete failed: ' + error.message)
    }
  }

  // --- RATE ACTIONS ---
  async function handleUpdateRate(id: string, newPoints: number) {
    const { error } = await supabase
      .from('gr_waste_categories')
      .update({ points_per_kg: newPoints })
      .eq('id', id)

    if (!error) {
      toast.success('Points multiplier updated!')
      fetchAdminData()
    } else {
      toast.error('Failed to update rate: ' + error.message)
    }
  }

  // --- PICKUP VERIFICATION & WEIGHING ---
  function openVerifyModal(pickup: any) {
    setSelectedPickup(pickup)
    const initialWeights: { [key: string]: number } = {}
    categories.forEach((cat) => {
      initialWeights[cat.id] = 0
    })
    setItemWeights(initialWeights)
    setAdminNotes('')
  }

  async function handleSaveVerification() {
    if (!selectedPickup) return
    setIsSubmitting(true)

    const lineItems = Object.keys(itemWeights)
      .filter((catId) => itemWeights[catId] > 0)
      .map((catId) => {
        const cat = categories.find((c) => c.id === catId)
        return {
          category_id: catId,
          weight_kg: itemWeights[catId],
          points_per_kg: cat.points_per_kg
        }
      })

    if (lineItems.length === 0) {
      toast.error('Please enter weight (kg) for at least one category')
      setIsSubmitting(false)
      return
    }

    const res = await fetch('/api/green-rewards/admin/collection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: selectedPickup.id,
        items: lineItems,
        admin_notes: adminNotes
      })
    })

    setIsSubmitting(false)
    if (res.ok) {
      const data = await res.json()
      toast.success(`Verified! ${data.totalWeight} kg collected, ${data.totalPoints} points awarded.`)
      setSelectedPickup(null)
      fetchAdminData()
    } else {
      const err = await res.json()
      toast.error('Verification failed: ' + err.error)
    }
  }

  // --- REDEMPTION FULFILLMENT ---
  async function handleProcessRedemption(action: 'completed' | 'rejected') {
    if (!selectedRedemption) return
    setIsSubmitting(true)

    const res = await fetch('/api/green-rewards/admin/redemption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        redemption_id: selectedRedemption.id,
        action,
        voucher_code: voucherCode,
        admin_notes: redemptionNotes
      })
    })

    setIsSubmitting(false)
    if (res.ok) {
      toast.success(action === 'completed' ? 'Redemption fulfilled successfully!' : 'Redemption rejected & points refunded.')
      setSelectedRedemption(null)
      fetchAdminData()
    } else {
      const err = await res.json()
      toast.error('Action failed: ' + err.error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-24">
        <Loader2 className="w-8 h-8 text-[#FFB300] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 md:pt-24 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 border-b border-zinc-800 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFB300]/10 border border-[#FFB300]/30 rounded-full text-[#FFB300] text-xs font-semibold mb-2">
              <Recycle className="w-3.5 h-3.5" />
              Sampige Green Rewards Admin
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Waste Management & Rewards Control</h1>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-3 rounded-xl">
            <div className="text-center px-3 border-r border-zinc-800">
              <span className="text-xs text-zinc-400 block">Pending Pickups</span>
              <span className="text-xl font-bold text-[#FFB300]">
                {pickups.filter((p) => p.status === 'pending' || p.status === 'scheduled').length}
              </span>
            </div>
            <div className="text-center px-3">
              <span className="text-xs text-zinc-400 block">Pending Redemptions</span>
              <span className="text-xl font-bold text-amber-500">
                {redemptions.filter((r) => r.status === 'pending').length}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 mt-6">
          {[
            { id: 'pickups', label: 'Pickup Requests', icon: Recycle },
            { id: 'redemptions', label: 'Redemptions', icon: Gift },
            { id: 'locations', label: 'Service Areas (Malleshwaram)', icon: MapPin },
            { id: 'rates', label: 'Waste Category Rates', icon: Scale },
            { id: 'settings', label: 'System Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  active
                    ? 'bg-[#FFB300] text-black font-semibold shadow-lg shadow-[#FFB300]/20'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* TAB 1: PICKUP REQUESTS */}
        {activeTab === 'pickups' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-[#FFB300]">
              <Recycle className="w-5 h-5" />
              Manage Pickup Bookings & Weighing
            </h2>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase text-xs border-b border-zinc-800">
                    <tr>
                      <th className="p-4">Request #</th>
                      <th className="p-4">User</th>
                      <th className="p-4">Address / Pincode</th>
                      <th className="p-4">Date & Slot</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {pickups.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-500">
                          No collection requests found.
                        </td>
                      </tr>
                    ) : (
                      pickups.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-800/50">
                          <td className="p-4 font-mono font-medium text-white">{p.request_number}</td>
                          <td className="p-4">
                            <div className="font-semibold text-white">{p.user?.full_name || 'Member'}</div>
                            <div className="text-xs text-zinc-400">{p.user?.phone || p.user?.email}</div>
                          </td>
                          <td className="p-4">
                            <div>{p.address?.street_address || 'Address provided'}</div>
                            <div className="text-xs text-[#FFB300] font-medium">{p.address?.area_name} - {p.address?.pincode}</div>
                          </td>
                          <td className="p-4">
                            <div>{p.preferred_date}</div>
                            <div className="text-xs text-zinc-400">{p.time_slot}</div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                p.status === 'verified'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : p.status === 'pending'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {p.status !== 'verified' ? (
                              <button
                                onClick={() => openVerifyModal(p)}
                                className="px-3 py-1.5 bg-[#FFB300] hover:bg-amber-400 text-black font-medium rounded-lg text-xs flex items-center gap-1 ml-auto"
                              >
                                <Scale className="w-3.5 h-3.5" /> Weigh & Award Points
                              </button>
                            ) : (
                              <span className="text-xs text-emerald-400 font-medium">
                                +{p.total_points_awarded} pts ({p.total_weight_kg} kg)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REDEMPTIONS */}
        {activeTab === 'redemptions' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-[#FFB300]">
              <Gift className="w-5 h-5" />
              Manage Reward Payouts & Redemptions
            </h2>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase text-xs border-b border-zinc-800">
                    <tr>
                      <th className="p-4">Redemption #</th>
                      <th className="p-4">Member</th>
                      <th className="p-4">Reward</th>
                      <th className="p-4">Payout Details</th>
                      <th className="p-4">Points Spent</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {redemptions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-zinc-500">
                          No redemption requests found.
                        </td>
                      </tr>
                    ) : (
                      redemptions.map((r) => (
                        <tr key={r.id} className="hover:bg-zinc-800/50">
                          <td className="p-4 font-mono font-medium text-white">{r.redemption_number}</td>
                          <td className="p-4">
                            <div className="font-semibold text-white">{r.user?.full_name}</div>
                            <div className="text-xs text-zinc-400">{r.user?.phone}</div>
                          </td>
                          <td className="p-4 font-medium text-[#FFB300]">{r.reward?.title_en}</td>
                          <td className="p-4 text-xs font-mono bg-zinc-950/50 p-2 rounded">
                            {JSON.stringify(r.payout_details)}
                          </td>
                          <td className="p-4 font-bold text-white">{r.points_spent} pts</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                r.status === 'completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : r.status === 'pending'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {r.status === 'pending' && (
                              <button
                                onClick={() => setSelectedRedemption(r)}
                                className="px-3 py-1.5 bg-[#FFB300] hover:bg-amber-400 text-black font-medium rounded-lg text-xs"
                              >
                                Process Payout
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LOCATIONS (MALLESHWARAM ADD/DELETE) */}
        {activeTab === 'locations' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-[#FFB300]">
              <MapPin className="w-5 h-5" />
              Pickup Locations & Coverage Zones
            </h2>

            {/* Add Location Form */}
            <form onSubmit={handleAddLocation} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <h3 className="font-medium text-white text-sm">Add New Pickup Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Area Name (English)</label>
                  <input
                    type="text"
                    placeholder="e.g. Malleshwaram"
                    value={newLocNameEn}
                    onChange={(e) => setNewLocNameEn(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:border-[#FFB300] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Area Name (Kannada)</label>
                  <input
                    type="text"
                    placeholder="e.g. ಮಲ್ಲೇಶ್ವರಂ"
                    value={newLocNameKn}
                    onChange={(e) => setNewLocNameKn(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:border-[#FFB300] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Pincode</label>
                  <input
                    type="text"
                    placeholder="e.g. 560003"
                    value={newLocPincode}
                    onChange={(e) => setNewLocPincode(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:border-[#FFB300] outline-none"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#FFB300] hover:bg-amber-400 text-black font-semibold rounded-xl text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Service Location
              </button>
            </form>

            {/* Existing Locations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.length === 0 ? (
                <div className="p-6 text-zinc-500 text-sm">No locations found. Add one above!</div>
              ) : (
                locations.map((loc) => (
                  <div key={loc.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-base">{loc.name_en} ({loc.name_kn})</div>
                      <div className="text-xs text-[#FFB300] font-mono mt-0.5">Pincode: {loc.pincode}</div>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold rounded">
                        Active Area
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteLocation(loc.id, loc.name_en)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition"
                      title="Delete Location"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: WASTE CATEGORY RATES */}
        {activeTab === 'rates' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-[#FFB300]">
              <Scale className="w-5 h-5" />
              Waste Multipliers (Points Earned Per KG)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{cat.name_en}</h3>
                    <p className="text-xs text-zinc-400 font-kannada">{cat.name_kn}</p>
                    <p className="text-xs text-zinc-500 mt-2">{cat.description_en}</p>
                  </div>
                  <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-400 block">Points Rate</span>
                      <span className="text-xl font-bold text-[#FFB300]">{cat.points_per_kg} pts / kg</span>
                    </div>
                    <button
                      onClick={() => {
                        const newPts = prompt(`Enter new points per kg for ${cat.name_en}:`, cat.points_per_kg)
                        if (newPts && !isNaN(Number(newPts))) {
                          handleUpdateRate(cat.id, Number(newPts))
                        }
                      }}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium"
                    >
                      Edit Rate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-[#FFB300]">
              <Settings className="w-5 h-5" />
              Global System Parameters
            </h2>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 max-w-2xl">
              {settings.map((stg) => (
                <div key={stg.key} className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <div>
                    <span className="font-semibold text-white text-sm block font-mono">{stg.key}</span>
                    <span className="text-xs text-zinc-400">{stg.description}</span>
                  </div>
                  <span className="px-3 py-1 bg-zinc-950 border border-zinc-800 text-[#FFB300] font-mono rounded-lg text-sm">
                    {stg.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: WEIGHING & VERIFICATION MODAL */}
      {selectedPickup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-lg">Weigh Waste & Award Points</h3>
                <p className="text-xs text-zinc-400">Request #{selectedPickup.request_number}</p>
              </div>
              <button onClick={() => setSelectedPickup(null)} className="text-zinc-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-xs text-zinc-400 uppercase font-semibold block">Item Weights (in Kilograms)</label>
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <div>
                    <span className="text-sm text-white font-medium block">{cat.name_en}</span>
                    <span className="text-xs text-[#FFB300]">{cat.points_per_kg} pts / kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0.0"
                      value={itemWeights[cat.id] || ''}
                      onChange={(e) =>
                        setItemWeights({
                          ...itemWeights,
                          [cat.id]: parseFloat(e.target.value) || 0
                        })
                      }
                      className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-right font-mono text-white text-sm focus:border-[#FFB300] outline-none"
                    />
                    <span className="text-xs text-zinc-400">kg</span>
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Collector Notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional verification comments..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#FFB300] outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPickup(null)}
                className="w-1/2 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVerification}
                disabled={isSubmitting}
                className="w-1/2 py-2.5 bg-[#FFB300] hover:bg-amber-400 text-black rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Award Points'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REDEMPTION PROCESS MODAL */}
      {selectedRedemption && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-lg">Process Payout Request</h3>
                <p className="text-xs text-zinc-400">Redemption #{selectedRedemption.redemption_number}</p>
              </div>
              <button onClick={() => setSelectedRedemption(null)} className="text-zinc-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-sm">
              <div>
                <span className="text-zinc-400 text-xs block">Reward Type</span>
                <span className="text-[#FFB300] font-semibold">{selectedRedemption.reward?.title_en}</span>
              </div>
              <div>
                <span className="text-zinc-400 text-xs block">Payout Details</span>
                <span className="font-mono text-white text-xs">{JSON.stringify(selectedRedemption.payout_details)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Voucher Code / Reference ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref # 98127398127"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:border-[#FFB300] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Admin Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes for the member..."
                  value={redemptionNotes}
                  onChange={(e) => setRedemptionNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#FFB300] outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleProcessRedemption('rejected')}
                disabled={isSubmitting}
                className="w-1/2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-sm font-semibold"
              >
                Reject & Refund
              </button>
              <button
                onClick={() => handleProcessRedemption('completed')}
                disabled={isSubmitting}
                className="w-1/2 py-2.5 bg-[#FFB300] hover:bg-amber-400 text-black rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Payout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}