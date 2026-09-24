import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, Recycle, MapPin, Sparkles } from 'lucide-react'
import OptimizedImage from '@/components/OptimizedImage'

export const revalidate = 60

const getBaseUrl = () => process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://sampigefoundation.com'

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getBaseUrl()
  return {
    title: 'Our Services — Photo Frame Recycling, Flower Waste & More | Sampige Foundation',
    description:
      'Explore Sampige Foundation services in Malleshwaram, Bangalore — photo frame recycling, used flower composting, temple waste management, and community eco programmes.',
    alternates: { canonical: `${siteUrl}/services` },
    openGraph: {
      title: 'Our Services | Sampige Foundation',
      description:
        'Photo frame recycling, flower waste composting, and eco services in Malleshwaram, Bangalore.',
      url: `${siteUrl}/services`,
      locale: 'en_IN',
      type: 'website',
    },
  }
}

export default async function ServicesIndexPage() {
  const supabase = await createClient()

  const { data: seoServices } = await supabase
    .from('seo_services')
    .select('slug, hero_heading, hero_subtext, hero_badge, hero_image, meta_title, meta_description, related_project_slug')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const services: any[] = [...(seoServices || [])]

  // Filter out any duplicate flower entries and put the flagship Pooja to Prakruthi card FIRST
  const filteredServices = services.filter(
    (s) => s.slug !== 'pooja-to-prakruthi-bangalore' && s.slug !== 'used-flower-recycling-bangalore'
  )

  // Card #1: Pooja to Prakruthi Flagship Service
  filteredServices.unshift({
    slug: 'pooja-to-prakruthi',
    targetUrl: '/pooja-to-prakruthi',
    hero_heading: 'Pooja to Prakruthi — Used Flower Waste Collection & Composting',
    hero_subtext:
      'Every flower deserves a second life. Flower waste collection, segregation, and natural composting for households, apartments, temples, and events.',
    hero_badge: 'POOJA TO PRAKRUTHI',
    hero_image: '',
    meta_title: 'Pooja to Prakruthi Flower Recycling Bangalore',
  })

  return (
    <main className="bg-black min-h-screen">
      {/* Hero Banner */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden border-b border-[#FFB300]/10">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0A] to-[#0A1500]" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#FFB300]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Recycle className="text-[#FFB300] h-5 w-5" />
              <span className="text-[#FFB300] font-semibold tracking-[0.15em] text-xs uppercase">
                Community Eco Services
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-4">
              Our <span className="text-[#FFB300]">Services</span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl">
              Community-led recycling and eco programmes across Malleshwaram and Bangalore —
              used flower composting, photo frame recycling, divine items disposal, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((svc) => {
              const cardLink = svc.targetUrl || `/services/${svc.slug}`
              return (
                <Link
                  key={svc.slug}
                  href={cardLink}
                  className="group bg-[#1A1A1A] rounded-2xl overflow-hidden border border-[#FFB300]/10 hover:border-[#FFB300]/40 transition-all flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="h-52 bg-[#0A0A0A] relative overflow-hidden">
                      {svc.hero_image ? (
                        <OptimizedImage
                          src={svc.hero_image}
                          alt={svc.hero_heading || svc.meta_title}
                          fill
                          supabaseWidth={600}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] to-[#1A1A00]">
                          <Recycle className="h-12 w-12 text-[#FFB300]/30" />
                        </div>
                      )}
                      {svc.hero_badge && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-black/85 border border-[#FFB300]/30 text-[#FFB300] text-[10px] font-bold uppercase tracking-wider rounded-full z-10 shadow-md">
                          {svc.hero_badge}
                        </span>
                      )}
                    </div>

                    <div className="p-6">
                      <h2 className="text-lg md:text-xl font-bold text-white group-hover:text-[#FFB300] transition-colors mb-3 leading-snug">
                        {svc.hero_heading || svc.meta_title}
                      </h2>
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                        {svc.hero_subtext || svc.meta_description || 'Learn more about this community service in Bangalore.'}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-[#FFB300]/10 mt-auto">
                    <span className="text-[#FFB300] font-semibold text-sm inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                      Learn More <ArrowRight className="h-4 w-4" />
                    </span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#FFB300]" /> Bangalore
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="text-center mt-14">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3.5 bg-[#FFB300] text-black font-bold rounded-full hover:bg-[#FFCA28] transition-all text-sm uppercase tracking-wide shadow-lg shadow-[#FFB300]/20"
            >
              Get Office Drop-Off Details <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}