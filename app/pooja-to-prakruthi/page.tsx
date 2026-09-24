import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PoojaEnquiryForm from '@/components/PoojaEnquiryForm'
import PoojaImpactTracker from '@/components/PoojaImpactTracker'
import {
  ArrowRight, Leaf, Recycle,
  CheckCircle2, XCircle, Home, Building2, Calendar,
  Sparkles, Search, Heart, Flower2, Trash2, AlertTriangle
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

// Helper to reliably optimize Supabase storage URLs
function getImageUrl(url?: string, width = 800): string {
  if (!url) return ''
  if (url.includes('supabase.co/storage/')) {
    const cleanUrl = url.split('?')[0]
    return `${cleanUrl}?width=${width}&quality=80`
  }
  return url
}

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

  if (!content) return <div className="p-12 text-center text-white">Loading...</div>

  const acceptedItems = content.accepted_items || []
  const notAcceptedItems = content.not_accepted_items || []
  const faqs = content.faqs || []
  const realPhotos: string[] = content.real_work_images || []

  // "What Happens" cards — photo + floating icon badge style
  const problemSteps = [
    {
      title: 'Offered With Devotion',
      desc: 'Flowers are offered during pooja with faith, devotion and love.',
      image: getImageUrl(content.problem_scene_1_image, 500),
      Icon: Flower2,
      emoji: '🌸',
    },
    {
      title: 'Pooja Ends',
      desc: 'The flowers have completed their purpose and are removed from the altar.',
      image: getImageUrl(content.problem_scene_2_image, 500),
      Icon: Heart,
      emoji: '🪷',
    },
    {
      title: 'Into the Waste',
      desc: 'Too often, used flowers are mixed with everyday garbage.',
      image: getImageUrl(content.problem_scene_3_image, 500),
      Icon: Trash2,
      emoji: '🗑️',
    },
    {
      title: 'Journey Ends',
      desc: 'Flowers that could return to the earth now pollute landfills or lakes.',
      image: getImageUrl(content.problem_scene_4_image || content.reality_wrong_image, 500),
      Icon: AlertTriangle,
      emoji: '⚠️',
    },
  ]

  return (
    <main className="bg-black min-h-screen text-gray-200">

      {/* ═══════════════════════════════════════════
          1. HERO (Tight Padding)
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center overflow-hidden pt-24 pb-10 md:pt-28 md:pb-12">
        <div className="absolute inset-0 bg-black z-0" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFB300]/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-center">

            {/* Left text */}
            <div className="lg:col-span-7 max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-3 px-3.5 py-1 rounded-full border border-gray-800 bg-[#141414]">
                <Sparkles className="text-[#FFB300] h-3.5 w-3.5" />
                <span className="text-gray-300 font-semibold tracking-widest text-[10px] md:text-xs uppercase">
                  SAMPIGE FOUNDATION INITIATIVE
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-5">
                A Flower Offered With Devotion{' '}
                <span className="bg-gradient-to-r from-[#FFB300] to-[#FF7A00] bg-clip-text text-transparent">
                  Shouldn&apos;t End Up in the Garbage.
                </span>
              </h1>

              <div className="border-l-4 border-[#FFB300] pl-4 md:pl-5 mb-6">
                <h2 className="text-lg md:text-xl font-bold text-white mb-1">Pooja to Prakruthi</h2>
                <p className="text-[#FFB300] font-semibold italic text-sm md:text-base mb-3">
                  Every flower deserves a second life.
                </p>
                <p className="text-xs sm:text-sm md:text-base text-gray-400 leading-relaxed max-w-lg">
                  Every day, flowers are offered to God with devotion. But once the pooja is over,
                  many of these flowers are simply mixed with everyday garbage.
                  <br /><br />
                  <strong className="text-white">Pooja to Prakruthi gives those flowers a better journey.</strong>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="#join-form"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-[#FFB300] text-black font-extrabold rounded-xl hover:bg-[#FFCA28] transition-all shadow-lg shadow-[#FFB300]/20 uppercase text-xs tracking-wider text-center"
                >
                  Give Your Flowers a Second Life
                  <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                </Link>
              </div>
            </div>

            {/* Right hero image */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-gray-800 bg-[#0A0A0A] shadow-2xl">
                {content.hero_side_image ? (
                  <img
                    src={getImageUrl(content.hero_side_image, 800)}
                    alt="Pooja flowers"
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#111] to-black">
                    <span className="text-5xl mb-3">🌸</span>
                    <p className="text-gray-500 text-xs">Upload Hero Side Photo via Admin</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          2. WHAT HAPPENS (Compact py-10 md:py-14)
          ═══════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-[#050505] border-t border-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2">
              What Happens to the Flowers{' '}
              <span className="text-gray-500">After Your Pooja?</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-xs md:text-sm">
              A simple journey that most of us never stop to think about.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {problemSteps.map((step, i) => {
              const Icon = step.Icon
              return (
                <div
                  key={i}
                  className="bg-[#141414] rounded-2xl border border-[#FFB300]/10 hover:border-[#FFB300]/30 transition-all group flex flex-col overflow-visible"
                >
                  {/* Photo container */}
                  <div className="relative h-44 bg-black rounded-t-2xl overflow-hidden">
                    {step.image ? (
                      <img
                        src={step.image}
                        alt={step.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] to-[#1A1A00] text-4xl">
                        {step.emoji}
                      </div>
                    )}
                  </div>

                  {/* Floating icon badge */}
                  <div className="relative -mt-5 ml-4 w-10 h-10 bg-black border border-[#FFB300]/40 rounded-xl flex items-center justify-center shadow-xl z-10">
                    <Icon className="w-4 h-4 text-[#FFB300]" />
                  </div>

                  {/* Text */}
                  <div className="p-4 pt-2 flex flex-col flex-1">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                      Step 0{i + 1}
                    </div>
                    <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-[#FFB300] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed flex-1">
                      {step.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. THE SOLUTION (Compact py-10 md:py-14)
          ═══════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white max-w-4xl mx-auto leading-tight">
              A Flower Offered With Faith Deserves Better Than a Garbage Bin.
            </h2>
          </div>

          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
            {/* Left image */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-[#FFB300]/20 bg-[#0A0A0A] shadow-2xl">
              {content.solution_image ? (
                <img
                  src={getImageUrl(content.solution_image, 800)}
                  alt="Sampige composting solution"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <span className="text-4xl mb-2">🌱</span>
                  <p className="text-gray-500 text-xs">Upload Solution Photo via Admin</p>
                </div>
              )}
            </div>

            {/* Right copy */}
            <div className="bg-gradient-to-b from-[#1A1500] to-[#0A0A0A] p-6 md:p-8 rounded-3xl border border-[#FFB300]/20">
              <div className="inline-block bg-black px-4 py-1 rounded-full border border-gray-800 mb-4">
                <span className="text-[#FFB300] font-bold tracking-wider text-[11px]">POOJA TO PRAKRUTHI</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                We Believe Your Flowers Deserve a Better Journey.
              </h3>
              <p className="text-gray-300 text-xs md:text-sm leading-relaxed mb-5">
                Sampige Foundation created Pooja to Prakruthi to help households, apartments,
                temples and events keep used pooja flowers separate from mixed waste.
                We collect, segregate and process the organic material through natural composting.
              </p>
              <p className="text-white font-semibold text-sm md:text-base">
                Your devotion doesn&apos;t end with the pooja.
                <br />
                <span className="text-[#FFB300]">It can continue by giving the flowers a second life.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. WHAT CAN I GIVE? (Compact py-10 md:py-14)
          ═══════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-[#050505] border-t border-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-4xl font-bold text-white">Please Keep These Separate</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* YES */}
            <div className="bg-[#0A100A] rounded-3xl overflow-hidden border border-green-900/30">
              {content.accepted_image && (
                <div className="relative h-40 bg-black">
                  <img
                    src={getImageUrl(content.accepted_image, 600)}
                    alt="Accepted flowers"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" /> YES — Accepted
                </h3>
                <ul className="space-y-2.5">
                  {acceptedItems.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-gray-300 text-xs md:text-sm">
                      <span className="text-green-500 mt-0.5">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* NO */}
            <div className="bg-[#1A0505] rounded-3xl overflow-hidden border border-red-900/30">
              {content.not_accepted_image && (
                <div className="relative h-40 bg-black">
                  <img
                    src={getImageUrl(content.not_accepted_image, 600)}
                    alt="Not accepted materials"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 shrink-0" /> NO — Don&apos;t Mix
                </h3>
                <ul className="space-y-2.5">
                  {notAcceptedItems.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-gray-300 text-xs md:text-sm">
                      <span className="text-red-500 mt-0.5">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. REAL WORK GALLERY (Bulletproof <img> loading)
          ═══════════════════════════════════════════ */}
      {realPhotos.length > 0 && (
        <section className="py-10 md:py-14 bg-black border-t border-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">
                This Is What We Do With Your Flowers
              </h2>
              <p className="text-gray-400 text-xs md:text-sm">Real photographs from Sampige collections and composting.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto">
              {realPhotos.map((rawUrl, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-[#FFB300]/10 bg-[#0A0A0A] group">
                  <img
                    src={getImageUrl(rawUrl, 500)}
                    alt={`Sampige flower recycling ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          6. PARTICIPATION CARDS (Compact py-10 md:py-14)
          ═══════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-[#050505] border-t border-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3">How Can You Be Part of This?</h2>
            <p className="text-gray-400 text-xs md:text-sm">All plans include our complete collection-to-compost process.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* HOUSEHOLD */}
            <div className="bg-[#111] rounded-3xl p-6 md:p-8 border border-[#FFB300]/30 hover:border-[#FFB300] transition-all flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FFB300]/10 flex items-center justify-center text-[#FFB300] border border-[#FFB300]/30 shrink-0">
                  <Home className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Household</h3>
              </div>
              <div className="text-3xl md:text-4xl font-black text-white mb-1">
                ₹300 <span className="text-sm text-gray-500 font-normal">/ month</span>
              </div>
              <p className="text-[#FFB300] text-xs font-semibold mb-5">Up to 30 kg per month</p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {UNIVERSAL_BENEFITS.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-[#FFB300] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="#join-form" className="flex items-center justify-center gap-2 w-full bg-[#FFB300] text-black font-extrabold py-3.5 px-4 rounded-xl hover:bg-[#FFCA28] transition-all text-xs uppercase tracking-wider">
                Join as Household <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* APARTMENT */}
            <div className="bg-[#111] rounded-3xl p-6 md:p-8 border border-gray-800 hover:border-[#FFB300] transition-all flex flex-col group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white border border-gray-700 shrink-0 group-hover:text-[#FFB300] group-hover:bg-[#FFB300]/10">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Apartment</h3>
              </div>
              <div className="text-3xl md:text-4xl font-black text-white mb-1">
                ₹100 <span className="text-sm text-gray-500 font-normal">/ flat / month</span>
              </div>
              <p className="text-[#FFB300] text-xs font-semibold mb-5">Community bins included</p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {UNIVERSAL_BENEFITS.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-gray-600 group-hover:text-[#FFB300] transition-colors shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="#join-form" className="flex items-center justify-center gap-2 w-full bg-[#222] text-white font-extrabold py-3.5 px-4 rounded-xl hover:bg-[#FFB300] hover:text-black transition-all text-xs uppercase tracking-wider border border-gray-700 group-hover:border-[#FFB300]">
                Start Apartment Program <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* EVENT */}
            <div className="bg-[#111] rounded-3xl p-6 md:p-8 border border-gray-800 hover:border-[#FFB300] transition-all flex flex-col group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white border border-gray-700 shrink-0 group-hover:text-[#FFB300] group-hover:bg-[#FFB300]/10">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Events</h3>
              </div>
              <div className="text-3xl md:text-4xl font-black text-white mb-1">
                ₹200 <span className="text-sm text-gray-500 font-normal">up to 10 kg</span>
              </div>
              <p className="text-[#FFB300] text-xs font-semibold mb-5">₹5/kg above 10 kg</p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {UNIVERSAL_BENEFITS.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-gray-600 group-hover:text-[#FFB300] transition-colors shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="#join-form" className="flex items-center justify-center gap-2 w-full bg-[#222] text-white font-extrabold py-3.5 px-4 rounded-xl hover:bg-[#FFB300] hover:text-black transition-all text-xs uppercase tracking-wider border border-gray-700 group-hover:border-[#FFB300]">
                Book Event Collection <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* TEMPLE */}
            <div className="bg-[#111] rounded-3xl p-6 md:p-8 border border-gray-800 hover:border-[#FFB300] transition-all flex flex-col group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white border border-gray-700 shrink-0 group-hover:text-[#FFB300] group-hover:bg-[#FFB300]/10">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Temple</h3>
              </div>
              <div className="text-3xl md:text-4xl font-black text-white mb-1">Custom</div>
              <p className="text-[#FFB300] text-xs font-semibold mb-5">Partnership model</p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {UNIVERSAL_BENEFITS.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-gray-600 group-hover:text-[#FFB300] transition-colors shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="#join-form" className="flex items-center justify-center gap-2 w-full bg-[#222] text-white font-extrabold py-3.5 px-4 rounded-xl hover:bg-[#FFB300] hover:text-black transition-all text-xs uppercase tracking-wider border border-gray-700 group-hover:border-[#FFB300]">
                Partner With Sampige <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          7. TRACK IMPACT (Compact py-10 md:py-14)
          ═══════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-black border-t border-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-gradient-to-b from-[#141414] to-black rounded-3xl p-6 md:p-10 border border-[#FFB300]/20 text-center shadow-xl">
            <div className="w-12 h-12 bg-[#FFB300]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-[#FFB300]" />
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-white mb-2">Track Your Household Impact</h2>
            <p className="text-gray-400 text-xs md:text-sm mb-6">
              Already a member? Enter your registered phone number to see how much flower waste you saved.
            </p>
            <PoojaImpactTracker />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          8. ENQUIRY FORM (Compact py-10 md:py-14)
          ═══════════════════════════════════════════ */}
      <section id="join-form" className="py-10 md:py-14 bg-[#050505] border-t border-gray-900">
        <div className="container mx-auto px-4">
          <PoojaEnquiryForm />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          9. FAQ (Compact py-10 md:py-14)
          ═══════════════════════════════════════════ */}
      {faqs.length > 0 && (
        <section className="py-10 md:py-14 bg-black border-t border-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-4xl font-bold text-white">
                Frequently Asked <span className="text-[#FFB300]">Questions</span>
              </h2>
            </div>
            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq: any, i: number) => (
                <details
                  key={i}
                  className="group bg-[#141414] rounded-xl border border-[#FFB300]/10 hover:border-[#FFB300]/25 transition-colors overflow-hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer p-4 md:p-5 list-none">
                    <h3 className="text-white font-semibold text-xs md:text-sm pr-4">{faq.q}</h3>
                  </summary>
                  <div className="px-4 md:px-5 pb-4 md:pb-5">
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          10. FINAL CTA (Compact py-14 md:py-20)
          ═══════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-black border-t border-gray-900 text-center">
        <div className="container mx-auto px-4">
          <p className="text-4xl mb-4">🌸</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-2">Your Pooja Ends.</h2>
          <h2 className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#FFB300] to-[#FF7A00] bg-clip-text text-transparent mb-6">
            Their Journey Doesn&apos;t Have To.
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8 text-xs md:text-sm">
            Keep them separate. Give them to Sampige. Because every flower deserves a second life.
          </p>
          <Link
            href="#join-form"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FFB300] text-black font-extrabold rounded-xl hover:bg-[#FFCA28] transition-all uppercase text-xs tracking-wider shadow-lg shadow-[#FFB300]/20"
          >
            Give Your Flowers a Second Life <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </main>
  )
}