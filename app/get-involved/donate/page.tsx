import { createClient } from '@/lib/supabase/server'

export default async function DonatePage() {
  const supabase = await createClient()
  
  // Fetch donation settings
  const { data: donationSettings } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'donation')
    .single()
  
  const donation = donationSettings?.value || {
    upi_id: 'sampige@upi',
    bank_details: 'Bank: XYZ, Account: 1234567890',
    donation_url: '#'
  }

  return (
    <main className="bg-black min-h-screen pt-20">
      <div className="container mx-auto px-4 max-w-4xl py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
          Support Our <span className="gradient-text">Mission</span>
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gold-500/10">
            <h2 className="text-xl font-semibold text-white mb-4">Donate via UPI</h2>
            <div className="bg-black rounded-lg p-4 text-center">
              <p className="text-gold-500 text-2xl font-bold">{donation.upi_id}</p>
              <p className="text-gray-400 text-sm mt-2">Scan or use this UPI ID</p>
            </div>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gold-500/10">
            <h2 className="text-xl font-semibold text-white mb-4">Bank Transfer</h2>
            <div className="bg-black rounded-lg p-4">
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{donation.bank_details}</p>
            </div>
          </div>
        </div>

        {donation.donation_url && donation.donation_url !== '#' && (
          <div className="mt-8 text-center">
            <a
              href={donation.donation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-gold-500 text-black font-bold rounded-full hover:bg-gold-600 transition-all hover:scale-105"
            >
              Donate Online
            </a>
          </div>
        )}
      </div>
    </main>
  )
}