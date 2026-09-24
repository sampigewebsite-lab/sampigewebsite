import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import OptimizedImage from '@/components/OptimizedImage'
import PoojaEnquiryForm from '@/components/PoojaEnquiryForm'
import {
  ArrowRight, Leaf, Recycle, TreePine, Droplets, Sun,
  CheckCircle2, XCircle, Home, Building2, Calendar,
  Sparkles, Heart, Users, ChevronDown, MapPin, Phone,
  Mail, Star, HandHeart, Sprout, Package, Truck, BarChart3, Share2
} from 'lucide-react'

// Fetch fresh data instantly
export const revalidate = 60

const getBaseUrl = () => process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://sampigefoundation.com'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const { data: content } = await supabase.from('pooja_to_prakruthi_content').select('*').eq('id', 1).single()

  return {
    title: content?.meta_title || 'Pooja to Prakruthi | Sampige Foundation',
    description: content?.meta_description || '',
    keywords: content?.meta_keywords || '',
    alternates: { canonical: `${getBaseUrl()}/pooja-to-prakruthi` },
    openGraph: {
      title: content?.meta_title || 'Pooja to Prakruthi',
      description: content?.meta_description || '',
      url: `${getBaseUrl()}/pooja-to-prakruthi`,
      images: content?.hero_image ? [{ url: content.hero_image }] : [],
    },
  }
}

export default async function PoojaToPrakruthiPage() {
  const supabase = await createClient()
  const { data: content } = await supabase.from('pooja_to_prakruthi_content').select('*').eq('id', 1).single()

  if (!content) return <div className="p-20 text-center text-white">Loading database...</div>

  // Safety parses for JSON arrays
  const processSteps = content.process_steps || []
  const acceptedItems = content.accepted_items || []
  const notAcceptedItems = content.not_accepted_items || []
  const membershipBenefits = content.membership_benefits || []
  const eventTypes = content.event_types || []
  const templeFeatures = content.temple_features || []
  const impactStats = content.impact_stats || []
  const whyReasons = content.why_reasons || []
  const faqs = content.faqs || []
  const galleryImages = content.gallery_images || []

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f: any) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <main className="bg-black min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden pt-20 pb-16 md:py-28">
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
              <Link href={content.hero_cta_1_link} className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-[#FFB300] text-black font-bold rounded-lg hover:bg-[#FFCA28] transition-all hover:scale-[1.02] shadow-lg shadow-[#FFB300]/20 uppercase text-xs md:text-sm tracking-wide">
                {content.hero_cta_1_label} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href={content.hero_cta_2_link} className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-transparent text-white font-semibold rounded-lg border border-white/40 hover:bg-white/10 transition-all uppercase text-xs md:text-sm tracking-wide gap-2">
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
              { icon: '🌸', title: 'Pooja', desc: 'Beautiful flowers are offered.', color: 'border-green-500/30' },
              { icon: '🗑️', title: 'After Pooja', desc: 'Flowers are removed.', color: 'border-yellow-500/30' },
              { icon: '⚠️', title: 'Mixed Waste', desc: 'Mixed with regular garbage.', color: 'border-red-500/30' },
              { icon: '💔', title: 'Lost Potential', desc: 'Organic compost is wasted.', color: 'border-red-500/30' },
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

      {/* ENQUIRY FORM SECTION */}
      <section className="py-16 md:py-24 bg-black border-t border-[#FFB300]/10">
        <div className="container mx-auto px-4">
          <PoojaEnquiryForm />
        </div>
      </section>

    </main>
  )
}