import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import OptimizedImage from '@/components/OptimizedImage'
import PoojaEnquiryForm from '@/components/PoojaEnquiryForm'
import {
  ArrowRight, Leaf, Recycle, TreePine, Droplets, Sun,
  CheckCircle2, XCircle, Home, Building2, Calendar,
  Sparkles, Heart, Users, ChevronDown, MapPin, Phone,
  Mail, Star, HandHeart, Sprout, Package, Truck, BarChart3, Share2,
  Trash2, AlertTriangle, CloudRain, Flower2
} from 'lucide-react'

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

  if (!content) return <div className="p-20 text-center text-white">Loading...</div>

  const acceptedItems = content.accepted_items || []
  const notAcceptedItems = content.not_accepted_items || []
  const faqs = content.faqs || []
  const realPhotos = content.real_work_images || []

  return (
    <main className="bg-black min-h-screen">
      
      {/* ═══════════════════════════════════════════════════════════
          1. HERO - EMOTIONAL INTRODUCTION
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden pt-20 pb-16 md:py-28">
        <div className="absolute inset-0 bg-black z-0" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FFB300]/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left: Text */}
            <div className="lg:col-span-7 max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-4 py-1.5 rounded-full border border-gray-800 bg-[#141414]">
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

              <div className="border-l-4 border-[#FFB300] pl-6 mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Pooja to Prakruthi</h2>
                <p className="text-[#FFB300] font-semibold italic text-lg mb-4">Every flower deserves a second life.</p>
                <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-lg">
                  Every day, flowers are offered to God with devotion, faith and love. But once the pooja is over, many of these flowers are simply mixed with everyday garbage.
                  <br/><br/>
                  <strong className="text-white">Pooja to Prakruthi gives those flowers a better journey.</strong>
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="#join-form" className="inline-flex items-center px-8 py-4 bg-[#FFB300] text-black font-extrabold rounded-xl hover:bg-[#FFCA28] transition-all hover:scale-[1.02] shadow-lg shadow-[#FFB300]/20 uppercase text-xs tracking-wider">
                  Give Your Flowers a Second Life <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="#problem" className="inline-flex items-center px-8 py-4 bg-[#141414] text-white font-bold rounded-xl border border-gray-800 hover:border-[#FFB300]/50 transition-all uppercase text-xs tracking-wider">
                  See How It Works ↓
                </Link>
              </div>
            </div>

            {/* Right: Hero Image/Video Area */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-gray-800 bg-[#0A0A0A] shadow-2xl">
                {content.hero_side_image ? (
                  <OptimizedImage src={content.hero_side_image} alt="Pooja flowers being collected" fill supabaseWidth={800} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#111] to-black">
                    <Flower2 className="w-12 h-12 text-gray-700 mb-4" />
                    <p className="text-gray-500 text-sm">Upload real photograph of fresh/used pooja flowers here via Admin.</p>
                  </div>
                )}
                {/* Overlay gradient so it feels connected to background */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. THE PROBLEM (Visual Journey)
          ═══════════════════════════════════════════════════════════ */}
      <section id="problem" className="py-20 md:py-32 bg-[#050505] border-t border-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              What Happens to the Flowers{' '}
              <span className="text-gray-500">After Your Pooja?</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            
            {/* Step 1 */}
            <div className="bg-[#0A0A0A] border border-gray-800 rounded-3xl overflow-hidden group">
              <div className="h-40 bg-[#111] relative border-b border-gray-800">
                {content.problem_scene_1_image ? (
                  <OptimizedImage src={content.problem_scene_1_image} alt="Offered with devotion" fill supabaseWidth={400} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🌸</div>
                )}
              </div>
              <div className="p-6 relative">
                <div className="absolute -top-5 right-6 w-10 h-10 bg-black border border-gray-800 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs">01</div>
                <h3 className="text-white font-bold text-lg mb-2">Offered With Devotion</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Flowers are offered during pooja with faith, devotion and love.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#0A0A0A] border border-gray-800 rounded-3xl overflow-hidden group">
              <div className="h-40 bg-[#111] relative border-b border-gray-800">
                {content.problem_scene_2_image ? (
                  <OptimizedImage src={content.problem_scene_2_image} alt="Pooja ends" fill supabaseWidth={400} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🪷</div>
                )}
              </div>
              <div className="p-6 relative">
                <div className="absolute -top-5 right-6 w-10 h-10 bg-black border border-gray-800 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs">02</div>
                <h3 className="text-white font-bold text-lg mb-2">Pooja Ends</h3>
                <p className="text-gray-400 text-sm leading-relaxed">The flowers have completed their purpose and are removed from the altar.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#0A0A0A] border border-gray-800 rounded-3xl overflow-hidden group">
              <div className="h-40 bg-[#111] relative border-b border-gray-800">
                {content.problem_scene_3_image ? (
                  <OptimizedImage src={content.problem_scene_3_image} alt="Enter waste stream" fill supabaseWidth={400} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🗑️</div>
                )}
              </div>
              <div className="p-6 relative">
                <div className="absolute -top-5 right-6 w-10 h-10 bg-black border border-gray-800 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs">03</div>
                <h3 className="text-white font-bold text-lg mb-2">Into the Waste</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Too often, used flowers are collected and mixed with everyday garbage.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#1A0505] border border-red-900/30 rounded-3xl overflow-hidden group">
              <div className="h-40 bg-[#111] relative border-b border-red-900/30">
                {content.problem_scene_4_image ? (
                  <OptimizedImage src={content.problem_scene_4_image} alt="Journey ends" fill supabaseWidth={400} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">⚠️</div>
                )}
              </div>
              <div className="p-6 relative">
                <div className="absolute -top-5 right-6 w-10 h-10 bg-black border border-red-900/50 rounded-full flex items-center justify-center text-red-500 font-bold text-xs">04</div>
                <h3 className="text-red-400 font-bold text-lg mb-2">Their Journey Ends</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Flowers that could have returned to the earth are now polluting landfills or lakes.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. THE REALITY & SOLUTION
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-black">
        <div className="container mx-auto px-4 text-center">
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white max-w-4xl mx-auto mb-8 leading-tight">
            A Flower Offered With Faith Deserves Better Than a Garbage Bin.
          </h2>
          
          <div className="max-w-3xl mx-auto mb-20 text-gray-400 text-lg leading-relaxed">
            <p className="mb-4">The problem isn't the flower.</p>
            <p className="font-semibold text-white text-xl mb-4">The problem is what happens after the pooja.</p>
            <p>When flowers are mixed with plastic, food waste, rubber bands, wires and other materials, they become part of mixed waste instead of being handled separately.</p>
          </div>

          {/* Before/After Visual Block */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-24">
            <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-gray-800 text-left">
              <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Before</div>
              <h3 className="text-white font-bold text-xl mb-6">Pooja Flowers</h3>
              <div className="aspect-square bg-[#111] rounded-2xl overflow-hidden relative">
                {content.reality_before_image ? <OptimizedImage src={content.reality_before_image} alt="Before" fill className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-gray-600">Upload Image</div>}
              </div>
            </div>
            
            <div className="bg-[#1A0A0A] p-6 rounded-3xl border border-red-900/30 text-left">
              <div className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4">Wrong Journey</div>
              <h3 className="text-red-400 font-bold text-xl mb-6">Mixed Waste</h3>
              <div className="aspect-square bg-[#111] rounded-2xl overflow-hidden relative">
                {content.reality_wrong_image ? <OptimizedImage src={content.reality_wrong_image} alt="Wrong" fill className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-gray-600">Upload Image</div>}
              </div>
            </div>

            <div className="bg-[#0A1A0A] p-6 rounded-3xl border border-green-900/30 text-left relative overflow-hidden">
              <div className="absolute inset-0 bg-green-500/5" />
              <div className="relative z-10">
                <div className="text-green-500 text-xs font-bold uppercase tracking-widest mb-4">What We Want</div>
                <h3 className="text-green-400 font-bold text-xl mb-6">Separate → Compost</h3>
                <div className="aspect-square bg-[#111] rounded-2xl overflow-hidden relative">
                  {content.reality_right_image ? <OptimizedImage src={content.reality_right_image} alt="Right" fill className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-gray-600">Upload Image</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Introduction of Sampige */}
          <div className="max-w-4xl mx-auto bg-gradient-to-b from-[#1A1500] to-[#0A0A0A] p-10 md:p-16 rounded-[40px] border border-[#FFB300]/20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[#FFB300] to-transparent opacity-50" />
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              We Believe Your Flowers Deserve a Better Journey.
            </h2>
            
            <div className="inline-block bg-black px-6 py-2 rounded-full border border-gray-800 mb-8">
              <span className="text-[#FFB300] font-bold tracking-wider">POOJA TO PRAKRUTHI</span>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              Sampige Foundation created Pooja to Prakruthi to help households, apartments, temples and events keep used pooja flowers separate from mixed waste.
              We collect suitable flower waste, segregate unwanted materials and process the organic material through composting.
            </p>

            <div className="text-xl md:text-2xl font-bold text-white leading-relaxed">
              Your devotion doesn't end with the pooja.<br/>
              <span className="text-[#FFB300]">It can continue by giving the flowers a second life.</span>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. THE PROCESS TIMELINE
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-[#050505] border-t border-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">From Pooja to Prakruthi</h2>
          </div>

          <div className="hidden md:flex items-start justify-between max-w-6xl mx-auto relative">
            <div className="absolute top-10 left-[5%] right-[5%] h-px bg-gradient-to-r from-[#FFB300]/10 via-[#FFB300]/50 to-[#FFB300]/10" />

            {[
              { icon: '🌸', title: 'Pooja', desc: 'Flowers are offered.' },
              { icon: '♻️', title: 'Separate', desc: 'Used flowers are kept away from mixed waste.' },
              { icon: '🚚', title: 'Collect', desc: 'Sampige collects them through designated points.' },
              { icon: '🧤', title: 'Segregate', desc: 'Plastic, wires, and unwanted materials removed.' },
              { icon: '🌱', title: 'Compost', desc: 'Suitable organic material is processed.' },
              { icon: '🌍', title: 'Return to Nature', desc: 'The flowers begin a new journey.' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center w-[16%] relative z-10 px-2">
                <div className="w-20 h-20 rounded-full bg-black border border-[#FFB300]/30 flex items-center justify-center mb-6 shadow-xl shadow-black">
                  <span className="text-3xl">{step.icon}</span>
                </div>
                <div className="text-gray-500 font-bold text-[10px] tracking-widest mb-2">0{i+1}</div>
                <h3 className="text-white font-bold text-sm mb-2">{step.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Mobile Timeline */}
          <div className="md:hidden max-w-xs mx-auto relative border-l border-[#FFB300]/20 pl-8 space-y-12 py-4">
            {[
              { icon: '🌸', title: 'Pooja', desc: 'Flowers are offered.' },
              { icon: '♻️', title: 'Separate', desc: 'Used flowers are kept away from mixed waste.' },
              { icon: '🚚', title: 'Collect', desc: 'Sampige collects them through designated points.' },
              { icon: '🧤', title: 'Segregate', desc: 'Plastic, wires, and unwanted materials removed.' },
              { icon: '🌱', title: 'Compost', desc: 'Suitable organic material is processed.' },
              { icon: '🌍', title: 'Return to Nature', desc: 'The flowers begin a new journey.' },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[54px] w-12 h-12 rounded-full bg-black border border-[#FFB300]/30 flex items-center justify-center shadow-lg">
                  <span className="text-xl">{step.icon}</span>
                </div>
                <div className="text-gray-500 font-bold text-[10px] tracking-widest mb-1">0{i+1}</div>
                <h3 className="text-white font-bold text-base mb-1">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. WHAT CAN I GIVE?
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-black border-t border-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <div className="text-[#FFB300] font-bold text-xs uppercase tracking-widest mb-3">Before You Give Us Your Flowers</div>
            <h2 className="text-3xl md:text-5xl font-bold text-white">Please Keep These Separate</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#0A100A] rounded-3xl p-8 border border-green-900/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl" />
              <div className="flex items-center gap-4 mb-8 border-b border-green-900/30 pb-6">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-green-400">YES</h3>
              </div>
              <ul className="space-y-4">
                {acceptedItems.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 text-base">
                    <span className="text-green-500 mt-1">•</span> {item}
                  </li>
                ))}
              </ul>
              {content.accepted_image && (
                <div className="mt-8 rounded-xl overflow-hidden h-32 relative opacity-70 mix-blend-luminosity">
                  <OptimizedImage src={content.accepted_image} alt="Accepted" fill className="object-cover" />
                </div>
              )}
            </div>

            <div className="bg-[#1A0505] rounded-3xl p-8 border border-red-900/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />
              <div className="flex items-center gap-4 mb-8 border-b border-red-900/30 pb-6">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-red-400">NO</h3>
              </div>
              <ul className="space-y-4">
                {notAcceptedItems.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 text-base">
                    <span className="text-red-500 mt-1">•</span> {item}
                  </li>
                ))}
              </ul>
              {content.not_accepted_image && (
                <div className="mt-8 rounded-xl overflow-hidden h-32 relative opacity-70 mix-blend-luminosity">
                  <OptimizedImage src={content.not_accepted_image} alt="Not Accepted" fill className="object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="inline-block bg-[#141414] border border-gray-800 rounded-full px-6 py-3 text-gray-300 text-sm font-medium shadow-lg">
              <span className="text-[#FFB300]">💡 Note:</span> A little segregation at home makes a big difference at collection.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. REAL WORK / PROOF
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-[#050505] border-t border-gray-900 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">This Is What We Do With Your Flowers.</h2>
            <p className="text-gray-400 text-lg">No generic promises. See the actual Sampige process.</p>
          </div>

          {realPhotos.length > 0 ? (
             <div className="flex overflow-x-auto gap-4 pb-8 snap-x">
               {realPhotos.map((url: string, i: number) => (
                 <div key={i} className="w-[300px] md:w-[400px] h-[400px] shrink-0 rounded-3xl bg-[#111] border border-gray-800 overflow-hidden relative snap-center">
                   <OptimizedImage src={url} alt={`Process step ${i+1}`} fill supabaseWidth={600} className="object-cover" />
                 </div>
               ))}
             </div>
          ) : (
            /* Cinematic Placeholder Sequence */
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {['COLLECTION', 'SORTING', 'REMOVING PLASTIC', 'PROCESSING', 'COMPOST'].map((label, i) => (
                <div key={i} className="aspect-[3/4] bg-[#0A0A0A] border border-gray-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center group hover:border-[#FFB300]/50 transition-all">
                  <div className="w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center text-gray-600 mb-4">📸</div>
                  <h4 className="text-gray-400 font-bold text-sm tracking-wider">{label}</h4>
                  <p className="text-gray-600 text-xs mt-2">Upload real photo</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. IMPACT
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-24 bg-gradient-to-r from-[#FFB300] via-[#FF8F00] to-[#FFB300]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-black mb-16">Your Flowers. Your Impact.</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { value: '1,250+', label: 'KG Flower Waste Collected' },
              { value: '350+', label: 'Households Participating' },
              { value: '25+', label: 'Community Collection Points' },
              { value: '450+', label: 'KG Compost Generated' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-6xl font-black text-black mb-3">{stat.value}</div>
                <div className="text-black/80 font-bold text-sm md:text-base uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-16 inline-block bg-black/10 px-8 py-4 rounded-full border border-black/20">
            <span className="text-black font-bold text-lg">Every flower collected is one less flower added to mixed waste.</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. PARTICIPATION & PRICING
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-black">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">How Can You Be Part of This?</h2>
            <p className="text-gray-400 text-lg md:text-xl">You've seen the journey. Choose your path below.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* HOUSEHOLD / MEMBERSHIP */}
            <div className="bg-gradient-to-br from-[#1A1500] to-black rounded-[40px] p-8 md:p-12 border border-[#FFB300]/30 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFB300]/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#FFB300]/10 flex items-center justify-center text-[#FFB300] border border-[#FFB300]/20">
                    <Home className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">Household</h3>
                </div>
                
                <h4 className="text-[#FFB300] text-xl font-bold mb-4">Want to Make This Part of Your Routine?</h4>
                <p className="text-gray-300 leading-relaxed mb-8">
                  Become a regular participant in Pooja to Prakruthi and help keep your household's pooja flowers separate from mixed waste.
                </p>

                <div className="bg-black/50 border border-gray-800 rounded-3xl p-6 mb-8">
                  <div className="text-4xl md:text-5xl font-black text-white mb-2">
                    ₹300 <span className="text-lg text-gray-500 font-normal">/ month</span>
                  </div>
                  <p className="text-[#FFB300] text-sm font-semibold mb-6">Up to 30 kg per month</p>
                  
                  <ul className="space-y-3">
                    {['Flower collection system', 'Segregation', 'Composting', 'Participation tracking', 'Impact updates'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-[#FFB300]" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="#join-form" className="flex items-center justify-between w-full bg-[#FFB300] text-black font-extrabold py-5 px-8 rounded-2xl hover:bg-[#FFCA28] transition-all text-sm uppercase tracking-wider group-hover:shadow-[0_0_30px_rgba(255,179,0,0.2)]">
                  <span>Become a Green Member</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* APARTMENT */}
            <div className="bg-[#0A0A0A] rounded-[40px] p-8 md:p-12 border border-gray-800 flex flex-col justify-between hover:border-[#FFB300]/30 transition-all group">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white border border-gray-800 group-hover:text-[#FFB300] group-hover:border-[#FFB300]/30 transition-colors">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">For Apartments</h3>
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-6">
                  Create a dedicated flower-waste collection point for your entire community. We collect from the premises on a scheduled basis.
                </p>

                <div className="text-3xl font-bold text-white mb-8 border-l-2 border-gray-700 pl-4 group-hover:border-[#FFB300] transition-colors">
                  ₹100 <span className="text-base text-gray-500 font-normal block mt-1">/ participating flat / month</span>
                </div>
              </div>

              <Link href="#join-form" className="flex items-center justify-between w-full bg-[#111] text-white border border-gray-800 font-bold py-5 px-8 rounded-2xl hover:bg-[#1A1A1A] transition-all text-sm uppercase tracking-wider group-hover:border-[#FFB300]/50 group-hover:text-[#FFB300]">
                <span>Start an Apartment Programme</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* EVENT */}
            <div className="bg-[#0A0A0A] rounded-[40px] p-8 md:p-12 border border-gray-800 flex flex-col justify-between hover:border-[#FFB300]/30 transition-all group">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white border border-gray-800 group-hover:text-[#FFB300] group-hover:border-[#FFB300]/30 transition-colors">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">For Events</h3>
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-6">
                  Don't let event flowers become mixed waste. Perfect for poojas, weddings, festivals and housewarming ceremonies.
                </p>

                <div className="text-3xl font-bold text-white mb-8 border-l-2 border-gray-700 pl-4 group-hover:border-[#FFB300] transition-colors">
                  ₹200 <span className="text-base text-gray-500 font-normal block mt-1">up to 10 kg</span>
                  <span className="text-sm text-gray-600 font-normal block mt-1">₹5/kg above 10 kg</span>
                </div>
              </div>

              <Link href="#join-form" className="flex items-center justify-between w-full bg-[#111] text-white border border-gray-800 font-bold py-5 px-8 rounded-2xl hover:bg-[#1A1A1A] transition-all text-sm uppercase tracking-wider group-hover:border-[#FFB300]/50 group-hover:text-[#FFB300]">
                <span>Book Event Collection</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* TEMPLE */}
            <div className="bg-[#0A0A0A] rounded-[40px] p-8 md:p-12 border border-gray-800 flex flex-col justify-between hover:border-[#FFB300]/30 transition-all group">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white border border-gray-800 group-hover:text-[#FFB300] group-hover:border-[#FFB300]/30 transition-colors">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">For Temples</h3>
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-8">
                  Build a dedicated system for managing the flowers offered at your temple. We work with you to create a custom collection and processing system.
                </p>
              </div>

              <Link href="#join-form" className="flex items-center justify-between w-full bg-[#111] text-white border border-gray-800 font-bold py-5 px-8 rounded-2xl hover:bg-[#1A1A1A] transition-all text-sm uppercase tracking-wider group-hover:border-[#FFB300]/50 group-hover:text-[#FFB300]">
                <span>Partner With Sampige</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. NEW FORM
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-[#050505] border-t border-gray-900 relative">
        {/* Background ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FFB300]/5 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <PoojaEnquiryForm />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. FAQ
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-black border-t border-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq: any, i: number) => (
              <details key={i} className="group bg-[#0A0A0A] rounded-2xl border border-gray-800 hover:border-[#FFB300]/30 transition-colors overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer p-6 list-none">
                  <h3 className="text-white font-bold text-base md:text-lg pr-4">{faq.q}</h3>
                  <ChevronDown className="h-5 w-5 text-gray-500 shrink-0 transition-transform group-open:rotate-180 group-open:text-[#FFB300]" />
                </summary>
                <div className="px-6 pb-6 pt-2">
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          11. FINAL EMOTIONAL CTA
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-black border-t border-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A00] to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4">
            Your Pooja Ends.
          </h2>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-[#FFB300] to-[#FF7A00] bg-clip-text text-transparent mb-12">
            Their Journey Doesn't Have To.
          </h2>
          
          <div className="max-w-2xl mx-auto mb-16">
            <p className="text-gray-300 text-xl leading-relaxed">
              The next time you remove the flowers from your pooja, don't throw them into the garbage.
              <br/><br/>
              <strong className="text-white font-bold">Keep them separate. Give them to Sampige.</strong>
              <br/><br/>
              Because every flower deserves a second life.
            </p>
          </div>

          <Link href="#join-form" className="inline-flex items-center gap-3 px-10 py-5 bg-[#FFB300] text-black font-extrabold rounded-2xl hover:bg-[#FFCA28] transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,179,0,0.3)] uppercase tracking-widest text-sm md:text-base">
            Give Your Flowers a Second Life <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-8">
            Household · Apartment · Temple · Event
          </p>
        </div>
      </section>

    </main>
  )
}