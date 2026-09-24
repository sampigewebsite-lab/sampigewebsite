import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import OptimizedImage from '@/components/OptimizedImage'
import PoojaEnquiryForm from '@/components/PoojaEnquiryForm'
import {
  ArrowRight, Leaf, Recycle, TreePine,
  CheckCircle2, XCircle, Home, Building2, Calendar,
  Sparkles, Package, Truck, BarChart3, Share2
} from 'lucide-react'

// Fast ISR Caching (updates every 60s)
export const revalidate = 60

const getBaseUrl = () => process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://sampigefoundation.com'

// DEFAULT FALLBACK CONTENT (Guarantees the page ALWAYS loads instantly)
const DEFAULT_CONTENT = {
  hero_eyebrow: 'SAMPIGE FOUNDATION INITIATIVE',
  hero_title_line1: 'Used Flower Waste',
  hero_title_line2: 'Collection & Composting',
  hero_programme_name: 'Pooja to Prakruthi',
  hero_tagline: 'Every flower deserves a second life.',
  hero_description: 'Your pooja flowers don\'t have to end up in mixed waste. Sampige collects, segregates and composts suitable flower waste through the Pooja to Prakruthi initiative.',
  hero_cta_1_label: 'Give Your Flowers a Second Life',
  hero_cta_1_link: '#membership',
  hero_cta_2_label: 'Become a Green Member',
  hero_cta_2_link: '#membership',
  hero_image: null,

  options_heading: 'How Would You Like to Participate?',
  options_subheading: 'Choose the option that fits your home, community or event.',

  household_title: 'Household',
  household_desc: 'Give your household\'s used pooja flowers a second life.',
  household_price: '₹300',
  household_price_unit: '/month',
  household_note: 'Up to 30 kg per month',
  household_cta_label: 'Join as a Household',

  apartment_title: 'Apartment',
  apartment_desc: 'Create a dedicated flower-waste collection system for your community.',
  apartment_price: '₹100',
  apartment_price_unit: '/flat/month',
  apartment_note: 'Per participating flat',
  apartment_cta_label: 'Start Apartment Programme',

  temple_title: 'Temple',
  temple_desc: 'Create a dedicated flower collection and reporting system for your temple.',
  temple_price: 'Partnership',
  temple_price_unit: '',
  temple_note: 'Custom programme',
  temple_cta_label: 'Partner With Sampige',

  event_title: 'Event',
  event_desc: 'Responsible flower recovery for poojas, weddings, festivals and events.',
  event_price: '₹200',
  event_price_unit: '',
  event_note: 'Up to 10 kg · ₹5/kg above',
  event_cta_label: 'Book Event Collection',

  problem_heading: 'Where Do Your Pooja Flowers Go After the Pooja?',
  problem_solution_heading: 'What if your flowers could have a second life?',
  problem_solution_text: 'Sampige created Pooja to Prakruthi to collect, segregate and compost suitable flower waste. Instead of ending up in mixed garbage or polluting Bangalore\'s lakes, your flowers return to the earth as rich organic compost.',

  accepted_items: ['Pooja flowers (marigold, jasmine, rose, tulsi, hibiscus)', 'Natural garlands', 'Leaves used in pooja', 'Natural flower decorations', 'Temple flower offerings', 'Wedding & festival flower waste'],
  not_accepted_items: ['Plastic & plastic covers', 'Thermocol', 'Glitter & decorative plastic', 'Metal wires', 'Rubber bands', 'Synthetic ribbons', 'Food waste'],

  faqs: [
    { q: 'What is Pooja to Prakruthi?', a: 'Pooja to Prakruthi is a Sampige Foundation initiative that collects used pooja flowers from households, apartments, temples and events in Bangalore, segregates them from non-organic waste, and composts the organic material into nutrient-rich fertiliser.' },
    { q: 'What happens to the flowers after Sampige collects them?', a: 'Flowers go through 5 steps: Collection, Segregation (removing plastic and wires), Shredding & Sun-drying, Natural Composting (45–60 days with cow dung and neem cake), and finally the compost is used in gardens and farms across Bangalore.' },
    { q: 'What flowers can I give?', a: 'We accept all natural pooja flowers — marigold, jasmine, rose, tulsi, hibiscus, natural garlands, leaves used in pooja, and natural flower decorations from weddings and festivals.' },
    { q: 'How much is Sampige Green Membership?', a: 'Household membership is ₹300 per month, which includes up to 30 kg of flower waste collection, segregation, composting, responsible processing and monthly impact updates.' },
    { q: 'How can my apartment join?', a: 'Apartment associations can contact Sampige Foundation to set up a dedicated flower waste collection system. Cost is ₹100 per month per participating flat, including collection bins, scheduled pickups, segregation, composting and monthly reports.' },
    { q: 'Do you collect flowers from events?', a: 'Yes! We collect flower waste from weddings, poojas, festivals, housewarmings, corporate events and cultural programmes. Pricing is ₹200 for up to 10 kg, and ₹5 per kg above 10 kg.' },
    { q: 'Where should I bring my flowers?', a: 'Drop off used flowers at the Sampige Foundation office at 18th Cross, Malleshwaram, Bengaluru 560003. Office hours: Monday to Saturday, 9 AM to 6 PM. For apartment and temple members, we collect from your premises.' }
  ]
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Used Flower Waste Collection & Composting in Bangalore | Pooja to Prakruthi — Sampige Foundation',
    description: 'Every flower deserves a second life. Sampige collects, segregates and composts used pooja flowers in Bangalore.',
    alternates: { canonical: `${getBaseUrl()}/pooja-to-prakruthi` },
  }
}

export default async function PoojaToPrakruthiPage() {
  const supabase = await createClient()
  
  // Try fetching content from Supabase
  let dbContent = null
  try {
    const { data } = await supabase.from('pooja_to_prakruthi_content').select('*').eq('id', 1).single()
    dbContent = data
  } catch (e) {
    // Database fallback
  }

  // Merge database content with fallback default content
  const content = dbContent || DEFAULT_CONTENT

  const acceptedItems = content.accepted_items || DEFAULT_CONTENT.accepted_items
  const notAcceptedItems = content.not_accepted_items || DEFAULT_CONTENT.not_accepted_items
  const faqs = content.faqs || DEFAULT_CONTENT.faqs

  return (
    <main className="bg-black min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] md:min-h-screen flex items-center overflow-hidden pt-20 pb-16 md:py-28">
        {content.hero_image ? (
          <OptimizedImage src={content.hero_image} alt="Hero" fill priority className="absolute inset-0 w-full h-full object-cover z-0" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0A] to-[#0A1500] z-0" />
        )}
        <div className="absolute inset-0 bg-black/70 z-[1]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Sparkles className="text-[#FFB300] h-4 w-4 shrink-0" />
              <span className="text-[#FFB300] font-semibold tracking-[0.2em] text-[10px] md:text-xs uppercase">
                {content.hero_eyebrow}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-3 md:mb-4">
              {content.hero_title_line1}{' '}
              <span className="bg-gradient-to-r from-[#FFB300] to-[#FF7A00] bg-clip-text text-transparent">
                {content.hero_title_line2}
              </span>
            </h1>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white/90 mb-4 md:mb-6">
              {content.hero_programme_name}
            </h2>

            <p className="text-xl md:text-2xl text-[#FFB300] font-semibold mb-4 md:mb-6 italic">
              &ldquo;{content.hero_tagline}&rdquo;
            </p>

            <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-8 md:mb-10 max-w-3xl leading-relaxed">
              {content.hero_description}
            </p>

            <div className="flex flex-wrap gap-3 md:gap-4">
              <Link href="#join-form" className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-[#FFB300] text-black font-bold rounded-lg hover:bg-[#FFCA28] transition-all hover:scale-[1.02] shadow-lg shadow-[#FFB300]/20 uppercase text-xs md:text-sm tracking-wide">
                {content.hero_cta_1_label} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="#join-form" className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-transparent text-white font-semibold rounded-lg border border-white/40 hover:bg-white/10 transition-all uppercase text-xs md:text-sm tracking-wide gap-2">
                {content.hero_cta_2_label} <Leaf className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 PARTICIPATION OPTIONS */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-black to-[#0A0A0A] border-t border-[#FFB300]/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{content.options_heading}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{content.options_subheading}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Household */}
            <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-[#FFB300]/10 hover:border-[#FFB300]/40 transition-all flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-[#FFB300]/10 flex items-center justify-center mb-5 border border-[#FFB300]/20">
                <Home className="w-7 h-7 text-[#FFB300]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{content.household_title}</h3>
              <p className="text-gray-400 text-sm mb-4 flex-1">{content.household_desc}</p>
              <div className="text-3xl font-extrabold text-[#FFB300] mb-1">
                {content.household_price}<span className="text-sm text-gray-400 font-normal">{content.household_price_unit}</span>
              </div>
              <p className="text-xs text-gray-500 mb-6">{content.household_note}</p>
              <Link href="#join-form" className="block w-full text-center bg-[#FFB300] text-black font-bold py-3 rounded-xl hover:bg-[#FFCA28] transition-all text-sm uppercase tracking-wider">
                {content.household_cta_label}
              </Link>
            </div>

            {/* Apartment */}
            <div className="bg-gradient-to-b from-[#1A1500] to-[#1A1A1A] rounded-2xl p-6 md:p-8 border-2 border-[#FFB300]/40 hover:border-[#FFB300]/70 transition-all flex flex-col relative shadow-lg shadow-[#FFB300]/5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFB300] text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
              <div className="w-14 h-14 rounded-2xl bg-[#FFB300]/10 flex items-center justify-center mb-5 border border-[#FFB300]/20">
                <Building2 className="w-7 h-7 text-[#FFB300]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{content.apartment_title}</h3>
              <p className="text-gray-400 text-sm mb-4 flex-1">{content.apartment_desc}</p>
              <div className="text-3xl font-extrabold text-[#FFB300] mb-1">
                {content.apartment_price}<span className="text-sm text-gray-400 font-normal">{content.apartment_price_unit}</span>
              </div>
              <p className="text-xs text-gray-500 mb-6">{content.apartment_note}</p>
              <Link href="#join-form" className="block w-full text-center bg-[#FFB300] text-black font-bold py-3 rounded-xl hover:bg-[#FFCA28] transition-all text-sm uppercase tracking-wider">
                {content.apartment_cta_label}
              </Link>
            </div>

            {/* Temple */}
            <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-[#FFB300]/10 hover:border-[#FFB300]/40 transition-all flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-[#FFB300]/10 flex items-center justify-center mb-5 border border-[#FFB300]/20">
                <Sparkles className="w-7 h-7 text-[#FFB300]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{content.temple_title}</h3>
              <p className="text-gray-400 text-sm mb-4 flex-1">{content.temple_desc}</p>
              <div className="text-xl font-extrabold text-[#FFB300] mb-1">{content.temple_price}</div>
              <p className="text-xs text-gray-500 mb-6">{content.temple_note}</p>
              <Link href="#join-form" className="block w-full text-center border border-[#FFB300]/40 text-[#FFB300] font-bold py-3 rounded-xl hover:bg-[#FFB300]/10 transition-all text-sm uppercase tracking-wider">
                {content.temple_cta_label}
              </Link>
            </div>

            {/* Event */}
            <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-[#FFB300]/10 hover:border-[#FFB300]/40 transition-all flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-[#FFB300]/10 flex items-center justify-center mb-5 border border-[#FFB300]/20">
                <Calendar className="w-7 h-7 text-[#FFB300]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{content.event_title}</h3>
              <p className="text-gray-400 text-sm mb-4 flex-1">{content.event_desc}</p>
              <div className="text-3xl font-extrabold text-[#FFB300] mb-1">{content.event_price}</div>
              <p className="text-xs text-gray-500 mb-6">{content.event_note}</p>
              <Link href="#join-form" className="block w-full text-center border border-[#FFB300]/40 text-[#FFB300] font-bold py-3 rounded-xl hover:bg-[#FFB300]/10 transition-all text-sm uppercase tracking-wider">
                {content.event_cta_label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="py-16 md:py-24 bg-[#0A0A0A] border-t border-[#FFB300]/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{content.problem_heading}</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto mb-12 md:mb-16">
            {[
              { icon: '🌸', title: 'Pooja', desc: 'Beautiful flowers offered.', color: 'border-green-500/30' },
              { icon: '🗑️', title: 'After Pooja', desc: 'Flowers are removed.', color: 'border-yellow-500/30' },
              { icon: '⚠️', title: 'Mixed Waste', desc: 'Mixed with regular garbage.', color: 'border-red-500/30' },
              { icon: '💔', title: 'Lost Potential', desc: 'Composting is wasted.', color: 'border-red-500/30' },
            ].map((step, i) => (
              <div key={i} className={`bg-[#141414] rounded-2xl p-5 md:p-6 border ${step.color} text-center`}>
                <div className="text-4xl md:text-5xl mb-3">{step.icon}</div>
                <h3 className="text-white font-bold text-sm md:text-base mb-2">{step.title}</h3>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#141414] p-8 md:p-12 rounded-3xl border border-[#FFB300]/20">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{content.problem_solution_heading}</h3>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed">{content.problem_solution_text}</p>
          </div>
        </div>
      </section>

      {/* WHAT CAN YOU GIVE */}
      <section className="py-16 md:py-24 bg-black border-t border-[#FFB300]/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">What Can Go Into the Flower Collection?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-[#141414] rounded-2xl p-6 md:p-8 border border-green-500/20">
              <h3 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" /> Yes — Accepted
              </h3>
              <ul className="space-y-3">
                {acceptedItems.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#141414] rounded-2xl p-6 md:p-8 border border-red-500/20">
              <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
                <XCircle className="w-6 h-6" /> No — Please Don&apos;t Mix
              </h3>
              <ul className="space-y-3">
                {notAcceptedItems.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ENQUIRY FORM SECTION */}
      <section className="py-16 md:py-24 bg-[#0A0A0A] border-t border-[#FFB300]/10">
        <div className="container mx-auto px-4">
          <PoojaEnquiryForm />
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 md:py-24 bg-black border-t border-[#FFB300]/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked <span className="text-[#FFB300]">Questions</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq: any, i: number) => (
              <details key={i} className="group bg-[#141414] rounded-xl border border-[#FFB300]/10 hover:border-[#FFB300]/25 transition-colors overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer p-5 md:p-6 list-none">
                  <h3 className="text-white font-semibold text-sm md:text-base pr-4">{faq.q}</h3>
                </summary>
                <div className="px-5 md:px-6 pb-5 md:pb-6">
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}