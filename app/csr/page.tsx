import React from 'react'
import { createClient } from '@/lib/supabase/server'
import PageHero from '@/components/PageHero'
import { getPageHero, heroToStats } from '@/lib/getPageHero'
import LogoMarquee from '@/components/LogoMarquee'
import CsrEnquiryForm from '@/components/CsrEnquiryForm'
import Link from 'next/link'
import { 
  Leaf, GraduationCap, Heart, Users, Sparkles, Star, 
  ArrowRight, ShieldCheck, FileSpreadsheet, Image, BarChart3, Receipt
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const ICON_MAP: Record<string, any> = {
  Leaf, GraduationCap, Heart, Users, Sparkles, Star
}

// Visual layout mappings for individual stages
const STAGES = [
  { num: '01', title: 'Consultation', desc: 'We understand your organisation\'s objectives, headcount, CSR focus areas and reporting goals.' },
  { num: '02', title: 'Needs Assessment', desc: 'We assess potential sites and communities to ensure the activity addresses a genuine need.' },
  { num: '03', title: 'Proposal & Costing', desc: 'We provide a clear proposal covering the activity, location, volunteer requirements, and costing.' },
  { num: '04', title: 'Preparation & Briefing', desc: 'Employees register for activities and receive a briefing covering site safety and conduct.' },
  { num: '05', title: 'Execution', desc: 'Our field team manages materials, permits, local coordination and execution while employees participate.' },
  { num: '06', title: 'Documentation', desc: 'Following the activity, we provide complete compliance documentation covering outcomes.' }
]

export default async function CSRPage({ searchParams }: { searchParams: Promise<{ q?: string; pillar?: string }> }) {
  const resolvedParams = await searchParams
  const query = resolvedParams.q || ''
  const selectedPillarSlug = resolvedParams.pillar || 'all'

  const supabase = await createClient()

  // 1. Fetch site settings configuration for CSR
  const { data: settingsRow } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'csr_page')
    .single()
  const pageContent = settingsRow?.value || {}

  // 2. Fetch page hero
  const hero = await getPageHero('csr')

  // 3. Fetch Pillars
  const { data: pillars } = await supabase
    .from('csr_pillars')
    .select('*')
    .order('display_order', { ascending: true })

  // 4. Fetch Activities with conditions
  let activitiesQuery = supabase.from('csr_activities').select('*, csr_pillars(*)').eq('published', true)
  const { data: allActivities } = await activitiesQuery.order('display_order', { ascending: true })

  // 5. Apply filters in memory for robust handling
  let filteredActivities = allActivities || []
  if (selectedPillarSlug !== 'all') {
    filteredActivities = filteredActivities.filter(a => a.csr_pillars?.slug === selectedPillarSlug)
  }
  if (query.trim() !== '') {
    const qLower = query.toLowerCase()
    filteredActivities = filteredActivities.filter(
      a => a.title.toLowerCase().includes(qLower) || a.short_description.toLowerCase().includes(qLower)
    )
  }

  // 6. Fetch Partners
  const { data: partners } = await supabase
    .from('csr_partners')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (
    <>
      <PageHero
        badge={pageContent.hero_badge || hero?.badge || 'CSR & EMPLOYEE ENGAGEMENT'}
        title={pageContent.hero_title || hero?.title || 'Create Meaningful Impact With Your Team'}
        description={pageContent.hero_subtitle || hero?.description || 'Sampige Foundation works with corporates to deliver hands-on, high-impact employee engagement initiatives across Bengaluru.'}
        backgroundImage={pageContent.hero_image || hero?.background_image}
        stats={heroToStats(hero)}
      />

      {/* Pillars Section */}
      <section className="bg-black py-20 border-b border-gold-500/10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Five Ways To Create Impact</h2>
            <p className="text-[#B0B0B0] max-w-2xl mx-auto">
              Our CSR programmes are designed around five areas of meaningful employee engagement, aligning corporate responsibility with real community needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pillars?.map((p) => {
              const PillarIcon = ICON_MAP[p.icon_name] || Star
              return (
                <div key={p.id} className="bg-[#0A0A0A] rounded-2xl p-8 border border-gold-500/10 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center mb-6 border border-gold-500/20">
                      <PillarIcon className="w-6 h-6 text-gold-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{p.name}</h3>
                    <p className="text-[#B0B0B0] text-sm leading-relaxed mb-6">{p.description}</p>
                  </div>
                  <Link
                    href={`/csr?pillar=${p.slug}#formats`}
                    className="inline-flex items-center gap-2 text-gold-500 text-sm font-semibold hover:gap-3 transition-all"
                  >
                    Explore Programmes <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* All Activities Section with Live Client Filters */}
      <section id="formats" className="bg-[#0A0A0A] py-20 border-b border-gold-500/10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">22 Ways To Engage Your Team</h2>
            <p className="text-[#B0B0B0] max-w-2xl mx-auto">
              Select any of our pre-structured formats to view implementation step details, outcomes, and metrics.
            </p>
          </div>

          {/* Interactive Search & Filter Controls */}
          <div className="mb-12 space-y-4">
            <form method="GET" action="/csr#formats" className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search CSR activities (e.g. seed ball, government school)..."
                className="flex-1 bg-black text-white border border-gray-800 rounded-full px-6 py-3.5 text-sm focus:border-gold-500 outline-none"
              />
              <input type="hidden" name="pillar" value={selectedPillarSlug} />
              <button type="submit" className="bg-gold-500 text-black font-bold px-8 py-3.5 rounded-full text-sm hover:scale-105 transition-transform shrink-0">
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2 overflow-x-auto pb-2">
              <Link
                href={`/csr?q=${query}&pillar=all#formats`}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                  selectedPillarSlug === 'all'
                    ? 'bg-gold-500 text-black border-gold-500'
                    : 'bg-black text-[#B0B0B0] border-gray-800 hover:text-white'
                }`}
              >
                All Formats
              </Link>
              {pillars?.map((p) => (
                <Link
                  key={p.id}
                  href={`/csr?q=${query}&pillar=${p.slug}#formats`}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                    selectedPillarSlug === p.slug
                      ? 'bg-gold-500 text-black border-gold-500'
                      : 'bg-black text-[#B0B0B0] border-gray-800 hover:text-white'
                  }`}
                >
                  {p.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Formats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="bg-[#111111] rounded-2xl border border-gold-500/10 overflow-hidden hover:border-gold-500/30 transition-all flex flex-col justify-between group">
                <div className="p-6">
                  <div className="text-gold-500 text-xs font-bold uppercase tracking-wider mb-2">
                    {activity.csr_pillars?.name}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-gold-500 transition-colors">
                    {activity.title}
                  </h3>
                  <p className="text-[#B0B0B0] text-sm leading-relaxed mb-4 line-clamp-3">
                    {activity.short_description || activity.description}
                  </p>
                  <div className="space-y-1.5 pt-4 border-t border-gray-900 text-xs text-[#B0B0B0]">
                    <div className="flex justify-between">
                      <span>Team Size:</span>
                      <span className="font-semibold text-white">{activity.team_size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-semibold text-white">{activity.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-2">
                  <Link
                    href={`/csr/${activity.slug}`}
                    className="w-full text-center bg-black hover:bg-gold-500 hover:text-black border border-gold-500/20 hover:border-gold-500 text-gold-500 text-xs font-bold py-3 rounded-xl block transition-all"
                  >
                    View Activity Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#B0B0B0] text-sm">No engagement activities match your search. Try resetting filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works - Visual Timeline */}
      <section className="bg-black py-20 border-b border-gold-500/10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How Corporate Employee Engagement Works</h2>
            <p className="text-[#B0B0B0] max-w-2xl mx-auto">
              Our structured process ensures seamless logistics, absolute corporate compliance, and verified social outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {STAGES.map((s) => (
              <div key={s.num} className="bg-[#0A0A0A] rounded-2xl p-6 border border-gray-800">
                <div className="text-3xl font-extrabold text-gold-500/20 mb-4">{s.num}</div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-[#B0B0B0] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer Experience */}
      <section className="bg-[#0A0A0A] py-20 border-b border-gold-500/10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">From Registration To Recognition</h2>
            <p className="text-[#B0B0B0] max-w-2xl mx-auto">
              We design every single workflow to make execution a stress-free experience for your HR teams and participants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#111111] rounded-2xl p-8 border border-gold-500/10 text-center">
              <div className="text-gold-500 text-xs font-bold uppercase tracking-widest mb-4">Before The Activity</div>
              <h3 className="text-xl font-bold text-white mb-3">Preparation & Training</h3>
              <p className="text-[#B0B0B0] text-sm leading-relaxed">
                Seamless digital sign-ups, introductory videos, safety documents, and customized briefs tailored for your company.
              </p>
            </div>
            <div className="bg-[#111111] rounded-2xl p-8 border border-gold-500/10 text-center">
              <div className="text-gold-500 text-xs font-bold uppercase tracking-widest mb-4">During The Activity</div>
              <h3 className="text-xl font-bold text-white mb-3">On-Site Supervision</h3>
              <p className="text-[#B0B0B0] text-sm leading-relaxed">
                Our field specialists handle site coordination, municipal permissions, equipment setups, and safety procedures.
              </p>
            </div>
            <div className="bg-[#111111] rounded-2xl p-8 border border-gold-500/10 text-center">
              <div className="text-gold-500 text-xs font-bold uppercase tracking-widest mb-4">After The Activity</div>
              <h3 className="text-xl font-bold text-white mb-3">Recognition & Reports</h3>
              <p className="text-[#B0B0B0] text-sm leading-relaxed">
                Appreciation certificates, verified social indicators, raw photos, and audited expense reports for compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency / Auditing Section */}
      <section className="bg-black py-20 border-b border-gold-500/10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Transparency As A Standard</h2>
              <p className="text-[#B0B0B0] text-sm md:text-base leading-relaxed mb-6">
                Every corporate collaboration is tracked and closed with professional-grade reporting. We provide robust audit trails to support ESG metrics, annual corporate filings, and internal CSR presentations.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-gold-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Regulatory Compliance</h4>
                    <p className="text-[#B0B0B0] text-xs mt-1">Complete financial tracking, official receipts, and 80G tax benefit certification.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-gold-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Impact Audits</h4>
                    <p className="text-[#B0B0B0] text-xs mt-1">Quantifiable deliverables matching your specific CSR targets.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800">
                <BarChart3 className="w-8 h-8 text-gold-500 mb-4" />
                <h4 className="text-white font-bold text-sm mb-2">Narrative & Metrics</h4>
                <p className="text-[#B0B0B0] text-xs">A comprehensive execution record detailing overall community change indicators.</p>
              </div>
              <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800">
                <Image className="w-8 h-8 text-gold-500 mb-4" />
                <h4 className="text-white font-bold text-sm mb-2">Audited Media</h4>
                <p className="text-[#B0B0B0] text-xs">High-resolution photographic folders showing before, during, and after progression.</p>
              </div>
              <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800">
                <Users className="w-8 h-8 text-gold-500 mb-4" />
                <h4 className="text-white font-bold text-sm mb-2">Participant Metrics</h4>
                <p className="text-[#B0B0B0] text-xs">Log sheets tracking total corporate volunteer hours and feedback data.</p>
              </div>
              <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800">
                <Receipt className="w-8 h-8 text-gold-500 mb-4" />
                <h4 className="text-white font-bold text-sm mb-2">Full Financial Trace</h4>
                <p className="text-[#B0B0B0] text-xs">Granular transparency showing exactly where every single rupee was deployed.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Marquee Rows */}
      {partners && partners.length > 0 && (
        <section className="bg-[#0A0A0A] py-20 border-b border-gold-500/10">
          <div className="max-w-6xl mx-auto px-5 text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Our Partners in Change</h2>
            <p className="text-[#B0B0B0] text-sm md:text-base max-w-xl mx-auto">
              We collaborate with forward-thinking organisations committed to impactful environmental and social action.
            </p>
          </div>
          <div className="space-y-4">
            <LogoMarquee partners={partners} direction="left" />
            <LogoMarquee partners={partners} direction="right" />
          </div>
        </section>
      )}

      {/* Enquiry Form Intake Section */}
      <section id="enquiry" className="bg-black py-20">
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Want A CSR Activity For Your Company?</h2>
            <p className="text-[#B0B0B0] text-sm md:text-base max-w-2xl mx-auto">
              Tell us about your team size, duration preferences, and alignment goals. Our CSR coordination team will supply suitable activity options and precise budgets.
            </p>
          </div>
          <div className="bg-[#0A0A0A] rounded-3xl p-6 md:p-12 border border-gold-500/10">
            <CsrEnquiryForm activities={allActivities || []} pillars={pillars || []} />
          </div>
        </div>
      </section>
    </>
  )
}