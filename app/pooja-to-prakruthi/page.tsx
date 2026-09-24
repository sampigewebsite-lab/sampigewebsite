import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import OptimizedImage from '@/components/OptimizedImage'
import PoojaEnquiryForm from '@/components/PoojaEnquiryForm'
import {
  ArrowRight, Leaf, Recycle, TreePine,
  CheckCircle2, XCircle, Home, Building2, Calendar,
  Sparkles, Package, Truck, BarChart3, Share2, Search
} from 'lucide-react'

export const revalidate = 60
const getBaseUrl = () => process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://sampigefoundation.com'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const { data: content } = await supabase.from('pooja_to_prakruthi_content').select('*').eq('id', 1).single()
  return {
    title: content?.meta_title || 'Pooja to Prakruthi | Sampige Foundation',
    description: content?.meta_description || '',
    alternates: { canonical: `${getBaseUrl()}/pooja-to-prakruthi` },
  }
}

// Universal Benefits applied to all plans
const UNIVERSAL_BENEFITS = [
  'Dedicated flower collection',
  'Segregation of plastics & wires',
  '100% Natural Composting',
  'Zero waste to landfill',
  'Monthly impact tracking'
]

export default async function PoojaToPrakruthiPage() {
  const supabase = await createClient()
  const { data: content } = await supabase.from('pooja_to_prakruthi_content').select('*').eq('id', 1).single()

  if (!content) return <div className="p-20 text-center text-white">Loading...</div>

  const acceptedItems = content.accepted_items || []
  const notAcceptedItems = content.not_accepted_items || []
  const faqs = content.faqs || []
  const realPhotos = content.real_work_images || []

  return (
    <main className="bg-black min-h-screen">
      
      {/* ═══════════════════════════════════════════════════════════
          1. HERO
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden pt-20 pb-16 md:py-28">
        <div className="absolute inset-0 bg-black z-0" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FFB300]/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            <div className="lg:col-span-7 max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-gray-800 bg-[#141414]">
                <Sparkles className="text-[#FFB300] h-3.5 w-3.5" />
                <span className="text-gray-300 font-semibold tracking-widest text-[10px] md:text-xs uppercase">
                  SAMPIGE FOUNDATION INITIATIVE
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-6">
                A Flower Offered With Devotion{' '}
                <span className="bg-gradient-to-r from-[#FFB300] to-[#FF7A00] bg-clip-text text-transparent">
                  Shouldn&apos;t End Up in the Garbage.
                </span>
              </h1>

              <div className="border-l-4 border-[#FFB300] pl-5 md:pl-6 mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Pooja to Prakruthi</h2>
                <p className="text-[#FFB300] font-semibold italic text-base md:text-lg mb-4">Every flower deserves a second life.</p>
                <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-lg">
                  Every day, flowers are offered to God with devotion. But once the pooja is over, many of these flowers are simply mixed with everyday garbage.
                  <br/><br/>
                  <strong className="text-white">Pooja to Prakruthi gives those flowers a better journey.</strong>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Link href="#join-form" className="inline-flex items-center justify-center px-6 md:px-8 py-4 bg-[#FFB300] text-black font-extrabold rounded-xl hover:bg-[#FFCA28] transition-all shadow-lg shadow-[#FFB300]/20 uppercase text-xs tracking-wider text-center">
                  Give Your Flowers a Second Life <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative mt-8 lg:mt-0">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-gray-800 bg-[#0A0A0A] shadow-2xl">
                {content.hero_side_image ? (
                  <OptimizedImage src={content.hero_side_image} alt="Pooja flowers being collected" fill supabaseWidth={800} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#111] to-black">
                    <span className="text-6xl mb-4">🌸</span>
                    <p className="text-gray-500 text-sm">Upload real photograph via Admin.</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. THE PROBLEM
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-[#050505] border-t border-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              What Happens to the Flowers{' '}
              <span className="text-gray-500">After Your Pooja?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {[
              { icon: '🌸', title: 'Offered With Devotion', desc: 'Flowers are offered with faith.' },
              { icon: '🪷', title: 'Pooja Ends', desc: 'Flowers are removed from the altar.' },
              { icon: '🗑️', title: 'Into the Waste', desc: 'Mixed with everyday garbage.' },
              { icon: '⚠️', title: 'Journey Ends', desc: 'Polluting landfills or lakes.' },
            ].map((step, i) => (
              <div key={i} className="bg-[#0A0A0A] border border-gray-800 rounded-3xl overflow-hidden text-center p-6">
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. THE SOLUTION
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white max-w-4xl mx-auto mb-8 leading-tight">
            A Flower Offered With Faith Deserves Better Than a Garbage Bin.
          </h2>
          
          <div className="max-w-4xl mx-auto bg-gradient-to-b from-[#1A1500] to-[#0A0A0A] p-8 md:p-16 rounded-[40px] border border-[#FFB300]/20 text-center relative mt-16">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-6">
              We Believe Your Flowers Deserve a Better Journey.
            </h2>
            <div className="inline-block bg-black px-6 py-2 rounded-full border border-gray-800 mb-8">
              <span className="text-[#FFB300] font-bold tracking-wider text-xs md:text-sm">POOJA TO PRAKRUTHI</span>
            </div>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              Sampige Foundation created Pooja to Prakruthi to help keep used pooja flowers separate from mixed waste. We collect, segregate and process the organic material through natural composting.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. WHAT CAN I GIVE?
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#050505] border-t border-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Please Keep These Separate</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#0A100A] rounded-3xl p-6 md:p-8 border border-green-900/30">
              <h3 className="text-xl md:text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 shrink-0" /> YES — Accepted
              </h3>
              <ul className="space-y-4">
                {acceptedItems.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 text-sm md:text-base">
                    <span className="text-green-500 mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#1A0505] rounded-3xl p-6 md:p-8 border border-red-900/30">
              <h3 className="text-xl md:text-2xl font-bold text-red-400 mb-6 flex items-center gap-2">
                <XCircle className="w-6 h-6 shrink-0" /> NO — Don't Mix
              </h3>
              <ul className="space-y-4">
                {notAcceptedItems.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 text-sm md:text-base">
                    <span className="text-red-500 mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. HOW CAN YOU PARTICIPATE? (UNIFORM CARDS & RESPONSIVE)
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-black border-t border-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How Can You Be Part of This?</h2>
            <p className="text-gray-400 text-base md:text-lg">Select the plan that fits your needs. All plans include our complete process.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            
            {/* HOUSEHOLD */}
            <div className="bg-[#111] rounded-[30px] p-6 md:p-10 border border-[#FFB300]/30 hover:border-[#FFB300] transition-all flex flex-col group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#FFB300]/10 flex items-center justify-center text-[#FFB300] border border-[#FFB300]/30 shrink-0">
                  <Home className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white">Household</h3>
              </div>
              
              <div className="text-4xl md:text-5xl font-black text-white mb-1">
                ₹300 <span className="text-base text-gray-500 font-normal">/ month</span>
              </div>
              <p className="text-[#FFB300] text-sm font-semibold mb-6">Up to 30 kg per month</p>
              
              <ul className="space-y-3 mb-8 flex-1">
                {UNIVERSAL_BENEFITS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-[#FFB300] shrink-0" /> 
                    <span className="mt-0.5">{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="#join-form" className="flex items-center justify-center gap-2 w-full bg-[#FFB300] text-black font-extrabold py-4 px-4 rounded-xl hover:bg-[#FFCA28] transition-all text-xs md:text-sm uppercase tracking-wider text-center">
                <span>Join as Household</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* APARTMENT */}
            <div className="bg-[#111] rounded-[30px] p-6 md:p-10 border border-gray-800 hover:border-[#FFB300] transition-all flex flex-col group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center text-white border border-gray-700 shrink-0 group-hover:text-[#FFB300] group-hover:bg-[#FFB300]/10 group-hover:border-[#FFB300]/30">
                  <Building2 className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white">Apartment</h3>
              </div>
              
              <div className="text-4xl md:text-5xl font-black text-white mb-1">
                ₹100 <span className="text-base text-gray-500 font-normal">/ flat / month</span>
              </div>
              <p className="text-[#FFB300] text-sm font-semibold mb-6 opacity-0 group-hover:opacity-100 transition-opacity">Community Collection Bins</p>
              
              <ul className="space-y-3 mb-8 flex-1">
                {UNIVERSAL_BENEFITS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-gray-600 group-hover:text-[#FFB300] transition-colors shrink-0" /> 
                    <span className="mt-0.5">{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="#join-form" className="flex items-center justify-center gap-2 w-full bg-[#222] text-white font-extrabold py-4 px-4 rounded-xl hover:bg-[#FFB300] hover:text-black transition-all text-xs md:text-sm uppercase tracking-wider text-center border border-gray-700 group-hover:border-[#FFB300]">
                <span>Start Apartment Program</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* EVENT */}
            <div className="bg-[#111] rounded-[30px] p-6 md:p-10 border border-gray-800 hover:border-[#FFB300] transition-all flex flex-col group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center text-white border border-gray-700 shrink-0 group-hover:text-[#FFB300] group-hover:bg-[#FFB300]/10 group-hover:border-[#FFB300]/30">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white">Events</h3>
              </div>
              
              <div className="text-4xl md:text-5xl font-black text-white mb-1">
                ₹200 <span className="text-base text-gray-500 font-normal">up to 10 kg</span>
              </div>
              <p className="text-[#FFB300] text-sm font-semibold mb-6">₹5/kg above 10 kg</p>
              
              <ul className="space-y-3 mb-8 flex-1">
                {UNIVERSAL_BENEFITS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-gray-600 group-hover:text-[#FFB300] transition-colors shrink-0" /> 
                    <span className="mt-0.5">{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="#join-form" className="flex items-center justify-center gap-2 w-full bg-[#222] text-white font-extrabold py-4 px-4 rounded-xl hover:bg-[#FFB300] hover:text-black transition-all text-xs md:text-sm uppercase tracking-wider text-center border border-gray-700 group-hover:border-[#FFB300]">
                <span>Book Event Collection</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* TEMPLE */}
            <div className="bg-[#111] rounded-[30px] p-6 md:p-10 border border-gray-800 hover:border-[#FFB300] transition-all flex flex-col group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center text-white border border-gray-700 shrink-0 group-hover:text-[#FFB300] group-hover:bg-[#FFB300]/10 group-hover:border-[#FFB300]/30">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white">Temple</h3>
              </div>
              
              <div className="text-4xl md:text-5xl font-black text-white mb-1">
                Custom
              </div>
              <p className="text-[#FFB300] text-sm font-semibold mb-6">Partnership model</p>
              
              <ul className="space-y-3 mb-8 flex-1">
                {UNIVERSAL_BENEFITS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-gray-600 group-hover:text-[#FFB300] transition-colors shrink-0" /> 
                    <span className="mt-0.5">{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="#join-form" className="flex items-center justify-center gap-2 w-full bg-[#222] text-white font-extrabold py-4 px-4 rounded-xl hover:bg-[#FFB300] hover:text-black transition-all text-xs md:text-sm uppercase tracking-wider text-center border border-gray-700 group-hover:border-[#FFB300]">
                <span>Partner With Sampige</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. TRACK YOUR IMPACT SECTION (NEW)
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#050505] border-t border-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-gradient-to-b from-[#141414] to-black rounded-3xl p-8 md:p-12 border border-[#FFB300]/20 text-center shadow-xl">
            <div className="w-16 h-16 bg-[#FFB300]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-[#FFB300]" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Track Your Household Impact</h2>
            <p className="text-gray-400 text-sm md:text-base mb-8">
              Already a member? Enter your registered phone number to see how much flower waste you have personally saved from landfills.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="tel" 
                placeholder="Enter 10-digit mobile number" 
                className="flex-1 bg-black border border-gray-800 rounded-xl px-5 py-4 text-white focus:border-[#FFB300] outline-none text-center sm:text-left"
              />
              <button 
                type="button" 
                className="bg-[#FFB300] text-black font-extrabold px-6 py-4 rounded-xl hover:bg-[#FFCA28] transition-colors whitespace-nowrap uppercase text-sm tracking-wider"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Impact tracking backend will be connected soon! Your data is safe.");
                }}
              >
                Check Impact
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. NEW ENQUIRY FORM
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-black border-t border-gray-900 relative">
        <div className="container mx-auto px-4 relative z-10">
          <PoojaEnquiryForm />
        </div>
      </section>

    </main>
  )
}