import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, Recycle, MapPin, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  return 'https://sampigewebsite.vercel.app'
}

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getBaseUrl()
  return {
    title: 'Our Services — Photo Frame Recycling, Waste Management & More | Sampige Foundation',
    description:
      'Explore Sampige Foundation services in Malleshwaram, Bangalore — photo frame recycling, divine items disposal, temple waste management, e-waste collection, and community eco programmes.',
    alternates: { canonical: `${siteUrl}/services` },
    openGraph: {
      title: 'Our Services | Sampige Foundation',
      description:
        'Photo frame recycling, waste management, and eco services in Malleshwaram, Bangalore.',
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
  if (!services.some((s) => s.slug === 'photo-frame-recycling-bangalore')) {
    services.unshift({
      slug: 'photo-frame-recycling-bangalore',
      hero_heading: 'Photo Frame Recycling in Malleshwaram, Bangalore',
      hero_subtext:
        'Drop off old photo frames and divine items. Wooden, metal, plastic, glass & god frames — zero landfill.',
      hero_badge: 'Eco-Friendly Recycling Service',
      hero_image: '',
      meta_title: 'Photo Frame Recycling Bangalore',
      related_project_slug: 'divine-items-photo-frame-disposal',
    })
  }

  return (
    <main className="bg-black min-h-screen">
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden border-b border-gold-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0A] to-[#0A1500]" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Recycle className="text-gold-500 h-5 w-5" />
              <span className="text-gold-500 font-semibold tracking-[0.15em] text-xs uppercase">
                Community Eco Services
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-4">
              Our <span className="text-gold-500">Services</span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl">
              Community-led recycling and eco programmes across Malleshwaram and Bangalore —
              photo frames, divine items, temple waste, and more.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          {services.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Sparkles className="h-10 w-10 mx-auto mb-4 text-gold-500/40" />
              <p>Services will appear here once published from the admin panel.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc) => (
                <Link
                  key={svc.slug}
                  href={`/services/${svc.slug}`}
                  className="group bg-[#1A1A1A] rounded-2xl overflow-hidden border border-gold-500/10 hover:border-gold-500/30 transition-all flex flex-col"
                >
                  <div className="h-48 bg-[#0A0A0A] relative overflow-hidden">
                    {svc.hero_image ? (
                      <img
                        src={svc.hero_image}
                        alt={svc.hero_heading || svc.meta_title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] to-[#1A1A00]">
                        <Recycle className="h-12 w-12 text-gold-500/30" />
                      </div>
                    )}
                    {svc.hero_badge && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-black/80 border border-gold-500/30 text-gold-500 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        {svc.hero_badge}
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-xl font-bold text-white group-hover:text-gold-500 transition-colors mb-2 line-clamp-2">
                      {svc.hero_heading || svc.meta_title}
                    </h2>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                      {svc.hero_subtext || svc.meta_description || 'Learn more about this community service.'}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-gold-500/10">
                      <span className="text-gold-500 font-semibold text-sm inline-flex items-center gap-1">
                        Learn More <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                      {svc.related_project_slug && (
                        <span className="text-[10px] text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> Project linked
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3 bg-gold-500 text-black font-bold rounded-full hover:bg-gold-400 transition-all text-sm uppercase tracking-wide"
            >
              Get Office Drop-Off Details <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}