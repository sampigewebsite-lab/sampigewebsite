'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Image from 'next/image'

interface CsrCoverImageProps {
  src: string
  alt: string
  pillarName?: string
}

function getOptimizedCoverUrl(url: string): string {
  if (!url) return ''
  if (url.includes('supabase.co/storage/')) {
    return `${url.split('?')[0]}?width=1200&quality=80`
  }
  return url
}

export default function CsrCoverImage({ src, alt, pillarName }: CsrCoverImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  if (!src) return null

  const optimizedSrc = getOptimizedCoverUrl(src)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
      className="relative w-full mt-4 mb-8 group cursor-pointer"
    >
      {/* Ambient Gold Glow Aura on Hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-gold-500/30 via-[#FF7A00]/20 to-gold-500/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Main Container */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full rounded-3xl overflow-hidden border-2 border-gold-500/25 bg-[#0A0A0A] shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative"
      >
        <div className="relative w-full min-h-[280px] sm:min-h-[400px] md:min-h-[500px] max-h-[650px] overflow-hidden flex items-center justify-center bg-[#050505]">
          {/* Shimmer Placeholder while loading */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-[#1A1A1A] animate-pulse z-0" />
          )}

          <div className="relative w-full h-[320px] sm:h-[450px] md:h-[580px]">
            <Image
              src={optimizedSrc}
              alt={alt || 'CSR Activity'}
              fill
              priority
              quality={80}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              className={`
                object-contain mx-auto transition-all duration-700 ease-out
                group-hover:scale-105
                ${isLoaded ? 'opacity-100' : 'opacity-0'}
              `}
              onLoad={() => setIsLoaded(true)}
            />
          </div>

          {/* Soft Bottom Shadow Gradient for Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10" />

          {/* Floating Pillar Tag Badge */}
          {pillarName && (
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none z-20"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 text-black font-extrabold text-xs uppercase tracking-widest rounded-full shadow-lg shadow-gold-500/40">
                <Sparkles className="w-3.5 h-3.5" />
                {pillarName}
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}