'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  className?: string
  sizes?: string
  quality?: number
  objectFit?: 'cover' | 'contain' | 'fill' | 'none'
  onClick?: () => void
  supabaseWidth?: number
}

// Tiny blur placeholder while image is downloading
const PLACEHOLDER_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFBMUExQSIvPjwvc3ZnPg=='

function getOptimizedSrc(src: string, supabaseWidth?: number): string {
  if (!src) return ''
  const isSupabase = src.includes('supabase.co/storage/v1/object/public/')
  if (isSupabase && supabaseWidth) {
    const baseUrl = src.split('?')[0]
    return `${baseUrl}?width=${supabaseWidth}&quality=75`
  }
  return src
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = '',
  sizes,
  quality = 75,
  objectFit = 'cover',
  onClick,
  supabaseWidth,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div
        className={`bg-[#1A1A1A] flex items-center justify-center ${className}`}
        style={!fill ? { width: width || '100%', height: height || 300 } : undefined}
      >
        <div className="text-neutral-600 text-sm">Image unavailable</div>
      </div>
    )
  }

  const optimizedSrc = getOptimizedSrc(src, supabaseWidth)
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'

  const objectFitClass =
    objectFit === 'contain'
      ? 'object-contain'
      : objectFit === 'fill'
        ? 'object-fill'
        : objectFit === 'none'
          ? 'object-none'
          : 'object-cover'

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`} style={!fill ? { width, height } : undefined}>
      {/* Shimmer loading effect */}
      {!isLoaded && (
        <div className="absolute inset-0 z-[1] animate-shimmer bg-[#1A1A1A]" />
      )}

      <Image
        src={optimizedSrc}
        alt={alt || 'Sampige Foundation'}
        {...(fill
          ? { fill: true }
          : {
              width: width || 800,
              height: height || 500,
            })}
        priority={priority}
        quality={quality}
        sizes={defaultSizes}
        className={`
          ${objectFitClass}
          ${className}
          transition-opacity duration-500 ease-in-out
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        placeholder="blur"
        blurDataURL={PLACEHOLDER_BLUR}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        onClick={onClick}
      />
    </div>
  )
}