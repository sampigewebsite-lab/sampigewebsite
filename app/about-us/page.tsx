import { createClient } from '@/lib/supabase/server'
import PageHero from '@/components/PageHero'
import { getPageHero, heroToStats } from '@/lib/getPageHero'

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

  const orgData = settings?.value || {}
  const content = page?.seo_description || orgData.description || 'Content coming soon...'

  return (
    <main className="bg-black min-h-screen">
      <PageHero
        badge={hero?.badge}
        title={hero?.title || page?.title || `About ${orgData.name || 'Sampige'}`}
        description={hero?.description}
        backgroundImage={hero?.background_image}
        stats={heroToStats(hero)}
      />

      <div className="container mx-auto px-4 max-w-4xl py-16">
        <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </main>
  )
}