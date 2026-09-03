import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import PageHero from '@/components/PageHero'

export default async function GalleryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: album } = await supabase
    .from('gallery_albums')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!album) {
    notFound()
  }

  const { data: images } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('album_id', album.id)
    .order('display_order', { ascending: true })

  const imageCount = images?.length || 0
  const eventDate = album.event_date
    ? new Date(album.event_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  const stats = [
    imageCount > 0 ? { value: String(imageCount), label: 'PHOTOS' } : null,
    eventDate ? { value: eventDate, label: 'EVENT DATE' } : null,
    { value: 'GALLERY', label: 'ALBUM' },
  ].filter(Boolean) as { value: string; label: string }[]

  return (
    <main className="bg-black min-h-screen">
      <PageHero
        badge="GALLERY ALBUM"
        title={album.title}
        description={album.description}
        backgroundImage={album.cover_image}
        stats={stats}
      />

      <div className="container mx-auto px-4 pt-8">
        <Link
          href="/gallery"
          className="inline-flex items-center text-gray-400 hover:text-gold-500 transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Gallery
        </Link>
      </div>

      <div className="container mx-auto px-4 py-12 pb-16">
        {!images || images.length === 0 ? (
          <div className="text-center py-16 bg-[#1A1A1A] rounded-xl border border-gold-500/10 text-gray-400">
            <p>No images in this album yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative aspect-square bg-[#1A1A1A] rounded-xl overflow-hidden border border-gold-500/10 hover:border-gold-500/30 transition-all group"
              >
                <img
                  src={image.image_url}
                  alt={image.caption || `Image ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm">{image.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}