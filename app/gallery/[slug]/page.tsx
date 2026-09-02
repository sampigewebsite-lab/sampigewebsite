import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function GalleryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params  // AWAIT the params
  
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

  return (
    <main className="bg-black min-h-screen pt-20">
      <div className="container mx-auto px-4">
        <Link 
          href="/gallery" 
          className="inline-flex items-center text-gray-400 hover:text-gold-500 transition-colors mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Gallery
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{album.title}</h1>
        {album.description && (
          <p className="text-gray-400 text-lg max-w-2xl">{album.description}</p>
        )}
      </div>

      <div className="container mx-auto px-4 pb-16">
        {!images || images.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No images in this album yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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