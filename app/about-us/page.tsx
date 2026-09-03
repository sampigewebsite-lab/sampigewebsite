import { createClient } from '@/lib/supabase/server'
import PageHero from '@/components/PageHero'
import { getPageHero, heroToStats } from '@/lib/getPageHero'
import { Heart, Target, ShieldCheck, Award } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AboutUsPage() {
  const supabase = await createClient()
  const hero = await getPageHero('about')

  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'about-us')
    .eq('published', true)
    .single()

  const { data: settings } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'organization')
    .single()

  const { data: team } = await supabase
    .from('team_members')
    .select('*')
    .order('created_at', { ascending: true })

  const orgData = (settings?.value || {}) as Record<string, string>
  const rawContent: string =
    page?.content || page?.seo_description || orgData.description || 'Content coming soon...'

  const paragraphs: string[] = rawContent
    .split('\n\n')
    .map((p: string) => p.trim())
    .filter(Boolean)

  return (
    <main className="bg-black min-h-screen">
      <PageHero
        badge={hero?.badge || 'OUR STORY'}
        title={hero?.title || page?.title || `About ${orgData.name || 'Sampige Foundation'}`}
        description={hero?.description}
        backgroundImage={hero?.background_image}
        stats={heroToStats(hero)}
      />

      <div className="container mx-auto px-4 py-16 md:py-20 max-w-5xl space-y-12">
        <div className="bg-[#1A1A1A] rounded-2xl p-8 md:p-12 border border-gold-500/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gold-500/10">
            <Heart className="h-7 w-7 text-gold-500 shrink-0" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">Who We Are</h2>
          </div>

          <div className="space-y-6 text-gray-300 text-base md:text-lg leading-relaxed">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph: string, idx: number) => (
                <p key={idx} className="whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))
            ) : (
              <p>{rawContent}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gold-500/10 hover:border-gold-500/25 transition-colors">
            <Target className="h-8 w-8 text-gold-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering communities through grassroots action, environmental conservation, healthcare support, and education initiatives.
            </p>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gold-500/10 hover:border-gold-500/25 transition-colors">
            <ShieldCheck className="h-8 w-8 text-gold-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Our Core Values</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Integrity, transparency, community participation, and sustainability guide every initiative we plan and execute.
            </p>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gold-500/10 hover:border-gold-500/25 transition-colors">
            <Award className="h-8 w-8 text-gold-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Our Vision</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              A caring and responsible society where collective action transforms compassionate concern into lasting positive change.
            </p>
          </div>
        </div>

        {team && team.length > 0 && (
          <div className="pt-8 border-t border-gold-500/10 space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Our Team</h2>
              <p className="text-gray-400">The passionate people behind our initiatives</p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {team.map((member: any) => (
                <div
                  key={member.id}
                  className="bg-[#1A1A1A] rounded-2xl p-6 border border-gold-500/10 text-center group hover:border-gold-500/30 transition-all"
                >
                  {member.photo_url || member.image_url ? (
                    <img
                      src={member.photo_url || member.image_url}
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-gold-500/20 group-hover:border-gold-500 transition-colors"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-black/60 mx-auto mb-4 border border-gold-500/20 flex items-center justify-center text-gold-500 font-bold text-xl">
                      {member.name?.charAt(0) || 'T'}
                    </div>
                  )}
                  <h4 className="text-white font-semibold text-lg">{member.name}</h4>
                  <p className="text-gold-500 text-sm font-medium">{member.role}</p>
                  {member.bio && (
                    <p className="text-gray-400 text-xs mt-2 line-clamp-3">{member.bio}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-[#1A1A1A] via-black to-[#1A1A1A] rounded-2xl p-8 md:p-12 border border-gold-500/20 text-center space-y-6">
          <h3 className="text-2xl md:text-3xl font-bold text-white">Be Part of Our Journey</h3>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base">
            Whether as a volunteer, supporter, or partner — your contribution helps build hope in communities.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/get-involved/volunteer"
              className="px-8 py-3.5 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-400 transition-all"
            >
              Become a Volunteer
            </Link>
            <Link
              href="/get-involved/donate"
              className="px-8 py-3.5 border border-gold-500/40 text-gold-400 font-semibold rounded-xl hover:bg-gold-500/10 transition-all"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}