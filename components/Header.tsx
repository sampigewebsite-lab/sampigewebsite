'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [logo, setLogo] = useState('/logo.png')
  const [orgName, setOrgName] = useState('SAMPIGE')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['general', 'organization'])

      data?.forEach((row) => {
        if (row.key === 'general' && row.value?.logo) {
          setLogo(row.value.logo)
        }
        if (row.key === 'organization' && row.value?.name) {
          setOrgName(row.value.name)
        }
      })
    }
    load()
  }, [])

  const nav = [
    { href: '/', label: 'Home' },
    { href: '/about-us', label: 'About' },
    { href: '/projects', label: 'Projects' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/news', label: 'News' },
    { href: '/events', label: 'Events' },
    { href: '/resources', label: 'Resources' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gold-500/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-18">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <img
              src={logo}
              alt={orgName}
              className="h-9 md:h-10 w-auto max-w-[140px] object-contain"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = '/logo.png'
              }}
            />
            <span className="text-gold-500 font-bold text-lg md:text-xl hidden sm:block truncate">
              {orgName}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-5">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-gold-500 transition-colors text-sm font-medium uppercase tracking-wide"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/get-involved/volunteer"
              className="px-4 py-2 border border-gold-500/40 text-gold-400 text-sm font-semibold rounded-full hover:bg-gold-500/10 transition-colors"
            >
              Join
            </Link>
            <Link
              href="/get-involved/donate"
              className="px-4 py-2 bg-gold-500 text-black text-sm font-semibold rounded-full hover:bg-gold-600 transition-colors"
            >
              Donate Now
            </Link>
          </nav>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-gray-300 hover:text-white p-2"
            aria-label="Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isOpen && (
          <nav className="lg:hidden py-4 border-t border-gold-500/10 flex flex-col gap-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-gold-500 transition-colors py-1"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/get-involved/volunteer"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-gold-500/40 text-gold-400 font-semibold rounded-full text-center"
            >
              Join
            </Link>
            <Link
              href="/get-involved/donate"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gold-500 text-black font-semibold rounded-full text-center"
            >
              Donate Now
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}