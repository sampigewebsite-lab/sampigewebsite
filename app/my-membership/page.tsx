'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import {
  Loader2,
  Search,
  Leaf,
  User,
  Calendar,
  CreditCard,
  MapPin,
  Package,
  Sprout,
  LogOut,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Home,
  Building2,
  Sparkles,
} from 'lucide-react'

function MyMembershipContent() {
  const searchParams = useSearchParams()
  const urlPhone = searchParams.get('phone') || ''
  const urlEmail = searchParams.get('email') || ''

  const [mode, setMode] = useState<'phone' | 'email'>('phone')
  const [phone, setPhone] = useState(urlPhone)
  const [email, setEmail] = useState(urlEmail)
  const [loading, setLoading] = useState(false)
  const [member, setMember] = useState<any>(null)
  const [collectionPoint, setCollectionPoint] = useState<any>(null)
  const [proofs, setProofs] = useState<any[]>([])
  const [searched, setSearched] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (urlPhone) {
      setMode('phone')
      handleLookup('phone', urlPhone)
    } else if (urlEmail) {
      setMode('email')
      handleLookup('email', urlEmail)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlPhone, urlEmail])

  async function handleLookup(lookupMode?: 'phone' | 'email', value?: string) {
    const m = lookupMode || mode
    const raw =
      m === 'phone'
        ? (value ?? phone).trim()
        : (value ?? email).trim().toLowerCase()

    if (!raw) {
      toast.error(m === 'phone' ? 'Enter your registered phone number' : 'Enter your registered email')
      return
    }

    setLoading(true)
    setSearched(true)
    setMember(null)
    setCollectionPoint(null)
    setProofs([])

    let query = supabase.from('pooja_enquiries').select('*')

    if (m === 'phone') {
      const digits = raw.replace(/\D/g, '')
      const last10 = digits.slice(-10)
      query = query.or(
        `phone.eq.${raw},phone.eq.${last10},phone.eq.91${last10},phone.ilike.%${last10}%`
      )
    } else {
      query = query.ilike('email', raw)
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(1)

    if (error || !data || data.length === 0) {
      setMember(null)
      setLoading(false)
      return
    }

    const found = data[0]
    setMember(found)

    if (found.collection_point_id) {
      const { data: cp } = await supabase
        .from('pooja_collection_points')
        .select('*')
        .eq('id', found.collection_point_id)
        .maybeSingle()
      setCollectionPoint(cp || null)
    }

    if (found.phone) {
      const { data: proofData } = await supabase
        .from('donation_payment_proofs')
        .select('id, amount, payment_ref, status, created_at, purpose')
        .eq('phone', found.phone)
        .order('created_at', { ascending: false })
        .limit(5)
      setProofs(proofData || [])
    }

    setLoading(false)
  }

  function handleLogout() {
    setMember(null)
    setCollectionPoint(null)
    setProofs([])
    setSearched(false)
    setPhone('')
    setEmail('')
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleLookup()
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const isOverdue =
    member?.next_due_date &&
    member.next_due_date < todayStr &&
    member.payment_status !== 'Paid'
  const isPaid = member?.payment_status === 'Paid'
  const isActive =
    member?.subscription_status === 'Active' || isPaid

  const typeIcon =
    member?.participation_type === 'apartment'
      ? Building2
      : member?.participation_type === 'temple'
        ? Sparkles
        : Home
  const TypeIcon = typeIcon

  return (
    <main className="bg-black min-h-screen pt-28 pb-20">
      <Toaster position="top-center" />
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#FFB300]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFB300]/20">
            <User className="w-8 h-8 text-[#FFB300]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Membership</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Pooja to Prakruthi member portal — view status, due dates, impact, and renew payment.
          </p>
        </div>

        {/* ========== LOGIN ========== */}
        {!member && (
          <div className="bg-[#141414] p-6 md:p-8 rounded-3xl border border-gray-800 space-y-5">
            <div className="flex gap-2 p-1 bg-black rounded-full w-fit mx-auto border border-gray-800">
              <button
                type="button"
                onClick={() => setMode('phone')}
                className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                  mode === 'phone' ? 'bg-[#FFB300] text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" /> Phone
              </button>
              <button
                type="button"
                onClick={() => setMode('email')}
                className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                  mode === 'email' ? 'bg-[#FFB300] text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {mode === 'phone' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase">
                    Registered Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full bg-black border border-gray-800 rounded-xl px-5 py-4 text-white focus:border-[#FFB300] outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-black border border-gray-800 rounded-xl px-5 py-4 text-white focus:border-[#FFB300] outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FFB300] text-black font-extrabold py-4 rounded-xl hover:bg-[#FFCA28] uppercase text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Open My Account
              </button>
            </form>

            {searched && !loading && !member && (
              <p className="text-red-400 text-sm text-center bg-red-900/20 py-3 rounded-xl">
                No membership found. Please use the phone/email you registered with, or{' '}
                <Link href="/pooja-to-prakruthi#join-form" className="underline text-[#FFB300]">
                  join the programme
                </Link>
                .
              </p>
            )}

            <p className="text-center text-xs text-gray-500 pt-2">
              Need to pay or renew?{' '}
              <Link href="/pooja-to-prakruthi/pay" className="text-[#FFB300] hover:underline font-semibold">
                Go to Payment page
              </Link>
            </p>
          </div>
        )}

        {/* ========== DASHBOARD ========== */}
        {member && (
          <div className="space-y-5">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-400">
                Signed in as{' '}
                <span className="text-white font-semibold">
                  {member.full_name || member.contact_person || 'Member'}
                </span>
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-800 px-3 py-2 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" /> Switch account
              </button>
            </div>

            {/* Status card */}
            <div className="bg-gradient-to-br from-[#1A1500] to-black p-6 rounded-3xl border border-[#FFB300]/30">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFB300]/10 border border-[#FFB300]/30 flex items-center justify-center shrink-0">
                    <TypeIcon className="w-6 h-6 text-[#FFB300]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {member.full_name || member.contact_person}
                    </h2>
                    <p className="text-sm text-gray-400 capitalize">
                      {member.participation_type || 'Member'}
                      {member.area_locality ? ` · ${member.area_locality}` : ''}
                    </p>
                    {member.phone && (
                      <p className="text-xs text-[#FFB300] font-mono mt-1">{member.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                      isPaid
                        ? 'bg-green-900/40 text-green-400 border-green-800'
                        : member.payment_status === 'Pending'
                          ? 'bg-yellow-900/40 text-yellow-400 border-yellow-800'
                          : 'bg-red-900/40 text-red-400 border-red-800'
                    }`}
                  >
                    {member.payment_status || 'Unpaid'}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                      isActive
                        ? 'bg-green-900/30 text-green-400 border-green-800/50'
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}
                  >
                    {member.subscription_status || (isPaid ? 'Active' : 'Inactive')}
                  </span>
                </div>
              </div>

              {/* Due date alert */}
              {member.next_due_date && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-2xl border ${
                    isOverdue
                      ? 'bg-red-950/40 border-red-800/50'
                      : 'bg-black/50 border-gray-800'
                  }`}
                >
                  {isOverdue ? (
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  ) : (
                    <Calendar className="w-5 h-5 text-[#FFB300] shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 uppercase font-semibold">Next due date</p>
                    <p
                      className={`font-bold ${
                        isOverdue ? 'text-red-400' : 'text-white'
                      }`}
                    >
                      {member.next_due_date}
                      {isOverdue ? ' · Overdue — please renew' : ''}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
                {member.last_payment_date && (
                  <div className="bg-black/40 rounded-xl p-3 border border-gray-800">
                    <p className="text-[10px] text-gray-500 uppercase">Last payment</p>
                    <p className="text-white font-semibold">{member.last_payment_date}</p>
                  </div>
                )}
                {member.subscription_start_date && (
                  <div className="bg-black/40 rounded-xl p-3 border border-gray-800">
                    <p className="text-[10px] text-gray-500 uppercase">Member since</p>
                    <p className="text-white font-semibold">{member.subscription_start_date}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Personal impact */}
            <div className="bg-[#141414] p-6 rounded-3xl border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-[#FFB300]" /> Your impact
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/60 p-5 rounded-2xl border border-gray-800 text-center">
                  <Package className="w-5 h-5 text-[#FFB300] mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-black text-[#FFB300]">
                    {member.total_kg_saved ?? 0}
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-400 mt-1 uppercase font-semibold">
                    kg flower waste diverted
                  </div>
                </div>
                <div className="bg-black/60 p-5 rounded-2xl border border-gray-800 text-center">
                  <Sprout className="w-5 h-5 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-black text-green-400">
                    {member.compost_kg_produced ?? 0}
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-400 mt-1 uppercase font-semibold">
                    kg compost produced
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-4">
                Updated by Sampige when collections are recorded.
              </p>
            </div>

            {/* Address / details */}
            <div className="bg-[#141414] p-6 rounded-3xl border border-gray-800 space-y-3">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#FFB300]" /> Membership details
              </h3>
              {member.address && (
                <p className="text-sm text-gray-300">
                  <span className="text-gray-500 text-xs uppercase block mb-0.5">Address</span>
                  {member.address}
                </p>
              )}
              {member.apartment_name && (
                <p className="text-sm text-gray-300">
                  <span className="text-gray-500 text-xs uppercase block mb-0.5">Apartment</span>
                  {member.apartment_name}
                  {member.flats_participating
                    ? ` · ${member.flats_participating} flats`
                    : ''}
                </p>
              )}
              {member.email && (
                <p className="text-sm text-gray-300">
                  <span className="text-gray-500 text-xs uppercase block mb-0.5">Email</span>
                  {member.email}
                </p>
              )}
              {collectionPoint && (
                <div className="mt-3 p-4 bg-black/50 rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-500 uppercase mb-1">Collection point</p>
                  <p className="text-white font-semibold">{collectionPoint.name}</p>
                  <p className="text-sm text-gray-400">
                    {collectionPoint.area}
                    {collectionPoint.address ? ` · ${collectionPoint.address}` : ''}
                  </p>
                </div>
              )}
            </div>

            {/* Recent payment proofs */}
            {proofs.length > 0 && (
              <div className="bg-[#141414] p-6 rounded-3xl border border-gray-800">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#FFB300]" /> Recent payment proofs
                </h3>
                <ul className="space-y-2">
                  {proofs.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 bg-black/50 rounded-xl px-4 py-3 border border-gray-800 text-sm"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {p.payment_ref || 'Proof submitted'}
                          {p.amount ? ` · ₹${p.amount}` : ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          {p.created_at
                            ? new Date(p.created_at).toLocaleDateString('en-IN')
                            : ''}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                          p.status === 'verified'
                            ? 'bg-green-900/40 text-green-400'
                            : p.status === 'rejected'
                              ? 'bg-red-900/40 text-red-400'
                              : 'bg-yellow-900/40 text-yellow-400'
                        }`}
                      >
                        {p.status || 'pending'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                href={`/pooja-to-prakruthi/pay?phone=${encodeURIComponent(member.phone || '')}`}
                className="inline-flex items-center justify-center gap-2 py-4 bg-[#FFB300] text-black font-extrabold rounded-xl hover:bg-[#FFCA28] uppercase text-xs tracking-wider"
              >
                <CreditCard className="w-4 h-4" />
                {isOverdue || !isPaid ? 'Pay / Renew now' : 'Renew membership'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pooja-to-prakruthi"
                className="inline-flex items-center justify-center gap-2 py-4 border border-gray-700 text-gray-300 font-bold rounded-xl hover:border-[#FFB300]/40 hover:text-[#FFB300] uppercase text-xs tracking-wider"
              >
                Back to programme
              </Link>
            </div>

            <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Need help? WhatsApp Sampige at +91 77606 90264
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default function MyMembershipPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#FFB300] animate-spin" />
        </div>
      }
    >
      <MyMembershipContent />
    </Suspense>
  )
}