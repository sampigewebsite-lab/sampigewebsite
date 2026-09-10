import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CsrSteps from '@/components/CsrSteps'
import CsrCoverImage from '@/components/CsrCoverImage'
import Link from 'next/link'
import { 
  ArrowLeft, ArrowRight, Users, Clock, Leaf, GraduationCap, Heart, 
  Sparkles, Star, Target
} from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const ICON_MAP: Record<string, any> = {
  Leaf, GraduationCap, Heart, Users, Sparkles, Star, Target
}

const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_SITE_URL || 'https://sampigewebsite.vercel.app'
  if (!url.startsWith('http://') && !url.startsWith('https://')) url = `https://${url}`
  return url.replace(/\/$/, '')
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: activity } = await supabase
    .from('csr_activities')
    .select('*, csr_pillars(name)')
    .eq('slug', slug)
    .single()

  if (!activity) return {}

  const siteUrl = getBaseUrl()
  return {
    title: `${activity.title} | CSR | Sampige Foundation`,
    description: activity.short_description || activity.description?.slice(0, 155),
    openGraph: {
      title: activity.title,
      description: activity.short_description || activity.description?.slice(0, 155),
      images: activity.cover_image ? [{ url: activity.cover_image }] : [],
      url: `${siteUrl}/csr/${slug}`,
    },
  }
}

export default async function CSRActivityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch activity details
  const { data: activity } = await supabase
    .from('csr_activities')
    .select('*, csr_pillars(*)')
    .eq('slug', slug)
    .single()

  if (!activity) notFound()

  // Fetch related activities from the same pillar
  const { data: related } = await supabase
    .from('csr_activities')
    .select('*')
    .eq('pillar_id', activity.pillar_id)
    .eq('published', true)
    .neq('id', activity.id)
    .limit(3)

  const steps: { title: string; description: string; image?: string }[] = activity.steps || []
  const metrics: { label: string; value: string; icon: string }[] = activity.metrics || []
  const gallery: string[] = Array.isArray(activity.gallery) ? activity.gallery : []

  return (
    <main className="bg-black text-white min-h-screen">
      {/* ── HEADER TITLE SECTION ── */}
      <section className="pt-28 pb-4 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/csr"
            className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 mb-6 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to CSR Programmes
          </Link>

          {/* Pillar Badge */}
          {activity.csr_pillars?.name && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-500 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                {activity.csr_pillars.name}
              </span>
            </div>
          )}

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
            {activity.title}
          </h1>

          {/* Short Description */}
          {activity.short_description && (
            <p className="text-[#B0B0B0] text-base md:text-xl max-w-3xl leading-relaxed mb-6">
              {activity.short_description}
            </p>
          )}

          {/* ANIMATED COVER PHOTO */}
          {activity.cover_image && (
            <CsrCoverImage 
              src={activity.cover_image} 
              alt={activity.title} 
              pillarName={activity.csr_pillars?.name} 
            />
          )}
        </div>
      </section>

      {/* ── CONTENT SECTION ── */}
      <section className="py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="bg-[#0A0A0A] p-6 md:p-8 rounded-2xl border border-gold-500/10 flex items-center gap-5 hover:border-gold-500/30 transition-colors">
              <Users className="w-12 h-12 text-gold-500 shrink-0" />
              <div>
                <div className="text-xs text-[#B0B0B0] uppercase font-bold tracking-wider">Recommended Team Size</div>
                <div className="text-xl md:text-2xl font-bold text-white mt-1">{activity.team_size}</div>
              </div>
            </div>
            <div className="bg-[#0A0A0A] p-6 md:p-8 rounded-2xl border border-gold-500/10 flex items-center gap-5 hover:border-gold-500/30 transition-colors">
              <Clock className="w-12 h-12 text-gold-500 shrink-0" />
              <div>
                <div className="text-xs text-[#B0B0B0] uppercase font-bold tracking-wider">Format Duration</div>
                <div className="text-xl md:text-2xl font-bold text-white mt-1">{activity.duration}</div>
              </div>
            </div>
          </div>

          {/* Overview & Sticky CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12 mb-20">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Programme Overview</h2>
              <p className="text-[#B0B0B0] text-base md:text-lg leading-relaxed whitespace-pre-line">
                {activity.description}
              </p>
            </div>

            {/* Sidebar Sticky CTA Block */}
            <div className="lg:col-span-1">
              <div className="bg-[#0A0A0A] rounded-3xl p-6 md:p-8 border border-gold-500/20 sticky top-24 space-y-6 shadow-xl">
                <h3 className="text-xl font-bold text-white">Plan This Engagement</h3>
                <p className="text-[#B0B0B0] text-sm leading-relaxed">
                  Interested in running the "{activity.title}" format for your corporate team? Request our planning file for dates and budgets.
                </p>
                <div className="space-y-3 pt-2">
                  <Link
                    href="/csr#enquiry"
                    className="w-full text-center bg-gold-500 hover:bg-gold-400 text-black font-extrabold py-4 rounded-xl block text-sm uppercase tracking-wider transition-all hover:scale-[1.02]"
                  >
                    Request Planning File
                  </Link>
                  <Link
                    href="/contact"
                    className="w-full text-center border border-gold-500/30 hover:bg-gold-500/10 text-gold-500 font-bold py-3.5 rounded-xl block text-sm transition-colors"
                  >
                    Contact CSR Desk
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* WHAT EMPLOYEES WILL DO (HOVER COMPONENT) */}
          {steps.length > 0 && (
            <div className="mb-20 pt-12 border-t border-gray-900">
              <div className="mb-8">
                <div className="text-gold-500 text-xs font-bold uppercase tracking-widest mb-2">Step-By-Step Process</div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">What Your Employees Will Do</h2>
              </div>
              <CsrSteps steps={steps} activityTitle={activity.title} />
            </div>
          )}

          {/* ═══ GALLERY (object-contain, supports 9:16 + 16:9 without cropping) ═══ */}
          {gallery.length > 0 && (
            <div className="mb-20 pt-12 border-t border-gray-900">
              <div className="mb-8">
                <div className="text-gold-500 text-xs font-bold uppercase tracking-widest mb-2">
                  Event Photos
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">Gallery</h2>
                <p className="text-[#B0B0B0] text-sm md:text-base mt-2">
                  Photos from this CSR activity.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full">
                {gallery.slice(0, 6).map((imgUrl, index) => (
                  <div
                    key={index}
                    className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-gold-500/15 bg-[#0A0A0A] group flex items-center justify-center"
                  >
                    <img
                      src={imgUrl}
                      alt={`${activity.title} gallery ${index + 1}`}
                      className="max-w-full max-h-full w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outcome / Measured Impact */}
          {(activity.outcome || metrics.length > 0) && (
            <div className="bg-[#0A0A0A] rounded-3xl p-8 md:p-12 border border-gold-500/10 mb-20">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Outcome & Social Returns</h2>
              <p className="text-[#B0B0B0] text-base md:text-lg leading-relaxed mb-8">{activity.outcome}</p>
              
              {metrics.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-gray-900">
                  {metrics.map((m, i) => {
                    const MetricIcon = ICON_MAP[m.icon] || Star
                    return (
                      <div key={i} className="flex items-center gap-4 bg-black p-4 rounded-2xl border border-gray-800">
                        <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0 border border-gold-500/20">
                          <MetricIcon className="w-6 h-6 text-gold-500" />
                        </div>
                        <div>
                          <div className="text-2xl md:text-3xl font-extrabold text-white leading-none mb-1">{m.value}</div>
                          <div className="text-xs text-[#B0B0B0] uppercase font-bold tracking-wider">{m.label}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Related Activities */}
          {related && related.length > 0 && (
            <div className="border-t border-gray-900 pt-16">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Other {activity.csr_pillars?.name} Activities</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/csr/${rel.slug}`}
                    className="bg-[#0A0A0A] rounded-2xl p-6 border border-gold-500/10 hover:border-gold-500/30 block transition-all group"
                  >
                    <h4 className="text-white font-bold text-lg mb-2 group-hover:text-gold-500 transition-colors">{rel.title}</h4>
                    <p className="text-[#B0B0B0] text-sm line-clamp-2 leading-relaxed mb-6">{rel.short_description || rel.description}</p>
                    <div className="text-gold-500 text-sm font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                      Explore Activity <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}