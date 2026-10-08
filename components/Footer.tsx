'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Phone, MapPin, ArrowRight, Heart, Lock } from 'lucide-react'

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
)

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

export default function Footer() {
  const [org, setOrg] = useState({
    name: 'Sampige Foundation',
    tagline: 'Creating Change. Building Hope.',
    email: 'info@sampige.org',
    phone: '+91 1234567890',
    address: 'Bangalore, Karnataka, India',
  })
  const [social, setSocial] = useState<any>({})

  useEffect(() => {
    const loadSettings = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['organization', 'social'])

      data?.forEach((row) => {
        if (row.key === 'organization' && row.value) setOrg(row.value)
        if (row.key === 'social' && row.value) setSocial(row.value)
      })
    }
    loadSettings()
  }, [])

  const currentYear = new Date().getFullYear()
  const iconClass =
    'w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#FFB300]/20 flex items-center justify-center text-[#FFB300] hover:text-black hover:bg-[#FFB300] transition-all'

  // Hardcoded SEO-optimized service links for footer consistency
  const footerServices = [
    { href: '/pooja-to-prakruthi', label: 'Pooja to Prakruthi' },
    { href: '/greens-and-browns/temple-flower-composting', label: 'Temple Flower Composting' },
    { href: '/services/divine-items-and-photo-frame-disposal', label: 'Disposal & Recycling Hub' },
    { href: '/services/god-photo-frames-and-idols-disposal-bangalore', label: 'God Photo Frames Disposal' },
    { href: '/services/old-photo-frame-recycling-malleshwaram-bangalore', label: 'Photo Frame Recycling' },
  ]

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#FFB300]/15 text-gray-300">
      {/* CTA Banner */}
      <div className="border-b border-[#FFB300]/10 py-10 bg-gradient-to-r from-black via-[#141414] to-black">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Be a part of the change.</h3>
            <p className="text-gray-400 text-sm">
              Your support empowers underprivileged communities and builds lasting hope.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/get-involved/donate"
              className="px-6 py-3 bg-[#FFB300] text-black font-semibold rounded-full hover:bg-[#FFCA28] transition-all"
            >
              Donate Now
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 border border-[#FFB300]/40 text-[#FFB300] font-semibold rounded-full hover:bg-[#FFB300]/10 transition-all"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Org Details */}
          <div className="space-y-4 lg:col-span-1">
            <span className="text-2xl font-bold text-[#FFB300]">{org.name || 'SAMPIGE'}</span>
            <p className="text-sm text-gray-400 leading-relaxed">
              {org.tagline || 'Transforming lives through education, healthcare, and sustainable development.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={iconClass}>
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={iconClass}>
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={iconClass}>
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={iconClass}>
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className={iconClass}>
                  <TwitterIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4 border-l-2 border-[#FFB300] pl-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/', label: 'Home' },
                { href: '/about-us', label: 'About Us' },
                { href: '/projects', label: 'Our Projects' },
                { href: '/services', label: 'Our Services' },
                { href: '/csr', label: 'CSR Programmes' },
                { href: '/gallery', label: 'Gallery' },
                { href: '/blogs', label: 'Blogs & Updates' },
                { href: '/contact', label: 'Contact Us' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#FFB300] transition-colors flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-[#FFB300]/60" /> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ⭐ Our Services (Updated to feature the Hub & Sub-pages) */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4 border-l-2 border-[#FFB300] pl-3">Our Services</h4>
            <ul className="space-y-2 text-sm">
              {footerServices.map((svc) => (
                <li key={svc.href}>
                  <Link
                    href={svc.href}
                    className="hover:text-[#FFB300] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-[#FFB300]/60" />
                    <span className="line-clamp-1">{svc.label}</span>
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/services"
                  className="text-[#FFB300] font-semibold hover:underline flex items-center gap-1.5"
                >
                  View All Services <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4 border-l-2 border-[#FFB300] pl-3">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              {org.address && (
                <li className="flex items-start gap-3 text-gray-400">
                  <MapPin className="w-4 h-4 text-[#FFB300] shrink-0 mt-1" />
                  <span>{org.address}</span>
                </li>
              )}
              {org.phone && (
                <li className="flex items-center gap-3 text-gray-400">
                  <Phone className="w-4 h-4 text-[#FFB300] shrink-0" />
                  <a href={`tel:${org.phone}`} className="hover:text-[#FFB300] transition-colors">{org.phone}</a>
                </li>
              )}
              {org.email && (
                <li className="flex items-center gap-3 text-gray-400">
                  <Mail className="w-4 h-4 text-[#FFB300] shrink-0" />
                  <a href={`mailto:${org.email}`} className="hover:text-[#FFB300] transition-colors">{org.email}</a>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4 border-l-2 border-[#FFB300] pl-3">Stay Connected</h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe for project updates, stories, and impact news.
            </p>
            <form action="#" className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 bg-black border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFB300] transition-colors"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-[#FFB300] text-black font-semibold rounded-lg text-sm hover:bg-[#FFCA28] transition-colors flex items-center justify-center gap-2"
              >
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-[#FFB300]/10 py-6 bg-black">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p className="flex items-center gap-2">
            <span>© {currentYear} {org.name || 'Sampige Foundation'}. All rights reserved.</span>
            <span>•</span>
            <Link
              href="/admin/login"
              className="text-gray-600 hover:text-[#FFB300] transition-colors flex items-center gap-1"
              title="Admin Portal"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </Link>
          </p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-[#FFB300] fill-[#FFB300]" />
            <span>for community development</span>
          </div>
        </div>
      </div>
    </footer>
  )
}