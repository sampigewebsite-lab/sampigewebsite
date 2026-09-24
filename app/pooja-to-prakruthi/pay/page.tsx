'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import { Loader2, Search, Leaf, QrCode, Upload, ArrowRight, CheckCircle2 } from 'lucide-react'

function PoojaPaymentContent() {
  const searchParams = useSearchParams()
  const urlPhone = searchParams.get('phone') || ''
  
  const [phone, setPhone] = useState(urlPhone)
  const [loading, setLoading] = useState(false)
  const [member, setMember] = useState<any>(null)
  const [searched, setSearched] = useState(false)

  // Payment proof form state
  const [proofLoading, setProofLoading] = useState(false)
  const [proofDone, setProofDone] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  
  const supabase = createClient()

  // Auto-search if phone is in URL (from initial signup)
  useEffect(() => {
    if (urlPhone) {
      handleSearch(null, urlPhone)
    }
  }, [urlPhone])

  async function handleSearch(e?: React.FormEvent | null, searchPhone?: string) {
    if (e) e.preventDefault()
    const p = searchPhone || phone
    if (!p) return

    setLoading(true)
    setSearched(true)
    
    const { data, error } = await supabase
      .from('pooja_enquiries')
      .select('*')
      .or(`phone.eq.${p},phone.ilike.%${p}%`)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error || !data || data.length === 0) {
      setMember(null)
    } else {
      setMember(data[0])
    }
    setLoading(false)
  }

  async function handleProofSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProofLoading(true)

    const formData = new FormData(e.currentTarget)
    const paymentRef = formData.get('payment_ref') as string
    
    if (!paymentRef && !file) {
      toast.error('Please provide a UTR number or upload a screenshot')
      setProofLoading(false)
      return
    }

    let screenshot_url = null
    if (file) {
      const ext = file.name.split('.').pop()
      const path = `payment_proof_${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('media').upload(path, file, { upsert: true, contentType: file.type })
      if (!upErr) {
        const { data: pub } = supabase.storage.from('media').getPublicUrl(path)
        screenshot_url = pub.publicUrl
      }
    }

    // Save proof to database
    await supabase.from('donation_payment_proofs').insert([{
      full_name: member.full_name || member.contact_person,
      phone: member.phone,
      payment_ref: paymentRef || null,
      screenshot_url,
      purpose: `pooja-${member.participation_type}-renewal`,
      status: 'pending_review'
    }])

    // Mark member as pending
    await supabase.from('pooja_enquiries')
      .update({ 
        payment_status: 'Pending',
        admin_notes: `${member.admin_notes || ''} | Proof submitted: ${paymentRef || 'Screenshot'}`
      })
      .eq('id', member.id)

    setProofDone(true)
    setProofLoading(false)
    toast.success('Payment submitted for verification!')
  }

  return (
    <main className="bg-black min-h-screen pt-28 pb-20">
      <Toaster position="top-center" />
      <div className="container mx-auto px-4 max-w-2xl">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#FFB300]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFB300]/20">
            <Leaf className="w-8 h-8 text-[#FFB300]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Membership Renewal & Payment</h1>
          <p className="text-gray-400 text-sm">Enter your registered mobile number to pay your monthly subscription.</p>
        </div>

        {/* SEARCH FORM */}
        {!member && (
          <form onSubmit={(e) => handleSearch(e)} className="bg-[#141414] p-6 md:p-8 rounded-3xl border border-gray-800 shadow-xl space-y-4">
            <label className="text-xs font-semibold text-gray-400 uppercase">Registered Phone Number</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="Enter 10-digit number" 
                className="flex-1 bg-black border border-gray-800 rounded-xl px-5 py-4 text-white focus:border-[#FFB300] outline-none text-center sm:text-left"
              />
              <button type="submit" disabled={loading} className="bg-[#FFB300] text-black font-extrabold px-8 py-4 rounded-xl hover:bg-[#FFCA28] uppercase text-sm tracking-wider flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Find Me
              </button>
            </div>
            {searched && !loading && !member && (
              <p className="text-red-400 text-sm text-center mt-4 bg-red-900/20 py-2 rounded-lg">No active membership found. Please check the number.</p>
            )}
          </form>
        )}

        {/* MEMBER FOUND & PAYMENT UPLOAD */}
        {member && !proofDone && (
          <div className="space-y-6 animate-fade-in-up">
            
            {/* Member Details Card */}
            <div className="bg-gradient-to-br from-[#1A1500] to-black p-6 rounded-3xl border border-[#FFB300]/30 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{member.full_name || member.contact_person}</h2>
                  <p className="text-sm text-gray-400 capitalize">{member.participation_type} Member · {member.area_locality}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${member.payment_status === 'Paid' ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-red-900/40 text-red-400 border border-red-800'}`}>
                  Status: {member.payment_status || 'Unpaid'}
                </span>
              </div>
              
              <div className="bg-black/50 rounded-2xl p-4 border border-gray-800 flex items-center gap-4">
                <QrCode className="w-8 h-8 text-[#FFB300]" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Please pay via UPI to:</p>
                  <p className="text-white font-mono font-bold tracking-wide">SAMPIGEFOUNDATION@SBI</p>
                  <p className="text-xs text-gray-500 mt-1">Amount depends on your membership tier (Household ₹300, Apartment ₹100/flat)</p>
                </div>
              </div>
            </div>

            {/* Proof Upload Form */}
            <form onSubmit={handleProofSubmit} className="bg-[#141414] p-6 md:p-8 rounded-3xl border border-gray-800 shadow-xl space-y-6">
              <h3 className="text-lg font-bold text-white mb-2">Submit Payment Proof</h3>
              <p className="text-sm text-gray-400 border-b border-gray-800 pb-4">Submit your UTR number or a screenshot so we can activate your month.</p>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase">UTR / UPI Reference Number</label>
                <input name="payment_ref" type="text" placeholder="e.g. 312345678901" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#FFB300] outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase">Payment Screenshot (Optional if UTR provided)</label>
                <label className="flex flex-col items-center justify-center gap-2 w-full bg-black border border-dashed border-gray-700 rounded-xl px-4 py-8 text-gray-400 text-sm cursor-pointer hover:border-[#FFB300]/50 transition-colors">
                  <Upload className="w-5 h-5 text-[#FFB300]" />
                  {file ? <span className="text-white font-medium">{file.name}</span> : <span>Tap to choose image</span>}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
              </div>

              <button type="submit" disabled={proofLoading} className="w-full py-4 bg-[#FFB300] text-black font-extrabold rounded-xl text-sm uppercase tracking-wider hover:bg-[#FFCA28] flex items-center justify-center gap-2">
                {proofLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit for Verification'}
                {!proofLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}

        {/* DONE SCREEN */}
        {proofDone && (
          <div className="bg-[#0A1A0A] border border-green-800/40 rounded-3xl p-10 text-center animate-fade-in-up shadow-xl">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Proof Received!</h3>
            <p className="text-gray-400 text-sm mb-6">
              Thank you {member?.full_name}. Our team will verify your payment and update your membership status to Active.
            </p>
            <a href="/pooja-to-prakruthi" className="inline-block px-6 py-3 bg-black border border-gray-800 text-gray-300 rounded-xl hover:text-white transition-colors text-sm">
              Return to Homepage
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