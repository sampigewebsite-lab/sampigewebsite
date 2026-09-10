'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface CsrCoverImageProps {
  src: string
  alt: string
  pillarName?: string
}

export default function CsrCoverImage({ src, alt, pillarName }: CsrCoverImageProps) {
  if (!src) return null

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
        <div className="relative w-full overflow-hidden flex items-center justify-center">
          <motion.img
            src={src}
            alt={alt}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="w-full h-auto max-h-[650px] object-contain mx-auto"
          />

          {/* Soft Bottom Shadow Gradient for Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Floating Pillar Tag Badge */}
          {pillarName && (
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none"
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