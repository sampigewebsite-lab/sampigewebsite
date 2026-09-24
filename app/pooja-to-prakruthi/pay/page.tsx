'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import {
  Loader2, Search, Leaf, QrCode, Upload, ArrowRight, CheckCircle2,
  Building2, CreditCard, Hash, Landmark, Copy
} from 'lucide-react'

function PoojaPaymentContent() {
  const searchParams = useSearchParams()
  const urlPhone = searchParams.get('phone') || ''

  const [phone, setPhone] = useState(urlPhone)
  const [loading, setLoading] = useState(false)
  const [member, setMember] = useState<any>(null)
  const [searched, setSearched] = useState(false)

  // Bank details from Admin → Settings (donation)
  const [donation, setDonation] = useState<any>({})
  const [settingsLoading, setSettingsLoading] = useState(true)

  const [proofLoading, setProofLoading] = useState(false)
  const [proofDone, setProofDone] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadDonationSettings()
  }, [])

  useEffect(() => {
    if (urlPhone) handleSearch(null, urlPhone)
  }, [urlPhone])

  async function loadDonationSettings() {
    setSettingsLoading(true)
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'donation')
      .single()
    setDonation(data?.value || {})
    setSettingsLoading(false)
  }

  async function handleSearch(e?: React.FormEvent | null, searchPhone?: string) {
    if (e) e.preventDefault()
    const p = (searchPhone || phone || '').trim()
    if (!p) return

    setLoading(true)
    setSearched(true)

    const { data, error } = await supabase
      .from('pooja_enquiries')
      .select('*')
      .or(`phone.eq.${p},phone.ilike.%${p}%`)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error || !data || data.length === 0) setMember(null)
    else setMember(data[0])
    setLoading(false)
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }

  const upiId = donation.upi_id || ''
  const bankName = donation.bank_name || ''
  const accountName = donation.account_name || 'SAMPIGE FOUNDATION'
  const accountNumber = donation.account_number || ''
  const ifscCode = donation.ifsc_code || ''
  const uploadedQr = donation.qr_code || ''

  let qrUrl = uploadedQr
  if (!qrUrl && upiId) {
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(accountName)}&cu=INR`
    qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(upiUri)}`
  }

  async function handleProofSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProofLoading(true)

    const formData = new FormData(e.currentTarget)
    const paymentRef = (formData.get('payment_ref') as string) || ''

    if (!paymentRef && !file) {
      toast.error('Enter UTR/reference OR upload a screenshot')
      setProofLoading(false)
      return
    }

    let screenshot_url: string | null = null
    if (file) {
      const ext = file.name.split('.').pop()
      const path = `pooja_payment_${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('media')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (upErr) {
        toast.error('Screenshot upload failed: ' + upErr.message)
        setProofLoading(false)
        return
      }
      const { data: pub } = supabase.storage.from('media').getPublicUrl(path)
      screenshot_url = pub.publicUrl
    }

    const { error } = await supabase.from('donation_payment_proofs').insert([
      {
        full_name: member.full_name || member.contact_person || 'Member',
        phone: member.phone,
        payment_ref: paymentRef || null,
        screenshot_url,
        purpose: `pooja-${member.participation_type || 'member'}-payment`,
        amount: member.participation_type === 'household' ? '300' : null,
        status: 'pending_review',
      },
    ])

    if (error) {
      toast.error(error.message || 'Could not save proof')
      setProofLoading(false)
      return
    }

    await supabase
      .from('pooja_enquiries')
      .update({
        payment_status: 'Pending',
        admin_notes: [
          member.admin_notes || '',
          paymentRef ? `UTR: ${paymentRef}` : null,
          screenshot_url ? 'Screenshot uploaded' : null,
        ]
          .filter(Boolean)
          .join(' | '),
      })
      .eq('id', member.id)

    setProofDone(true)
    setProofLoading(false)
    toast.success('Payment proof submitted!')
  }

  return (
    <main className="bg-black min-h-screen pt-28 pb-20">
      <Toaster position="top-center" />
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#FFB300]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFB300]/20">
            <Leaf className="w-8 h-8 text-[#FFB300]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Membership Payment</h1>
          <p className="text-gray-400 text-sm">
            First payment or monthly renewal — bank details come from Admin Settings.
          </p>
        </div>

        {/* Find member */}
        {!member && (
          <form onSubmit={(e) => handleSearch(e)} className="bg-[#141414] p-6 md:p-8 rounded-3xl border border-gray-800 space-y-4">
            <label className="text-xs font-semibold text-gray-400 uppercase">Registered Phone Number</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number"
                className="flex-1 bg-black border border-gray-800 rounded-xl px-5 py-4 text-white focus:border-[#FFB300] outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#FFB300] text-black font-extrabold px-8 py-4 rounded-xl hover:bg-[#FFCA28] uppercase text-sm flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Find Me
              </button>
            </div>
            {searched && !loading && !member && (
              <p className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg">
                No membership found for this number.
              </p>
            )}
          </form>
        )}

        {member && !proofDone && (
          <div className="space-y-6">
            {/* Member card */}
            <div className="bg-gradient-to-br from-[#1A1500] to-black p-6 rounded-3xl border border-[#FFB300]/30">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{member.full_name || member.contact_person}</h2>
                  <p className="text-sm text-gray-400 capitalize">
                    {member.participation_type} · {member.area_locality || 'Bangalore'}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    member.payment_status === 'Paid'
                      ? 'bg-green-900/40 text-green-400 border border-green-800'
                      : 'bg-red-900/40 text-red-400 border border-red-800'
                  }`}
                >
                  {member.payment_status || 'Unpaid'}
                </span>
              </div>
              {member.participation_type === 'household' && (
                <p className="text-[#FFB300] font-bold text-lg">Pay ₹300 this month</p>
              )}
            </div>

            {/* Bank / UPI from Settings */}
            <div className="bg-[#141414] p-6 rounded-3xl border border-gray-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#FFB300]" /> Pay using Sampige bank details
              </h3>
              <p className="text-xs text-gray-500">
                These details are loaded from Admin → Settings. Change them only there.
              </p>

              {settingsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FFB300]" />
                </div>
              ) : (
                <>
                  {qrUrl && (
                    <div className="flex flex-col items-center py-4">
                      <div className="bg-white p-3 rounded-2xl">
                        <img src={qrUrl} alt="UPI QR" className="w-48 h-48 object-contain" />
                      </div>
                      <span className="text-[11px] text-[#FFB300] mt-2 font-bold uppercase">UPI QR</span>
                    </div>
                  )}

                  {upiId && (
                    <div className="bg-black rounded-xl p-3.5 border border-gray-800 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">UPI ID</p>
                        <p className="text-[#FFB300] font-bold break-all">{upiId}</p>
                      </div>
                      <button type="button" onClick={() => copyText(upiId, 'UPI ID')} className="p-2 text-gray-400 hover:text-white">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {accountName && (
                    <div className="bg-black rounded-xl p-3.5 border border-gray-800 flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-[#FFB300] shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-500 uppercase">Account Name</p>
                        <div className="flex justify-between gap-2">
                          <p className="text-white font-semibold text-sm">{accountName}</p>
                          <button type="button" onClick={() => copyText(accountName, 'Account Name')}>
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {bankName && (
                    <div className="bg-black rounded-xl p-3.5 border border-gray-800 flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-[#FFB300] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-500 uppercase">Bank</p>
                        <div className="flex justify-between gap-2">
                          <p className="text-white font-semibold text-sm">{bankName}</p>
                          <button type="button" onClick={() => copyText(bankName, 'Bank')}>
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {accountNumber && (
                    <div className="bg-black rounded-xl p-3.5 border border-gray-800 flex items-start gap-3">
                      <Hash className="w-5 h-5 text-[#FFB300] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-500 uppercase">Account Number</p>
                        <div className="flex justify-between gap-2">
                          <p className="text-white font-mono text-sm">{accountNumber}</p>
                          <button type="button" onClick={() => copyText(accountNumber, 'Account Number')}>
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {ifscCode && (
                    <div className="bg-black rounded-xl p-3.5 border border-gray-800 flex items-start gap-3">
                      <Landmark className="w-5 h-5 text-[#FFB300] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-500 uppercase">IFSC</p>
                        <div className="flex justify-between gap-2">
                          <p className="text-white font-mono text-sm uppercase">{ifscCode}</p>
                          <button type="button" onClick={() => copyText(ifscCode, 'IFSC')}>
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!upiId && !accountNumber && !qrUrl && (
                    <p className="text-amber-400 text-sm text-center py-4">
                      No bank details in Settings yet. Admin → Settings → Donation.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Proof form */}
            <form onSubmit={handleProofSubmit} className="bg-[#141414] p-6 rounded-3xl border border-gray-800 space-y-5">
              <h3 className="text-lg font-bold text-white">After you pay — submit proof</h3>
              <p className="text-sm text-gray-400">UTR/reference and/or screenshot. Admin will verify and mark Paid.</p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">UTR / UPI reference</label>
                <input
                  name="payment_ref"
                  type="text"
                  placeholder="e.g. 312345678901"
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">Screenshot (optional if UTR given)</label>
                <label className="flex flex-col items-center justify-center gap-2 w-full bg-black border border-dashed border-gray-700 rounded-xl px-4 py-8 text-gray-400 text-sm cursor-pointer hover:border-[#FFB300]/50">
                  <Upload className="w-5 h-5 text-[#FFB300]" />
                  {file ? <span className="text-white font-medium">{file.name}</span> : <span>Choose image</span>}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={proofLoading}
                className="w-full py-4 bg-[#FFB300] text-black font-extrabold rounded-xl text-sm uppercase tracking-wider hover:bg-[#FFCA28] flex items-center justify-center gap-2"
              >
                {proofLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit for verification'}
                {!proofLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}

        {proofDone && (
          <div className="bg-[#0A1A0A] border border-green-800/40 rounded-3xl p-10 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Proof received</h3>
            <p className="text-gray-400 text-sm mb-6">
              Our team will verify and update your membership to Paid / Active.
            </p>
            <a href="/pooja-to-prakruthi" className="inline-block px-6 py-3 bg-black border border-gray-800 text-gray-300 rounded-xl text-sm">
              Back to Pooja to Prakruthi
            </a>
          </div>
        )}
      </div>
    </main>
  )
}

export default function PoojaPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <PoojaPaymentContent />
    </Suspense>
  )
}