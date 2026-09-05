import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Heart, GraduationCap, Star, Handshake, Laptop, Users, HandHeart, Briefcase } from 'lucide-react'

export const dynamic = 'force-dynamic'

const ICON_MAP: Record<string, any> = {
  Heart,
  GraduationCap,
  Star,
  Handshake,
  Laptop,
  Users,
  HandHeart,
  Briefcase,
}

type Card = {
  id: string
  title: string
  link: string
  image_url: string | null
  bg_color: string
  border_color: string
  icon_name: string
  display_order: number
}

const ROTATIONS = [
  { box: '-rotate-6', photo: 'rotate-2' },
  { box: 'rotate-3', photo: '-rotate-2' },
  { box: '-rotate-2', photo: 'rotate-1' },
  { box: 'rotate-6', photo: '-rotate-3' },
  { box: '-rotate-4', photo: 'rotate-2' },
  { box: 'rotate-2', photo: '-rotate-1' },
]

export default async function BeTheChange() {
  const supabase = await createClient()

  // Section text from settings
  const { data: settings } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'be_the_change')
    .single()

  const title = settings?.value?.title || 'I WANT TO'
  const highlight = settings?.value?.highlight || '#BETHECHANGE'
  const subtitle =
    settings?.value?.subtitle ||
    'Choose how you want to make an impact with Sampige Foundation'

  // Cards from table
  const { data: cards } = await supabase
    .from('be_the_change_cards')
    .select('*')
    .eq('published', true)
    .order('display_order', { ascending: true })

  const list: Card[] = cards || []

  if (list.length === 0) return null

  return (
    <section className="py-24 bg-black overflow-hidden relative border-t border-white/5">
      <div className="container mx-auto px-4">
        {/* Title */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wider">
            {title}{' '}
            <span className="text-[#FFB300]">{highlight}</span>
          </h2>
          {subtitle && (
            <p className="text-[#B0B0B0] mt-4 max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>

        {/* Cards Grid */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-20 md:gap-y-16">
          {list.map((card, index) => {
            const Icon = ICON_MAP[card.icon_name] || Heart
            const rotation = ROTATIONS[index % ROTATIONS.length]
            const hasBorder = card.border_color && card.border_color.trim() !== ''

            return (
              <Link
                key={card.id}
                href={card.link || '#'}
                className="group relative block w-full max-w-[220px] transition-transform duration-300 hover:scale-105 hover:z-20"
              >
                {/* Outline title */}
                <h3
                  className="absolute -top-12 left-1/2 -translate-x-1/2 text-2xl md:text-3xl font-black uppercase z-20 whitespace-nowrap tracking-widest transition-colors duration-300 group-hover:text-[#FFB300]"
                  style={{
                    WebkitTextStroke: '1px #FFB300',
                    color: 'transparent',
                  }}
                >
                  {card.title}
                </h3>

                {/* Slanted background */}
                <div
                  className={`absolute inset-0 ${rotation.box} transform scale-105 rounded-md transition-transform duration-300 group-hover:rotate-0`}
                  style={{
                    backgroundColor: card.bg_color || '#FFB300',
                    border: hasBorder ? `2px solid ${card.border_color}` : 'none',
                  }}
                />

                {/* Polaroid photo */}
                <div
                  className={`relative bg-white p-3 pb-12 shadow-2xl ${rotation.photo} transition-transform duration-300 group-hover:rotate-0`}
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-200">
                    {card.image_url ? (
                      <img
                        src={card.image_url}
                        alt={card.title}
                        className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                        No image
                      </div>
                    )}
                  </div>
                </div>

                {/* Icon sticker */}
                <div className="absolute -top-4 -right-4 z-30 bg-black p-3 rounded-full border border-[#FFB300] shadow-xl transform rotate-12 transition-transform group-hover:rotate-0 group-hover:scale-110">
                  <Icon className="w-6 h-6 text-[#FFB300]" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}