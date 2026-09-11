import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  ArrowRight,
  Recycle,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  TreePine,
  Heart,
  Shield,
  Truck,
  Layers,
  Sparkles,
  Users,
  ChevronDown,
  Mail,
  Building2,
  HandHeart,
  Leaf,
  Droplets,
  Sun,
  Star,
  Target,
  Zap,
  ExternalLink,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  return 'https://sampigewebsite.vercel.app'
}

const ICON_MAP: Record<string, any> = {
  Recycle, MapPin, Phone, Clock, CheckCircle2, TreePine, Heart,
  Shield, Truck, Layers, Sparkles, Users, Mail, Building2,
  HandHeart, Leaf, Droplets, Sun, Star, Target, Zap,
}

const getIcon = (name: string) => ICON_MAP[name] || Sparkles

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const siteUrl = getBaseUrl()
  const supabase = await createClient()

  const { data: page } = await supabase
    .from('seo_services')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!page) return {}

  const keywordsArray = typeof page.meta_keywords === 'string'
    ? page.meta_keywords.split(',').map((k: string) => k.trim())
    : page.meta_keywords || []

  return {
    title: page.meta_title,
    description: page.meta_description || '',
    keywords: keywordsArray,
    alternates: { canonical: `${siteUrl}/services/${slug}` },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      title: page.meta_title,
      description: page.meta_description || '',
      url: `${siteUrl}/services/${slug}`,
      siteName: 'Sampige Foundation',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.meta_title,
      description: page.meta_description || '',
    },
  }
}

export default async function DynamicSeoServicePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const siteUrl = getBaseUrl()
  const supabase = await createClient()

  const { data: page, error } = await supabase
    .from('seo_services')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!page || error) notFound()

  let orgName = 'Sampige Foundation'
  let orgAddress = 'Malleshwaram, Bangalore, Karnataka, India'
  let orgPhone = '+91 1234567890'
  let orgEmail = 'info@sampige.org'

  try {
    const { data: orgData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'organization')
      .single()

    if (orgData?.value) {
      orgName = orgData.value.name || orgName
      orgAddress = orgData.value.address || orgAddress
      orgPhone = orgData.value.phone || orgPhone
      orgEmail = orgData.value.email || orgEmail
    }
  } catch (e) {}

  const faqs = page.faqs || []
  const stripItems = page.hero_strip_items || []
  const splitItems = page.split_list_items || []
  const gridItems = page.grid_items || []
  const serviceAreas = page.service_areas || ['Malleshwaram', 'Rajajinagar', 'Yeshwanthpur', 'Sadashivanagar', 'Bangalore']

  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f: any) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  } : null

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.hero_heading || page.meta_title,
    provider: {
      '@type': 'NGO',
      name: orgName,
      url: siteUrl,
      address: {
        '@type': 'PostalAddress',
        streetAddress: orgAddress,
        addressLocality: 'Bangalore',
        addressRegion: 'Karnataka',
        addressCountry: 'IN',
      },
      telephone: orgPhone,
      email: orgEmail,
    },
    areaServed: { '@type': 'City', name: 'Bangalore' },
    description: page.meta_description || '',
    serviceType: 'Recycling',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      description: 'Free NGO service',
    },
  }

  return (
    <main className="bg-black min-h-screen">
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

      {/* ===== HERO SECTION (Left Text, Right Image) ===== */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0A] to-[#0D1500]" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-6">
              {page.hero_badge && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/30 rounded-full text-gold-500 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" /> {page.hero_badge}
                </div>
              )}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1]">
                {page.hero_heading}
              </h1>
              {page.hero_subtext && (
                <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-2xl">
                  {page.hero_subtext}
                </p>
              )}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href={page.hero_cta_1_link || '/contact'}
                  className="inline-flex items-center px-8 py-4 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-400 transition-all hover:scale-[1.02] shadow-lg shadow-gold-500/20 uppercase text-xs tracking-wider"
                >
                  {page.hero_cta_1_label || 'Contact Us'} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                {page.hero_cta_2_label && (
                  <Link
                    href={page.hero_cta_2_link || '#features'}
                    className="inline-flex items-center px-8 py-4 bg-transparent text-white font-semibold rounded-xl border border-white/30 hover:bg-white/10 transition-all text-xs tracking-wider gap-2 uppercase"
                  >
                    {page.hero_cta_2_label}
                  </Link>
                )}
              </div>
            </div>

            {/* Right Column Curved Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-gold-500/20 shadow-2xl bg-[#1A1A1A]">
                {page.hero_image ? (
                  <img src={page.hero_image} alt={page.hero_heading} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gradient-to-tr from-black to-[#111]">
                    <Sparkles className="w-12 h-12 text-gold-500/40" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HERO OVERLAPPING FEATURE STRIP (4 CARDS) ===== */}
      {stripItems.length > 0 && (
        <section className="relative -mt-12 z-20 container mx-auto px-4">
          <div className="bg-[#141414] border border-gold-500/20 rounded-2xl p-6 md:p-8 shadow-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stripItems.map((item: any, idx: number) => {
              const Icon = getIcon(item.icon)
              return (
                <div key={idx} className="flex items-start gap-4 p-2">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ===== SPLIT SECTION ("Grow Together" Layout) ===== */}
      <section id="features" className="py-24 bg-[#0A0A0A] border-t border-gold-500/10 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left text & list */}
            <div className="lg:col-span-6 space-y-6">
              {page.split_badge && (
                <div className="text-gold-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-px bg-gold-500" /> {page.split_badge}
                </div>
              )}
              {page.split_heading && (
                <h2 className="text-3xl md:text-4xl font-bold text-white">{page.split_heading}</h2>
              )}
              {page.split_subtext && (
                <p className="text-gray-400 text-base leading-relaxed">{page.split_subtext}</p>
              )}

              {splitItems.length > 0 && (
                <div className="space-y-4 pt-4">
                  {splitItems.map((item: any, idx: number) => {
                    const Icon = getIcon(item.icon)
                    return (
                      <div key={idx} className="flex gap-4 items-start bg-[#141414] p-4 rounded-xl border border-gold-500/10">
                        <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-gold-500" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-sm">{item.title}</h4>
                          <p className="text-gray-400 text-xs mt-1">{item.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right Image + Floating Overlay Card */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-gold-500/20 bg-[#1A1A1A]">
                {page.split_image ? (
                  <img src={page.split_image} alt={page.split_heading || 'Service'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#141414]" />
                )}
              </div>

              {page.split_floating_title && (
                <div className="md:absolute -bottom-8 -left-8 bg-[#141414] border border-gold-500/30 p-6 rounded-2xl shadow-2xl max-w-sm mt-6 md:mt-0 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-gold-500" />
                  </div>
                  <h4 className="text-white font-bold text-base">{page.split_floating_title}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">{page.split_floating_text}</p>
                  {page.split_floating_link && (
                    <Link href={page.split_floating_link} className="inline-flex items-center text-xs font-bold text-gold-500 hover:underline pt-2">
                      Get Started <ArrowRight className="ml-1 w-3 h-3" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== GRID SECTION ("What We Offer") ===== */}
      {gridItems.length > 0 && (
        <section className="py-24 bg-black border-t border-gold-500/10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              {page.grid_badge && (
                <span className="text-gold-500 text-xs font-bold uppercase tracking-widest block mb-2">{page.grid_badge}</span>
              )}
              {page.grid_heading && (
                <h2 className="text-3xl md:text-5xl font-bold text-white">{page.grid_heading}</h2>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {gridItems.map((card: any, idx: number) => {
                const Icon = getIcon(card.icon)
                return (
                  <div key={idx} className="bg-[#141414] rounded-2xl border border-gold-500/10 overflow-hidden hover:border-gold-500/30 transition-all group flex flex-col justify-between">
                    <div>
                      {/* Image container */}
                      <div className="h-48 bg-black relative overflow-hidden">
                        {card.image ? (
                          <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center text-gray-700">📸</div>
                        )}
                        {/* Overlapping icon badge */}
                        <div className="absolute -bottom-5 left-6 w-12 h-12 bg-black border border-gold-500/30 rounded-xl flex items-center justify-center shadow-lg">
                          <Icon className="w-6 h-6 text-gold-500" />
                        </div>
                      </div>

                      <div className="p-6 pt-8">
                        <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                        <p className="text-gray-400 text-xs leading-relaxed mb-4">{card.text}</p>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      <Link href={card.link || '/contact'} className="inline-flex items-center text-xs font-bold text-gold-500 hover:underline">
                        Learn More <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== OPTION B: RELATED PROJECT SPOTLIGHT CARD ===== */}
      {page.related_project_slug && (
        <section className="py-12 bg-[#050505] border-t border-gold-500/15">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#141414] p-8 md:p-10 rounded-3xl border border-gold-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group hover:border-gold-500/50 transition-all">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="space-y-2 relative z-10 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/30 rounded-full text-gold-500 text-xs font-bold uppercase tracking-wider mb-1">
                  <Target className="w-3.5 h-3.5" /> Official NGO Initiative
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                  {page.project_card_heading || 'Explore Our Full Project'}
                </h3>
                <p className="text-gray-400 text-sm max-w-2xl">
                  {page.project_card_text || 'Discover how our field teams and community partners execute documented social and environmental impacts across Bangalore.'}
                </p>
              </div>
              <Link
                href={`/projects/${page.related_project_slug}`}
                className="inline-flex items-center gap-2 bg-gold-500 text-black px-7 py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider hover:bg-gold-400 hover:scale-105 transition-all shrink-0 relative z-10 shadow-lg shadow-gold-500/20"
              >
                View Full Project <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== SERVICE AREAS ===== */}
      <section className="py-20 bg-[#0A0A0A] border-t border-gold-500/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Service <span className="text-gold-500">Coverage Areas</span>
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {serviceAreas.map((area: string, index: number) => (
              <span
                key={area}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  index === 0
                    ? 'bg-gold-500/20 text-gold-500 border-gold-500/40'
                    : 'bg-[#141414] text-gray-300 border-gold-500/10'
                }`}
              >
                {index === 0 && '📍 '}
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DIRECT NGO DIRECTORY CONTACT INFO ===== */}
      <section className="py-12 bg-black border-t border-gold-500/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-[#111] p-8 rounded-2xl border border-gold-500/15">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <MapPin className="text-gold-500 h-5 w-5" /> Direct NGO Information
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-gray-500 uppercase tracking-widest text-xs font-semibold">Address</span>
                <p className="text-gray-200">{orgAddress}</p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 uppercase tracking-widest text-xs font-semibold">Phone</span>
                <p className="text-gray-200">
                  <a href={`tel:${orgPhone}`} className="hover:text-gold-500 transition-colors">{orgPhone}</a>
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 uppercase tracking-widest text-xs font-semibold">Email</span>
                <p className="text-gray-200">
                  <a href={`mailto:${orgEmail}`} className="hover:text-gold-500 transition-colors">{orgEmail}</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      {faqs.length > 0 && (
        <section className="py-20 bg-[#0A0A0A] border-t border-gold-500/10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked <span className="text-gold-500">Questions</span>
              </h2>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq: any, index: number) => (
                <details
                  key={index}
                  className="group bg-[#141414] rounded-xl border border-gold-500/10 hover:border-gold-500/25 transition-colors overflow-hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer p-5 md:p-6 list-none">
                    <h3 className="text-white font-semibold text-sm md:text-base pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown className="h-5 w-5 text-gold-500 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-5 md:px-6 pb-5 md:pb-6">
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}