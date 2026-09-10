'use client'

import React from 'react'

interface Partner {
  id: string
  company_name: string
  logo_url?: string
}

interface LogoMarqueeProps {
  partners: Partner[]
  direction?: 'left' | 'right'
}

export default function LogoMarquee({ partners, direction = 'left' }: LogoMarqueeProps) {
  if (!partners || partners.length === 0) return null

  // Duplicate partner list for seamless infinite looping
  const doubledPartners = [...partners, ...partners, ...partners]

  const trackClass = direction === 'left' ? 'marquee-track-left' : 'marquee-track-right'

  return (
    <div
      className="marquee-container relative w-full overflow-hidden py-2"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
      }}
    >
      <div className={`${trackClass} flex items-center gap-6 whitespace-nowrap`} style={{ width: 'max-content' }}>
        {doubledPartners.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            className="flex items-center justify-center w-36 h-20 md:w-44 md:h-24 bg-[#111111] rounded-xl border border-gold-500/10 px-4 py-3 shrink-0"
          >
            {p.logo_url ? (
              <img
                src={p.logo_url}
                alt={p.company_name}
                className="max-w-full max-h-full object-contain opacity-75 hover:opacity-100 transition-opacity duration-300"
              />
            ) : (
              <span className="text-xs text-[#B0B0B0] text-center font-medium leading-tight select-none">
                {p.company_name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}