'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GoldHeadingProps {
  children: ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3'
  gradient?: boolean
}

export function GoldHeading({ 
  children, 
  className, 
  as: Tag = 'h1',
  gradient = true 
}: GoldHeadingProps) {
  return (
    <Tag 
      className={cn(
        gradient ? 'gradient-text font-script' : 'text-gold-500',
        className
      )}
    >
      {children}
    </Tag>
  )
}