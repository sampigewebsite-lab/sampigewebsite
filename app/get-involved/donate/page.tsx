import { createClient } from '@/lib/supabase/server'
import PageHero from '@/components/PageHero'
import { getPageHero, heroToStats } from '@/lib/getPageHero'
import { Building2, CreditCard, Hash, Landmark, FileText, QrCode, Sparkles } from 'lucide-react'
import CopyButton from '@/components/CopyButton'

export const dynamic = 'force-dynamic'

export default async function DonatePage() {
  const supabase = await createClient()

  const hero = await getPageHero('donate')

  const { data: donationSettings } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'donation')
    .single()

  const donation = donationSettings?.value || {}

  const upiId = donation.upi_id || ''
  const bankName = donation.bank_name || ''
  const accountName = donation.account_name || 'SAMPIGE FOUNDATION'
  const accountNumber = donation.account_number || ''
  const ifscCode = donation.ifsc_code || ''
  const pan = donation.pan || ''
  const uploadedQrCode = donation.qr_code || ''
  const donationUrl = donation.donation_url || ''
  const legacyBank = donation.bank_details || ''

  const hasStructuredBank = bankName || accountName || accountNumber || ifscCode || pan

  // AUTO-GENERATE UPI QR CODE
  // Generates a standard upi://pay URI compatible with Google Pay, PhonePe, Paytm, BHIM, etc.
  let activeQrUrl = uploadedQrCode

  if (!activeQrUrl && upiId) {
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(accountName)}&cu=INR`
    activeQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUri)}`
  }

  return (
    <main className="bg-black min-h-screen">
      <PageHero
        badge={hero?.badge || 'SUPPORT US'}
        title={hero?.title || 'Support Our Mission'}
        description={hero?.description || 'Your contribution helps us create lasting change in communities.'}
        backgroundImage={hero?.background_image}
        stats={heroToStats(hero)}
      />

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Ways to <span className="text-gold-500">Donate</span>
            </h2>
            <p className="text-[#B0B0B0] max-w-2xl mx-auto text-sm md:text-base">
              Scan the QR code with any UPI app or transfer directly to our bank account.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* UPI + AUTO-GENERATED QR */}
            <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gold-500/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Scan to Pay (UPI)</h3>
                    <p className="text-xs text-[#B0B0B0]">GPay, PhonePe, Paytm, BHIM</p>
                  </div>
                </div>

                {activeQrUrl ? (
                  <div className="flex flex-col items-center mb-6">
                    <div className="bg-white p-4 rounded-2xl shadow-2xl border-4 border-gold-500/30">
                      <img
                        src={activeQrUrl}
                        alt="UPI Payment QR Code"
                        className="w-48 h-48 md:w-56 md:h-56 object-contain"
                      />
                    </div>
                    <span className="text-[11px] text-gold-500 font-bold uppercase tracking-wider mt-3 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Auto-Generated Payment QR
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-center mb-6">
                    <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl border-2 border-dashed border-gray-700 flex items-center justify-center bg-black/50 text-center text-gray-500 text-xs px-4">
                      Enter a UPI ID in Settings to generate QR
                    </div>
                  </div>
                )}
              </div>

              {upiId && (
                <div className="bg-black rounded-xl p-4 border border-gray-800">
                  <p className="text-xs text-[#B0B0B0] uppercase tracking-wider mb-1">UPI ID</p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-gold-500 text-lg md:text-xl font-bold break-all">{upiId}</p>
                    <CopyButton text={upiId} label="UPI ID" />
                  </div>
                </div>
              )}
            </div>

            {/* Bank Transfer */}
            <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gold-500/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-gold-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Bank Account Transfer</h3>
              </div>

              {hasStructuredBank ? (
                <div className="space-y-3.5">
                  {bankName && (
                    <div className="bg-black rounded-xl p-3.5 border border-gray-800 flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-[#B0B0B0] uppercase tracking-wider">Bank Name</p>
                        <p className="text-white font-semibold text-sm">{bankName}</p>
                      </div>
                    </div>
                  )}
                  {accountName && (
                    <div className="bg-black rounded-xl p-3.5 border border-gray-800 flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-[#B0B0B0] uppercase tracking-wider">Account Name</p>
                        <p className="text-white font-semibold text-sm">{accountName}</p>
                      </div>
                    </div>
                  )}
                  {accountNumber && (
                    <div className="bg-black rounded-xl p-3.5 border border-gray-800 flex items-start gap-3">
                      <Hash className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-[#B0B0B0] uppercase tracking-wider">Account Number</p>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-white font-semibold font-mono text-sm tracking-wide">{accountNumber}</p>
                          <CopyButton text={accountNumber} label="Account Number" />
                        </div>
                      </div>
                    </div>
                  )}
                  {ifscCode && (
                    <div className="bg-black rounded-xl p-3.5 border border-gray-800 flex items-start gap-3">
                      <Landmark className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-[#B0B0B0] uppercase tracking-wider">IFSC Code</p>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-white font-semibold font-mono text-sm tracking-wide uppercase">{ifscCode}</p>
                          <CopyButton text={ifscCode} label="IFSC Code" />
                        </div>
                      </div>
                    </div>
                  )}
                  {pan && (
                    <div className="bg-black rounded-xl p-3.5 border border-gray-800 flex items-start gap-3">
                      <FileText className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-[#B0B0B0] uppercase tracking-wider">PAN</p>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-white font-semibold font-mono text-sm tracking-wide uppercase">{pan}</p>
                          <CopyButton text={pan} label="PAN" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : legacyBank ? (
                <div className="bg-black rounded-xl p-4 border border-gray-800">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{legacyBank}</p>
                </div>
              ) : (
                <div className="bg-black rounded-xl p-6 border border-gray-800 text-center text-gray-500 text-sm">
                  Bank details will appear here after you save them in Admin → Settings
                </div>
              )}
            </div>
          </div>

          {donationUrl && donationUrl !== '#' && (
            <div className="mt-10 text-center">
              <a
                href={donationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 bg-gold-500 text-black font-bold rounded-full hover:bg-gold-600 transition-all hover:scale-105"
              >
                Donate Online
              </a>
            </div>
          )}

          <p className="text-center text-gray-500 text-xs mt-10 max-w-lg mx-auto">
            Donations to Sampige Foundation may be eligible for tax benefits under Section 80G.
            Please retain your payment receipt for records.
          </p>
        </div>
      </section>
    </main>
  )
}