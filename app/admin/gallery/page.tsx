'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Image as ImageIcon, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'

interface GalleryAlbum {
  id: string
  title: string
  slug: string
  description: string
  cover_image: string
  published: boolean
  created_at: string
}

export default function GalleryPage() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchAlbums()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
    }
  }

  const fetchAlbums = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('gallery_albums')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAlbums(data || [])
    } catch (error) {
      toast.error('Failed to fetch albums')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this album and all its images?')) return

    try {
      const { error } = await supabase
        .from('gallery_albums')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Album deleted successfully')
      fetchAlbums()
    } catch (error) {
      toast.error('Failed to delete album')
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('gallery_albums')
        .update({ published: !currentStatus })
        .eq('id', id)

      if (error) throw error
      toast.success(`Album ${!currentStatus ? 'published' : 'unpublished'}`)
      fetchAlbums()
    } catch (error) {
      toast.error('Failed to update album')
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Gallery</h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">Manage photo albums</p>
            </div>
            <button
              onClick={() => router.push('/admin/gallery/create')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all hover:scale-[1.02]"
            >
              <Plus className="h-5 w-5" />
              Create Album
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : albums.length === 0 ? (
            <div className="text-center py-12 bg-[#1A1A1A] rounded-xl border border-gold-500/10">
              <ImageIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No albums found</p>
              <button
                onClick={() => router.push('/admin/gallery/create')}
                className="mt-4 text-gold-500 hover:text-gold-400 transition-colors"
              >
                Create your first album →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="bg-[#1A1A1A] rounded-xl overflow-hidden border border-gold-500/10 hover:border-gold-500/30 transition-all group"
                >
                  <div className="relative h-48 bg-[#0A0A0A]">
                    {album.cover_image ? (
                      <img
                        src={album.cover_image}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => togglePublish(album.id, album.published)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          album.published
                            ? 'bg-green-500/80 text-white hover:bg-green-500'
                            : 'bg-gray-500/80 text-white hover:bg-gray-500'
                        }`}
                      >
                        {album.published ? 'Published' : 'Draft'}
                      </button>
                    </div>
                  </div>
                  <div className="p-4 md:p-6">
                    <h3 className="text-lg font-semibold text-white mb-1">{album.title}</h3>
                    {album.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{album.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-gold-500/10">
                      <span className="text-xs text-gray-500">
                        {new Date(album.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/gallery/edit/${album.id}`)}
                          className="p-2 text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(album.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <a
                          href={`/gallery/${album.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Sidebar />
    </div>
  )
}