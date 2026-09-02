'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Search, Image as ImageIcon, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface MediaLibraryProps {
  onSelect: (url: string) => void
  onClose: () => void
  bucket?: string
}

export default function MediaLibrary({ onSelect, onClose, bucket = 'project-images' }: MediaLibraryProps) {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const supabase =  createClient()

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list('projects/', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) throw error

      const urls = data
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => {
          const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(`projects/${file.name}`)
          return publicUrl
        })

      setImages(urls)
    } catch (error) {
      toast.error('Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  const filteredImages = images.filter(url => 
    url.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col border border-gold-500/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gold-500/10">
          <h2 className="text-xl font-bold text-white">Media Library</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gold-500/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search images..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p>No images found</p>
              <p className="text-sm mt-2">Upload some images first</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((url) => (
                <div
                  key={url}
                  onClick={() => setSelected(url)}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selected === url
                      ? 'border-gold-500'
                      : 'border-transparent hover:border-gold-500/50'
                  }`}
                >
                  <img
                    src={url}
                    alt="Media"
                    className="w-full h-40 object-cover"
                  />
                  {selected === url && (
                    <div className="absolute top-2 right-2 p-1 bg-gold-500 rounded-full">
                      <Check className="h-4 w-4 text-black" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gold-500/10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selected) {
                onSelect(selected)
                onClose()
              } else {
                toast.error('Please select an image')
              }
            }}
            className="px-6 py-2 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all disabled:opacity-50"
            disabled={!selected}
          >
            Select Image
          </button>
        </div>
      </div>
    </div>
  )
}
