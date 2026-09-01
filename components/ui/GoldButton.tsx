'use client'

import { cn } from '@/lib/utils'
import { forwardRef, ButtonHTMLAttributes } from 'react'

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-gold-500 text-black hover:bg-gold-600 shadow-lg shadow-gold-500/25',
      outline: 'bg-transparent text-gold-500 border-2 border-gold-500 hover:bg-gold-500 hover:text-black',
      ghost: 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm',
    }
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-full transition-all hover:scale-105',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

GoldButton.displayName = 'GoldButton'

export default GoldButton