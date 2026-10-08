'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)       // desktop dropdown
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false) // mobile accordion
  const [logo, setLogo] = useState<string | null>(null)
  const [orgName, setOrgName] = useState('SAMPIGE FOUNDATION')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['general', 'organization'])

      data?.forEach((row) => {
        if (row.key === 'general' && row.value?.logo) {
          const rawLogo = row.value.logo
          const optimizedLogo = rawLogo.includes('supabase.co/storage/')
            ? `${rawLogo.split('?')[0]}?width=250&quality=85`
            : rawLogo
          setLogo(optimizedLogo)
        }
        if (row.key === 'organization' && row.value?.name) {
          setOrgName(row.value.name)
        }
      })
    }
    load()
  }, [])

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const nav = [
    { href: '/', label: 'Home' },
    { href: '/about-us', label: 'About' },
    { href: '/projects', label: 'Projects' },
    // Services is handled separately as dropdown
    { href: '/csr', label: 'CSR' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/blogs', label: 'Blogs' },
    { href: '/events', label: 'Events' },
    { href: '/resources', label: 'Resources' },
    { href: '/contact', label: 'Contact' },
  ]

  const serviceLinks = [
    {
      href: '/services/divine-items-and-photo-frame-disposal',
      label: 'Disposal & Recycling Hub',
      desc: 'Old frames, idols & artifacts',
    },
    {
      href: '/services/god-photo-frames-and-idols-disposal-bangalore',
      label: 'God Photo Frames & Idols',
      desc: 'Respectful divine item disposal',
    },
    {
      href: '/services/respectful-religious-items-disposal-bangalore',
      label: 'Religious Items Disposal',
      desc: 'Pooja room & sacred materials',
    },
    {
      href: '/services/old-photo-frame-recycling-malleshwaram-bangalore',
      label: 'Photo Frame Recycling',
      desc: 'Wood, glass & metal frames',
    },
    {
      href: '/services',
      label: 'All Services →',
      desc: 'View complete list',
    },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-[#FFB300]/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 min-w-0">
            {logo ? (
              <img
                src={logo}
                alt={orgName}
                width={140}
                height={40}
                decoding="async"
                className="h-9 md:h-10 w-auto max-w-[140px] object-contain"
                onError={() => setLogo(null)}
              />
            ) : null}
            <span className="text-[#FFB300] font-extrabold text-lg md:text-xl truncate tracking-wide">
              {orgName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-5">
            {nav.slice(0, 3).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-[#FFB300] transition-colors text-sm font-medium uppercase tracking-wide"
              >
                {item.label}
              </Link>
            ))}

            {/* ===== SERVICES DROPDOWN (Desktop) ===== */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className="flex items-center gap-1 text-gray-300 hover:text-[#FFB300] transition-colors text-sm font-medium uppercase tracking-wide"
              >
                Services
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    servicesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Panel */}
              {servicesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-[#111111] border border-[#FFB300]/20 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  <div className="p-2">
                    {serviceLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setServicesOpen(false)}
                        className="flex flex-col px-4 py-3 rounded-xl hover:bg-[#FFB300]/10 transition-colors group"
                      >
                        <span className="text-sm font-semibold text-white group-hover:text-[#FFB300] transition-colors">
                          {link.label}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          {link.desc}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rest of nav after Services */}
            {nav.slice(3).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-[#FFB300] transition-colors text-sm font-medium uppercase tracking-wide"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/get-involved/volunteer"
              className="px-4 py-2 border border-[#FFB300]/40 text-[#FFB300] text-sm font-semibold rounded-full hover:bg-[#FFB300]/10 transition-colors"
            >
              Join
            </Link>
            <Link
              href="/get-involved/donate"
              className="px-4 py-2 bg-[#FFB300] text-black text-sm font-semibold rounded-full hover:bg-[#FFCA28] transition-colors"
            >
              Donate Now
            </Link>
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-gray-300 hover:text-white p-2"
            aria-label="Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* ===== MOBILE NAV ===== */}
        {isOpen && (
          <nav className="lg:hidden py-4 border-t border-[#FFB300]/10 flex flex-col gap-1">
            {/* Home, About, Projects */}
            {nav.slice(0, 3).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-[#FFB300] transition-colors py-2 px-1"
              >
                {item.label}
              </Link>
            ))}

            {/* Services Accordion (Mobile) */}
            <div>
              <button
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="flex items-center justify-between w-full text-gray-300 hover:text-[#FFB300] transition-colors py-2 px-1"
              >
                <span>Services</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    mobileServicesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {mobileServicesOpen && (
                <div className="ml-3 border-l border-[#FFB300]/20 pl-3 flex flex-col gap-1 mb-2">
                  {serviceLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => {
                        setIsOpen(false)
                        setMobileServicesOpen(false)
                      }}
                      className="text-gray-400 hover:text-[#FFB300] transition-colors py-1.5 text-sm"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Rest of mobile nav */}
            {nav.slice(3).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-[#FFB300] transition-colors py-2 px-1"
              >
                {item.label}
              </Link>
            ))}

            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-[#FFB300]/10">
              <Link
                href="/get-involved/volunteer"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-[#FFB300]/40 text-[#FFB300] font-semibold rounded-full text-center"
              >
                Join
              </Link>
              <Link
                href="/get-involved/donate"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-[#FFB300] text-black font-semibold rounded-full text-center"
              >
                Donate Now
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}