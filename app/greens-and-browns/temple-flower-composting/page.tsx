import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import Link from 'next/link'
import { 
  ArrowRight, Info, CheckCircle2, ChevronRight, Activity, 
  Leaf, ShieldAlert
} from 'lucide-react'

// Force Next.js to always fetch fresh data from Supabase (bypasses cache when logo/text changes in Admin)
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('gb_project_settings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sampigefoundation.com'
  const finalTitle = settings?.meta_title || 'Greens & Browns — Temple Flower Composting'
  const finalDesc = settings?.meta_description || 'Discover how Greens & Browns diverts temple flower and leaf waste from landfills through a 6-step composting process.'

  return {
    title: finalTitle,
    description: finalDesc,
    openGraph: {
      title: settings?.og_title || 'Greens & Browns — From Temple Flowers to Compost',
      description: settings?.og_description || 'A journey towards diverting organic waste from landfills.',
      url: `${siteUrl}/greens-and-browns/temple-flower-composting`,
      type: 'website',
      images: settings?.og_image_url ? [{ url: settings.og_image_url }] : settings?.logo_url ? [{ url: settings.logo_url }] : [],
    }
  }
}

function renderIcon(name: string) {
  switch (name?.toLowerCase()) {
    case 'truck': return <Activity className="w-5 h-5 text-[#FFB300]" />
    case 'filter': return <Info className="w-5 h-5 text-[#FFB300]" />
    case 'scale': return <Activity className="w-5 h-5 text-[#FFB300]" />
    case 'scissors': return <Leaf className="w-5 h-5 text-[#FFB300]" />
    case 'layers': return <CheckCircle2 className="w-5 h-5 text-[#FFB300]" />
    case 'sprout': return <Leaf className="w-5 h-5 text-[#FFB300]" />
    default: return <Leaf className="w-5 h-5 text-[#FFB300]" />
  }
}

export default async function GreensAndBrownsStandalonePage() {
  const supabase = await createClient()

  const [
    { data: settings },
    { data: steps },
    { data: stats },
    { data: monthlyData },
    { data: gallery },
    { data: participation }
  ] = await Promise.all([
    supabase.from('gb_project_settings').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('gb_process_steps').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('gb_impact_stats').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('gb_monthly_impact').select('*').eq('is_active', true).order('year', { ascending: false }).order('sort_order', { ascending: true }),
    supabase.from('gb_gallery').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('gb_participation').select('*').eq('is_active', true).order('sort_order', { ascending: true })
  ])

  const sumCollected = monthlyData?.reduce((acc, curr) => acc + (curr.waste_collected_kg || 0), 0) || 0
  const sumDiverted = monthlyData?.reduce((acc, curr) => acc + (curr.waste_diverted_kg || 0), 0) || 0

  return (
    <article className="min-h-screen bg-black text-white selection:bg-[#FFB300] selection:text-black font-sans">
      
      {/* DEDICATED HEADER WITH YOUR UPLOADED LOGO */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800/80 px-4 py-3">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt="Greens & Browns Logo" 
                className="h-10 md:h-12 w-auto object-contain" 
              />
            ) : (
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-[#FFB300]" />
                <span className="font-extrabold text-white text-base md:text-lg tracking-wide">
                  {settings?.project_name || 'GREENS & BROWNS'}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-gray-900 bg-gradient-to-b from-[#141414] to-black py-12 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,179,0,0.06),transparent_45%)]" />
        <div className="container mx-auto px-4 max-w-5xl relative">
          
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            <div className="flex-1 space-y-5 text-left">
              
              <div className="flex items-center gap-2 border border-[#FFB300]/25 bg-[#FFB300]/10 px-3 py-1 rounded-full w-fit">
                <Leaf className="w-3.5 h-3.5 text-[#FFB300]" />
                <span className="text-[#FFB300] text-[11px] font-extrabold tracking-wider uppercase">
                  {settings?.hero_subheading || 'Greens & Browns Initiative'}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                {settings?.hero_heading || 'From Temple Flowers to Compost'}
              </h1>

              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                {settings?.hero_description || 'Discover the journey of temple flowers and leaves — from collection to compost — and how we are working to divert organic waste from landfills.'}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <a 
                  href="#composting-flow" 
                  className="px-5 py-3 bg-[#FFB300] hover:bg-[#FFCA28] text-black font-extrabold rounded-xl transition-all flex items-center gap-2 text-xs md:text-sm"
                >
                  {settings?.hero_cta_text || 'Explore the Process'} <ArrowRight className="w-4 h-4" />
                </a>
                <a 
                  href="#ecosystem-impact" 
                  className="px-5 py-3 bg-transparent hover:bg-white/5 border border-gray-800 text-gray-300 font-bold rounded-xl transition-all text-xs md:text-sm"
                >
                  {settings?.hero_cta_secondary_text || 'See Our Impact'}
                </a>
              </div>
            </div>

            <div className="flex-1 w-full max-w-md">
              {settings?.hero_image_url ? (
                <div className="rounded-3xl overflow-hidden aspect-[4/3] border border-gray-800 shadow-2xl">
                  <img src={settings.hero_image_url} alt="Temple Flower waste collection" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-zinc-900 border border-gray-800 flex flex-col items-center justify-center p-6 text-center">
                  <Leaf className="w-16 h-16 text-[#FFB300]/30 mb-2" />
                  <span className="text-xs text-gray-500 font-medium">Temple Flower Composting System</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* THE PROBLEM STATEMENT */}
      <section className="py-16 bg-black relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-7 space-y-5">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                {settings?.problem_heading || 'Where Do Temple Flowers Go After the Pooja?'}
              </h2>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                {settings?.problem_description || 'Large quantities of flowers and leaves are generated every day from temples, homes, religious ceremonies and cultural events. When these materials are mixed with general waste, they end up in landfills. But flowers and leaves are organic materials that can be collected separately, processed and returned to the soil as compost.'}
              </p>
              
              <div className="border-l-2 border-[#FFB300] pl-4 italic text-sm md:text-base text-[#FFB300] font-medium leading-relaxed bg-[#FFB300]/5 py-3 pr-3 rounded-r-xl">
                &ldquo;{settings?.problem_quote || 'Our goal is to divert large quantities of temple flower and leaf waste from landfills and return it to the natural cycle through composting.'}&rdquo;
              </div>
            </div>

            <div className="md:col-span-5">
              {settings?.problem_image_url ? (
                <div className="rounded-3xl overflow-hidden border border-gray-800 aspect-square">
                  <img src={settings.problem_image_url} alt="Devotional offerings lifecycle" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="bg-zinc-900/60 p-8 rounded-3xl border border-gray-800 aspect-square flex flex-col items-center justify-center text-center">
                  <ShieldAlert className="w-14 h-14 text-amber-500/40 mb-3" />
                  <span className="text-xs text-gray-400">Stopping Organic Material from Entering Landfills</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* WASTE COMPARISON TIMELINE */}
      <section className="py-14 bg-[#141414]/50 border-t border-b border-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-2 mb-10">
            <h3 className="text-xl md:text-2xl font-black text-white">{settings?.why_heading || 'From Waste to Resource'}</h3>
            <p className="text-gray-400 text-xs md:text-sm max-w-lg mx-auto">{settings?.why_description || 'The project is not simply about making compost. The larger goal is waste diversion.'}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* BAD FLOW */}
            <div className="bg-black border border-red-500/20 p-6 rounded-3xl space-y-4">
              <span className="text-[10px] bg-red-950/50 text-red-400 border border-red-900/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">
                {settings?.why_current_flow_heading || 'Current Waste Flow'}
              </span>
              <div className="flex flex-col gap-2.5 font-medium text-xs text-gray-400 pt-2">
                {['Temple Offerings', 'Flowers & Leaf Waste', 'Mixed With General Garbage', 'Transported To Dump yards', 'Decomposes in Landfill (Emits Methane)'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-950/60 border border-red-900/40 text-red-400 flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</span>
                    <span className={i === 4 ? 'text-red-400 font-bold' : ''}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GREEN FLOW */}
            <div className="bg-[#FFB300]/5 border border-[#FFB300]/20 p-6 rounded-3xl space-y-4">
              <span className="text-[10px] bg-[#FFB300]/15 text-[#FFB300] border border-[#FFB300]/30 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">
                {settings?.why_greens_flow_heading || 'Greens & Browns Approach'}
              </span>
              <div className="flex flex-col gap-2.5 font-medium text-xs text-gray-300 pt-2">
                {['Temple Offerings', 'Separate Collection Points', 'Sorting & Segregation', 'Shredding & Layering', 'Nutrient-Rich Compost (~90 Days)'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#FFB300]/15 border border-[#FFB300]/30 text-[#FFB300] flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</span>
                    <span className={i === 4 ? 'text-[#FFB300] font-bold' : ''}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6-STEP COMPOSTING FLOW */}
      <section id="composting-flow" className="py-16 bg-black relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">The 6-Step Composting Process</h2>
            <p className="text-gray-400 text-xs md:text-sm">
              How devotional offerings are converted into soil nutrients in approximately {settings?.composting_duration || '90 Days'}.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {steps?.map((st) => (
              <div key={st.id} className="bg-[#141414] border border-gray-900 rounded-3xl p-6 relative flex flex-col justify-between hover:border-[#FFB300]/30 transition-all group">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="p-2.5 bg-black rounded-2xl border border-gray-800">
                      {renderIcon(st.icon_name)}
                    </div>
                    <span className="text-3xl font-black text-zinc-800 group-hover:text-[#FFB300]/20 transition-colors">
                      0{st.step_number}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1.5">{st.title}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">{st.description}</p>
                  </div>
                </div>

                {st.why_text && (
                  <div className="mt-4 pt-3 border-t border-gray-900 text-[11px] text-[#FFB300] bg-[#FFB300]/5 p-2 rounded-xl">
                    <strong>Why?</strong> {st.why_text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT COUNTERS */}
      <section id="ecosystem-impact" className="py-16 bg-[#141414]/30 border-t border-b border-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Our Measurable Impact</h2>
            <p className="text-gray-400 text-xs md:text-sm">Live data tracking flower waste diverted from landfills.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {stats?.map((st) => (
              <div key={st.id} className="bg-[#141414] border border-gray-900 p-5 rounded-3xl text-center space-y-1.5">
                <div className="text-2xl md:text-4xl font-black text-[#FFB300] font-mono">
                  {st.value === '0' || !st.value ? (
                    st.label.toLowerCase().includes('collected') && sumCollected > 0 ? `${sumCollected}+` :
                    st.label.toLowerCase().includes('diverted') && sumDiverted > 0 ? `${sumDiverted}+` : '0'
                  ) : st.value}
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">{st.unit}</span>
                </div>
                <p className="text-[11px] md:text-xs text-gray-300 font-medium leading-tight max-w-[180px] mx-auto">{st.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO SECTION */}
      {settings?.video_url && (
        <section className="py-16 bg-black border-b border-gray-900">
          <div className="container mx-auto px-4 max-w-4xl text-center space-y-5">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                {settings?.video_title || 'Watch the Journey'}
              </h2>
              <p className="text-gray-400 text-xs md:text-sm mt-1">
                {settings?.video_description || 'See how temple flowers are collected and converted into compost.'}
              </p>
            </div>
            <div className="aspect-video w-full rounded-3xl overflow-hidden border border-gray-800 bg-[#141414] shadow-2xl">
              <iframe 
                src={settings.video_url} 
                title={settings.video_title}
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </section>
      )}

      {/* REAL GALLERY */}
      {gallery && gallery.length > 0 && (
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center space-y-2 mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">See the Process in Action</h2>
              <p className="text-gray-400 text-xs md:text-sm">Real photographs from our collection and composting sites.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {gallery.map((g) => (
                <div key={g.id} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-900 bg-zinc-900 group">
                  <img src={g.image_url} alt={g.caption || 'Greens & Browns activity'} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-bold uppercase bg-[#FFB300] text-black px-1.5 py-0.5 rounded-full w-fit mb-1">{g.category}</span>
                    <p className="text-[10px] text-white leading-tight line-clamp-2">{g.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW TO PARTICIPATE */}
      {participation && participation.length > 0 && (
        <section className="py-16 bg-black border-t border-gray-900">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center space-y-2 mb-12">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">Be Part of the Change</h2>
              <p className="text-gray-400 text-xs md:text-sm">How temples, apartments, households, and organizations can join.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {participation.map((card) => (
                <div key={card.id} className="bg-[#141414] border border-gray-900 rounded-3xl p-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{card.icon_emoji}</span>
                      <h3 className="font-extrabold text-white text-sm">{card.title}</h3>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{card.description}</p>
                  </div>
                  {card.cta_text && (
                    <Link 
                      href={card.cta_url || '/contact'} 
                      className="mt-5 w-full py-2 bg-black border border-gray-800 text-[#FFB300] font-bold text-xs rounded-xl flex items-center justify-center gap-1 hover:bg-[#FFB300] hover:text-black transition-all"
                    >
                      {card.cta_text} <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA & FOOTER */}
      <footer className="relative bg-gradient-to-t from-[#141414] to-black py-16 border-t border-gray-900 text-center">
        <div className="container mx-auto px-4 max-w-2xl space-y-6">
          <div className="inline-flex p-3 bg-[#FFB300]/10 rounded-2xl border border-[#FFB300]/20">
            <Leaf className="w-6 h-6 text-[#FFB300]" />
          </div>

          <h2 className="text-2xl md:text-4xl font-extrabold text-white">
            {settings?.final_cta_heading || 'Every Flower Diverted Matters'}
          </h2>

          <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
            {settings?.final_cta_description || "What begins as a flower offered with devotion doesn't have to end as landfill waste. Together, we can collect it, process it and return it to the soil."}
          </p>

          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link 
              href={settings?.final_cta_button_url || '/contact'} 
              className="px-6 py-3 bg-[#FFB300] hover:bg-[#FFCA28] text-black font-extrabold rounded-xl text-xs md:text-sm transition-all"
            >
              {settings?.final_cta_button_text || 'Get Involved'}
            </Link>
            <Link 
              href={settings?.final_cta_secondary_url || '/contact'} 
              className="px-6 py-3 bg-transparent hover:bg-white/5 border border-gray-800 text-gray-300 font-bold rounded-xl text-xs md:text-sm transition-all"
            >
              {settings?.final_cta_secondary_text || 'Contact Us'}
            </Link>
          </div>
        </div>
      </footer>

    </article>
  )
}