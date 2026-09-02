import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight } from 'lucide-react'
import PageHero from '@/components/PageHero'
import { getPageHero, heroToStats } from '@/lib/getPageHero'

export default async function GalleryPage() {
  const supabase = await createClient()
  const hero = await getPageHero('gallery')

  const { data: albums } = await supabase
    .from('gallery_albums')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <main className="bg-black min-h-screen">
      <PageHero
        badge={hero?.badge}
        title={hero?.title || 'Our Gallery'}
        description={hero?.description}
        backgroundImage={hero?.background_image}
        stats={heroToStats(hero)}
      />

      <div className="container mx-auto px-4 py-16">
        {!albums || albums.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No gallery albums found</p>
            <p className="text-gray-500 mt-2">Check back soon for photos from our work</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/gallery/${album.slug}`}
                className="group bg-[#1A1A1A] rounded-2xl overflow-hidden border border-gold-500/10 hover:border-gold-500/30 transition-all"
              >
                <div className="h-64 bg-[#0A0A0A] relative overflow-hidden">
                  {album.cover_image ? (
                    <img
                      src={album.cover_image}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-gray-600">📸</div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white group-hover:text-gold-500 transition-colors">
                    {album.title}
                  </h3>
                  {album.description && (
                    <p className="text-gray-400 text-sm mt-2">{album.description}</p>
                  )}
                  <div className="flex items-center text-gold-500 font-medium mt-4">
                    View Album
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}