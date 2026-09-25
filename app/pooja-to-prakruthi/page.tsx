import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PoojaEnquiryForm from '@/components/PoojaEnquiryForm'
import PoojaImpactTracker from '@/components/PoojaImpactTracker'
import {
  ArrowRight,
  Leaf,
  CheckCircle2,
  XCircle,
  Home,
  Building2,
  Calendar,
  Sparkles,
  Search,
  Heart,
  Flower2,
  Trash2,
  AlertTriangle,
  CreditCard,
  Languages
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

function getImageUrl(url?: string, width = 800): string {
  if (!url) return ''
  if (url.includes('supabase.co/storage/')) {
    const cleanUrl = url.split('?')[0]
    return `${cleanUrl}?width=${width}&quality=80`
  }
  return url
}

// Full translation dictionary for bilingual support
const TRANSLATIONS = {
  en: {
    badge: "SAMPIGE FOUNDATION INITIATIVE",
    hero_title_1: "A Flower Offered With Devotion",
    hero_title_2: "Shouldn't End Up in the Garbage.",
    hero_tagline: "Every flower deserves a second life.",
    hero_desc: "Every day, flowers are offered to God with devotion. But once the pooja is over, many of these flowers are simply mixed with everyday garbage.\n\nPooja to Prakruthi gives those flowers a better journey.",
    btn_cta: "Give Your Flowers a Second Life",
    btn_renew: "Already a Member? Renew",
    heading_problem_1: "What Happens to the Flowers",
    heading_problem_2: "After Your Pooja?",
    steps: [
      { title: 'Offered With Devotion', desc: 'Flowers are offered during pooja with faith, devotion and love.' },
      { title: 'Pooja Ends', desc: 'The flowers have completed their purpose and are removed from the altar.' },
      { title: 'Into the Waste', desc: 'Too often, used flowers are mixed with everyday garbage.' },
      { title: 'Journey Ends', desc: 'Flowers that could return to the earth now pollute landfills or lakes.' }
    ],
    solution_title: "A Flower Offered With Faith Deserves Better Than a Garbage Bin.",
    solution_sub: "We Believe Your Flowers Deserve a Better Journey.",
    solution_desc: "Sampige Foundation created Pooja to Prakruthi to help keep used pooja flowers separate from mixed waste. We collect, segregate and process the organic material through natural composting.",
    solution_badge: "POOJA TO PRAKRUTHI",
    keep_separate: "Please Keep These Separate",
    yes_accepted: "YES — Accepted",
    no_not_accepted: "NO — Don't Mix",
    gallery_title: "This Is What We Do",
    gallery_sub: "Real photographs from Sampige collections and composting.",
    join_title: "How Can You Be Part of This?",
    price_month: "/ month",
    price_flat: "/ flat / month",
    price_up_to: "up to 10 kg",
    custom_price: "Custom",
    partnership_model: "Partnership model",
    join_household: "Join as Household",
    start_apartment: "Start Apartment Program",
    book_event: "Book Event Collection",
    partner_sampige: "Partner With Sampige",
    track_title: "Track Impact & Pay Subscription",
    track_desc: "Enter your registered phone number to check your flower waste impact and pay your monthly renewal.",
    go_renew: "Go Directly to Membership Renewal / Payment",
    faq_title: "Frequently Asked",
    faq_span: "Questions",
  },
  kn: {
    badge: "ಸಂಪಿಗೆ ಫೌಂಡೇಶನ್ ಉಪಕ್ರಮ",
    hero_title_1: "ಶ್ರದ್ಧಾಭಕ್ತಿಯಿಂದ ಸಮರ್ಪಿಸಿದ ಹೂವು",
    hero_title_2: "ಕಸದ ಬುಟ್ಟಿ ಸೇರಬಾರದು.",
    hero_tagline: "ಪ್ರತಿಯೊಂದು ಹೂವಿಗೂ ಪುನರ್ಜನ್ಮ ಸಿಗಬೇಕು.",
    hero_desc: "ಪ್ರತಿದಿನ ದೇವರ ಆರಾಧನೆಗೆ ಭಕ್ತಿಯಿಂದ ಹೂವುಗಳನ್ನು ಅರ್ಪಿಸಲಾಗುತ್ತದೆ. ಆದರೆ ಪೂಜೆ ಮುಗಿದ ನಂತರ, ಈ ಹೂವುಗಳನ್ನು ಬೇರೆ ಕಸದ ಜೊತೆ ಸೇರಿಸಿ ಎಸೆಯಲಾಗುತ್ತದೆ.\n\n'ಪೂಜೆಯಿಂದ ಪ್ರಕೃತಿ ಕಡೆಗೆ' ಕಾರ್ಯಕ್ರಮವು ಈ ಪವಿತ್ರ ಹೂವುಗಳಿಗೆ ಗೌರವಯುತವಾದ ಪ್ರವಾಸವನ್ನು ನೀಡುತ್ತದೆ.",
    btn_cta: "ನಿಮ್ಮ ಪೂಜಾ ಹೂವುಗಳಿಗೆ ಪುನರ್ಜನ್ಮ ನೀಡಿ",
    btn_renew: "ಸದಸ್ಯರೇ? ನವೀಕರಿಸಿ",
    heading_problem_1: "ಪೂಜೆಯ ನಂತರ ಹೂವುಗಳು",
    heading_problem_2: "ಏನಾಗುತ್ತವೆ ಗೊತ್ತೇ?",
    steps: [
      { title: 'ಭಕ್ತಿಯಿಂದ ಅರ್ಪಣೆ', desc: 'ಪೂಜೆಯ ಸಮಯದಲ್ಲಿ ನಂಬಿಕೆ, ಶ್ರದ್ಧೆ ಮತ್ತು ಭಕ್ತಿಯಿಂದ ಹೂವುಗಳನ್ನು ದೇವರಿಗೆ ಅರ್ಪಿಸಲಾಗುತ್ತದೆ.' },
      { title: 'ಪೂಜೆ ಮುಕ್ತಾಯ', desc: 'ಹೂವುಗಳು ತಮ್ಮ ಪೂಜಾ ಸೇವೆಯನ್ನು ಮುಗಿಸಿ ಪೂಜಾ ಪೀಠದಿಂದ ಭಕ್ತಿಯಿಂದ ತೆಗೆಯಲ್ಪಡುತ್ತವೆ.' },
      { title: 'ಕಸದ ಬುಟ್ಟಿಗೆ', desc: 'ಹಲವು ಬಾರಿ, ಬಳಸಿದ ಹೂವುಗಳನ್ನು ಬೇರೆ ಸಾಮಾನ್ಯ ಕಸದೊಂದಿಗೆ ಸೇರಿಸಿ ಕಸದ ಬುಟ್ಟಿಗೆ ಎಸೆಯಲಾಗುತ್ತದೆ.' },
      { title: 'ಕೊನೆಯ ದಾರಿ', desc: 'ಮಣ್ಣಿಗೆ ಹಿಂತಿರುಗಬೇಕಾದ ಹೂವುಗಳು ಕೊಳೆತು ಕಸದ ಲಾರಿ ಅಥವಾ ಕೆರೆಗಳನ್ನು ಕಲುಷಿತಗೊಳಿಸುತ್ತವೆ.' }
    ],
    solution_title: "ಶ್ರದ್ಧೆಯಿಂದ ಅರ್ಪಿಸಿದ ಹೂವಿಗೆ ಕಸದ ಬುಟ್ಟಿಗಿಂತ ಉತ್ತಮ ಸ್ಥಾನ ಸಿಗಬೇಕು.",
    solution_sub: "ನಿಮ್ಮ ಪೂಜಾ ಹೂವುಗಳಿಗೆ ಗೌರವಯುತವಾದ ದಾರಿ ಸಿಗಬೇಕೆಂದು ನಾವು ನಂಬುತ್ತೇವೆ.",
    solution_desc: "ಬಳಸಿದ ಪೂಜಾ ಹೂವುಗಳನ್ನು ಸಾಮಾನ್ಯ ತ್ಯಾಜ್ಯದಿಂದ ಪ್ರತ್ಯೇಕವಾಗಿ ಇರಿಸಲು ಸಂಪಿಗೆ ಫೌಂಡೇಶನ್ 'ಪೂಜೆಯಿಂದ ಪ್ರಕೃತಿ ಕಡೆಗೆ' ಎಂಬ ಯೋಜನೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿದೆ. ನಾವು ಈ ಹೂವುಗಳನ್ನು ಸಂಗ್ರಹಿಸಿ, ವರ್ಗೀಕರಿಸಿ, ನೈಸರ್ಗಿಕ ಕಂಪೋಸ್ಟಿಂಗ್ ಮೂಲಕ ಗೊಬ್ಬರವಾಗಿ ಪರಿವರ್ತಿಸುತ್ತೇವೆ.",
    solution_badge: "ಪೂಜೆಯಿಂದ ಪ್ರಕೃತಿ ಕಡೆಗೆ",
    keep_separate: "ದಯವಿಟ್ಟು ಇವುಗಳನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಇಡಿ",
    yes_accepted: "ಸ್ವೀಕರಿಸಲಾಗುತ್ತದೆ (YES)",
    no_not_accepted: "ಮಿಶ್ರಣ ಮಾಡಬೇಡಿ (NO)",
    gallery_title: "ನಾವು ಮಾಡುವ ನೈಜ ಕೆಲಸ",
    gallery_sub: "ಸಂಗ್ರಹಣೆ ಮತ್ತು ಗೊಬ್ಬರ ತಯಾರಿಕೆಯ ನೈಜ ಚಿತ್ರಗಳು.",
    join_title: "ನೀವು ಈ ಅಭಿಯಾನದಲ್ಲಿ ಹೇಗೆ ಭಾಗವಹಿಸಬಹುದು?",
    price_month: "/ ತಿಂಗಳು",
    price_flat: "/ ಮನೆಗೆ / ತಿಂಗಳು",
    price_up_to: "10 ಕೆಜಿ ವರೆಗೆ",
    custom_price: "ಗ್ರಾಹಕರಿಗೆ ತಕ್ಕಂತೆ",
    partnership_model: "ಭಾಗೀದಾರಿಕೆ ಮಾದರಿ",
    join_household: "ಮನೆಗಾಗಿ ನೋಂದಾಯಿಸಿ",
    start_apartment: "ಅಪಾರ್ಟ್ಮೆಂಟ್ ಕಾರ್ಯಕ್ರಮ ಪ್ರಾರಂಭಿಸಿ",
    book_event: "ಸಮಾರಂಭದ ಸಂಗ್ರಹಣೆ ಬುಕ್ ಮಾಡಿ",
    partner_sampige: "ಸಂಪಿಗೆಯೊಂದಿಗೆ ಕೈಜೋಡಿಸಿ",
    track_title: "ಪರಿಣಾಮವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ಮತ್ತು ಚಂದಾ ಪಾವತಿಸಿ",
    track_desc: "ನಿಮ್ಮ ಹೂವಿನ ತ್ಯಾಜ್ಯದ ಮರುಬಳಕೆಯ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಮತ್ತು ನಿಮ್ಮ ಮಾಸಿಕ ಚಂದಾವನ್ನು ಪಾವತಿಸಲು ನೊಂದಾಯಿತ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
    go_renew: "ನವೀಕರಣ ಅಥವಾ ಪಾವತಿ ಪುಟಕ್ಕೆ ನೇರವಾಗಿ ಹೋಗಿ",
    faq_title: "ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ",
    faq_span: "ಪ್ರಶ್ನೆಗಳು",
  }
}

interface PageProps {
  searchParams: Promise<{ lang?: string }>
}

export default async function PoojaToPrakruthiPage({ searchParams }: PageProps) {
  const params = await searchParams
  const isKn = params.lang === 'kn'
  const currentLang = isKn ? 'kn' : 'en'
  const dict = TRANSLATIONS[currentLang]

  const supabase = await createClient()
  const { data: content } = await supabase.from('pooja_to_prakruthi_content').select('*').eq('id', 1).single()

  if (!content) {
    return <div className="p-12 text-center text-white">Loading...</div>
  }

  const acceptedItems = content.accepted_items || []
  const notAcceptedItems = content.not_accepted_items || []
  const faqs = content.faqs || []
  const realPhotos: string[] = content.real_work_images || []

  // "What Happens" cards data mapped with icons
  const problemSteps = [
    {
      title: dict.steps[0].title,
      desc: dict.steps[0].desc,
      image: getImageUrl(content.problem_scene_1_image, 500),
      Icon: Flower2,
      emoji: '🌸',
    },
    {
      title: dict.steps[1].title,
      desc: dict.steps[1].desc,
      image: getImageUrl(content.problem_scene_2_image, 500),
      Icon: Heart,
      emoji: '🪷',
    },
    {
      title: dict.steps[2].title,
      desc: dict.steps[2].desc,
      image: getImageUrl(content.problem_scene_3_image, 500),
      Icon: Trash2,
      emoji: '🗑️',
    },
    {
      title: dict.steps[3].title,
      desc: dict.steps[3].desc,
      image: getImageUrl(content.problem_scene_4_image || content.reality_wrong_image, 500),
      Icon: AlertTriangle,
      emoji: '⚠️',
    },
  ]

  const UNIVERSAL_BENEFITS = isKn ? [
    'ವಿಶೇಷ ಹೂವಿನ ಸಂಗ್ರಹಣೆ',
    'ಪ್ಲಾಸ್ಟಿಕ್ ಮತ್ತು ದಾರಗಳ ಪ್ರತ್ಯೇಕೀಕರಣ',
    '100% ನೈಸರ್ಗಿಕ ಕಂಪೋಸ್ಟಿಂಗ್',
    'ಶೂನ್ಯ ತ್ಯಾಜ್ಯ ಸೃಷ್ಟಿ',
    'ಮಾಸಿಕ ಪರಿಸರ ಪ್ರಗತಿ ವರದಿ'
  ] : [
    'Dedicated flower collection',
    'Segregation of plastics & wires',
    '100% Natural Composting',
    'Zero waste to landfill',
    'Monthly impact tracking'
  ]

  return (
    <main className="bg-black min-h-screen text-gray-200 relative">

      {/* ═══════════════════════════════════════════
          LANGUAGE TOGGLE & BAR
          ═══════════════════════════════════════════ */}
      <div className="absolute top-24 right-4 z-40 md:right-10 flex gap-2">
        <Link
          href={`/pooja-to-prakruthi?lang=en`}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${!isKn ? 'bg-[#FFB300] text-black border-[#FFB300]' : 'bg-black text-gray-400 border-gray-800 hover:text-white'}`}
        >
          <Languages className="w-3.5 h-3.5" /> English
        </Link>
        <Link
          href={`/pooja-to-prakruthi?lang=kn`}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${isKn ? 'bg-[#FFB300] text-black border-[#FFB300]' : 'bg-black text-gray-400 border-gray-800 hover:text-white'}`}
        >
          <Languages className="w-3.5 h-3.5" /> ಕನ್ನಡ
        </Link>
      </div>

      {/* ═══════════════════════════════════════════
          1. HERO
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center overflow-hidden pt-28 pb-10 md:pt-32 md:pb-12">
        <div className="absolute inset-0 bg-black z-0" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFB300]/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-center">

            {/* Left text */}
            <div className="lg:col-span-7 max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-3 px-3.5 py-1 rounded-full border border-gray-800 bg-[#141414]">
                <Sparkles className="text-[#FFB300] h-3.5 w-3.5" />
                <span className="text-gray-300 font-semibold tracking-widest text-[10px] md:text-xs uppercase">
                  {dict.badge}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-5">
                {isKn ? dict.hero_title_1 : (content.hero_title_line1 || dict.hero_title_1)}{' '}
                <span className="bg-gradient-to-r from-[#FFB300] to-[#FF7A00] bg-clip-text text-transparent block sm:inline">
                  {isKn ? dict.hero_title_2 : (content.hero_title_line2 || dict.hero_title_2)}
                </span>
              </h1>

              <div className="border-l-4 border-[#FFB300] pl-4 md:pl-5 mb-6">
                <h2 className="text-lg md:text-xl font-bold text-white mb-1">
                  Pooja to Prakruthi
                </h2>
                <p className="text-[#FFB300] font-semibold italic text-sm md:text-base mb-3">
                  {dict.hero_tagline}
                </p>
                <p className="text-xs sm:text-sm md:text-base text-gray-400 leading-relaxed max-w-lg whitespace-pre-wrap">
                  {isKn ? dict.hero_desc : (content.hero_description || dict.hero_desc)}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="#join-form"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-[#FFB300] text-black font-extrabold rounded-xl hover:bg-[#FFCA28] transition-all shadow-lg shadow-[#FFB300]/20 uppercase text-xs tracking-wider text-center"
                >
                  {dict.btn_cta}
                  <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                </Link>
                
                <Link
                  href="/pooja-to-prakruthi/pay"
                  className="inline-flex items-center justify-center px-6 py-3.5 border border-[#FFB300]/40 text-[#FFB300] font-bold rounded-xl hover:bg-[#FFB300]/10 transition-all uppercase text-xs tracking-wider text-center"
                >
                  <CreditCard className="mr-2 h-4 w-4 shrink-0" />
                  {dict.btn_renew}
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
          2. WHAT HAPPENS TO FLOWERS
          ═══════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-[#050505] border-t border-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2">
              {isKn ? dict.heading_problem_1 : (content.problem_heading || dict.heading_problem_1)}{' '}
              <span className="text-gray-500">{dict.heading_problem_2}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {problemSteps.map((step, i) => {
              const Icon = step.Icon
              return (
                <div key={i} className="bg-[#141414] rounded-2xl border border-[#FFB300]/10 hover:border-[#FFB300]/30 transition-all group flex flex-col">
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
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {step.emoji}
                      </div>
                    )}
                  </div>
                  <div className="relative -mt-5 ml-4 w-10 h-10 bg-black border border-[#FFB300]/40 rounded-xl flex items-center justify-center shadow-xl z-10">
                    <Icon className="w-4 h-4 text-[#FFB300]" />
                  </div>
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
          3. THE SOLUTION
          ═══════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white max-w-4xl mx-auto leading-tight">
              {dict.solution_title}
            </h2>
          </div>

          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-[#FFB300]/20 bg-[#0A0A0A] shadow-2xl">
              {content.solution_image ? (
                <img 
                  src={getImageUrl(content.solution_image, 800)} 
                  alt="Solution" 
                  loading="lazy" 
                  decoding="async" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <span className="text-4xl mb-2">🌱</span>
                  <p className="text-gray-500 text-xs">Upload Photo via Admin</p>
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-b from-[#1A1500] to-[#0A0A0A] p-6 md:p-8 rounded-3xl border border-[#FFB300]/20">
              <div className="inline-block bg-black px-4 py-1 rounded-full border border-gray-800 mb-4">
                <span className="text-[#FFB300] font-bold tracking-wider text-[11px]">{dict.solution_badge}</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                {isKn ? dict.solution_sub : (content.problem_solution_heading || dict.solution_sub)}
              </h3>
              <p className="text-gray-300 text-xs md:text-sm leading-relaxed mb-5 whitespace-pre-wrap">
                {isKn ? dict.solution_desc : (content.problem_solution_text || dict.solution_desc)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. WHAT CAN I GIVE
          ═══════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-[#050505] border-t border-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-4xl font-bold text-white">{dict.keep_separate}</h2>
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
                  <CheckCircle2 className="w-5 h-5 shrink-0" /> {dict.yes_accepted}
                </h3>
                <ul className="space-y-2.5">
                  {acceptedItems.map((item: string, i: number) => (
                    <li key={i} className="flex gap-2.5 text-gray-300 text-xs md:text-sm">
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
                  <XCircle className="w-5 h-5 shrink-0" /> {dict.no_not_accepted}
                </h3>
                <ul className="space-y-2.5">
                  {notAcceptedItems.map((item: string, i: number) => (
                    <li key={i} className="flex gap-2.5 text-gray-300 text-xs md:text-sm">
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
          5. GALLERY
          ═══════════════════════════════════════════ */}
      {realPhotos.length > 0 && (
        <section className="py-10 md:py-14 bg-black border-t border-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">{dict.gallery_title}</h2>
              <p className="text-gray-400 text-xs md:text-sm">{dict.gallery_sub}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto">
              {realPhotos.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-[#FFB300]/10 bg-[#0A0A0A] group">
                  <img 
                    src={getImageUrl(url, 500)} 
                    alt="Process" 
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
          6. PARTICIPATION CARDS
          ═══════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-[#050505] border-t border-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3">{dict.join_title}</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* HOUSEHOLD */}
            <div className="bg-[#111] rounded-3xl p-6 md:p-8 border border-[#FFB300]/30 hover:border-[#FFB300] transition-all flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FFB300]/10 flex items-center justify-center text-[#FFB300] shrink-0">
                  <Home className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">{isKn ? 'ಮನೆ (Household)' : 'Household'}</h3>
              </div>
              <div className="text-3xl md:text-4xl font-black text-white mb-1">
                {content.household_price || '₹300'} <span className="text-sm text-gray-500 font-normal">{dict.price_month}</span>
              </div>
              <p className="text-[#FFB300] text-xs font-semibold mb-5">
                {content.household_note || (isKn ? 'ತಿಂಗಳಿಗೆ 30 ಕೆಜಿ ವರೆಗೆ' : 'Up to 30 kg per month')}
              </p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {UNIVERSAL_BENEFITS.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-xs md:text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-[#FFB300] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="#join-form" className="flex justify-center gap-2 w-full bg-[#FFB300] text-black font-extrabold py-3.5 rounded-xl hover:bg-[#FFCA28] uppercase text-xs tracking-wider">
                {dict.join_household} <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* APARTMENT */}
            <div className="bg-[#111] rounded-3xl p-6 md:p-8 border border-gray-800 hover:border-[#FFB300] transition-all flex flex-col group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white group-hover:text-[#FFB300] group-hover:bg-[#FFB300]/10">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">{isKn ? 'ಅಪಾರ್ಟ್ಮೆಂಟ್ (Apartment)' : 'Apartment'}</h3>
              </div>
              <div className="text-3xl md:text-4xl font-black text-white mb-1">
                {content.apartment_price || '₹100'} <span className="text-sm text-gray-500 font-normal">{dict.price_flat}</span>
              </div>
              <p className="text-[#FFB300] text-xs font-semibold mb-5">
                {content.apartment_note || (isKn ? 'ಉಚಿತ ಬಕೆಟ್‌ಗಳು ಸೇರಿವೆ' : 'Community bins included')}
              </p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {UNIVERSAL_BENEFITS.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-xs md:text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-gray-600 group-hover:text-[#FFB300] mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="#join-form" className="flex justify-center gap-2 w-full bg-[#222] text-white font-extrabold py-3.5 rounded-xl group-hover:bg-[#FFB300] group-hover:text-black uppercase text-xs border border-gray-700">
                {dict.start_apartment} <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* EVENT */}
            <div className="bg-[#111] rounded-3xl p-6 md:p-8 border border-gray-800 hover:border-[#FFB300] transition-all flex flex-col group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white group-hover:text-[#FFB300] group-hover:bg-[#FFB300]/10">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">{isKn ? 'ಸಮಾರಂಭಗಳು (Events)' : 'Events'}</h3>
              </div>
              <div className="text-3xl md:text-4xl font-black text-white mb-1">
                {content.event_price || '₹200'} <span className="text-sm text-gray-500 font-normal">{dict.price_up_to}</span>
              </div>
              <p className="text-[#FFB300] text-xs font-semibold mb-5">
                {content.event_note || '₹5/kg above 10 kg'}
              </p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {UNIVERSAL_BENEFITS.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-xs md:text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-gray-600 group-hover:text-[#FFB300] mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="#join-form" className="flex justify-center gap-2 w-full bg-[#222] text-white font-extrabold py-3.5 rounded-xl hover:bg-[#FFB300] hover:text-black uppercase text-xs border border-gray-700">
                {dict.book_event} <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* TEMPLE */}
            <div className="bg-[#111] rounded-3xl p-6 md:p-8 border border-gray-800 hover:border-[#FFB300] transition-all flex flex-col group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white group-hover:text-[#FFB300] group-hover:bg-[#FFB300]/10">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">{isKn ? 'ದೇವಸ್ಥಾನಗಳು (Temple)' : 'Temple'}</h3>
              </div>
              <div className="text-3xl md:text-4xl font-black text-white mb-1">{dict.custom_price}</div>
              <p className="text-[#FFB300] text-xs font-semibold mb-5">{dict.partnership_model}</p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {UNIVERSAL_BENEFITS.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-xs md:text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-gray-600 group-hover:text-[#FFB300] mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="#join-form" className="flex justify-center gap-2 w-full bg-[#222] text-white font-extrabold py-3.5 rounded-xl hover:bg-[#FFB300] hover:text-black uppercase text-xs border border-gray-700">
                {dict.partner_sampige} <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          7. TRACK IMPACT & RENEW
          ═══════════════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-black border-t border-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-gradient-to-b from-[#141414] to-black rounded-3xl p-6 md:p-10 border border-[#FFB300]/20 text-center shadow-xl">
            <div className="w-12 h-12 bg-[#FFB300]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-[#FFB300]" />
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-white mb-2">{dict.track_title}</h2>
            <p className="text-gray-400 text-xs md:text-sm mb-6">{dict.track_desc}</p>
            
            <PoojaImpactTracker lang={currentLang} />
            
            <div className="mt-6 pt-6 border-t border-gray-800">
              <Link href="/pooja-to-prakruthi/pay" className="inline-flex items-center gap-2 text-[#FFB300] text-xs md:text-sm font-bold hover:underline">
                <CreditCard className="w-4 h-4" /> {dict.go_renew}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          8. ENQUIRY FORM
          ═══════════════════════════════════════════ */}
      <section id="join-form" className="py-10 md:py-14 bg-[#050505] border-t border-gray-900">
        <div className="container mx-auto px-4">
          <PoojaEnquiryForm lang={currentLang} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          9. FAQ
          ═══════════════════════════════════════════ */}
      {faqs.length > 0 && (
        <section className="py-10 md:py-14 bg-black border-t border-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-4xl font-bold text-white">
                {dict.faq_title} <span className="text-[#FFB300]">{dict.faq_span}</span>
              </h2>
            </div>
            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq: any, i: number) => (
                <details key={i} className="group bg-[#141414] rounded-xl border border-[#FFB300]/10 hover:border-[#FFB300]/25 transition-colors overflow-hidden">
                  <summary className="flex justify-between cursor-pointer p-4 list-none">
                    <h3 className="text-white font-semibold text-xs md:text-sm">{faq.q}</h3>
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-gray-400 text-xs leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          FLOATING WHATSAPP BUTTON (FEATURE C)
          ═══════════════════════════════════════════ */}
      <a
        href="https://wa.me/917760690264?text=Hi%20Sampige%20Foundation!%20I%20am%20interested%20in%20joining%20the%20Pooja%20to%20Prakruthi%20flower%20recycling%20initiative."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:bg-[#20BA56] hover:scale-110 flex items-center justify-center gap-2 group cursor-pointer"
        title="Chat on WhatsApp"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.062 5.321 5.378.006 11.901.006c3.161.001 6.132 1.233 8.368 3.472 2.235 2.24 3.461 5.211 3.46 8.375-.005 6.579-5.322 11.898-11.846 11.898-2.001-.001-3.968-.51-5.719-1.482L0 24zm6.59-4.846c1.6.95 3.16 1.449 4.853 1.45 5.4 0 9.794-4.39 9.797-9.789.002-2.614-1.012-5.071-2.859-6.918C16.538 1.95 14.09 1.1 11.9 1.102 6.5 1.102 2.11 5.492 2.106 10.893c-.001 1.761.47 3.415 1.42 4.904l-.93 3.393 3.48-.913z"/>
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out text-sm font-bold whitespace-nowrap">
          WhatsApp Chat
        </span>
      </a>

    </main>
  )
}