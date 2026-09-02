import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Youtube, 
  Twitter,
  ArrowRight,
  Heart
} from 'lucide-react'

export default async function Footer() {
  const supabase = await createClient()

  // Fetch organization & social settings in parallel
  const [orgRes, socialRes] = await Promise.all([
    supabase.from('site_settings').select('value').eq('key', 'organization').single(),
    supabase.from('site_settings').select('value').eq('key', 'social').single()
  ])

  const org = orgRes.data?.value || {
    name: 'Sampige Foundation',
    tagline: 'Creating Change. Building Hope.',
    email: 'info@sampige.org',
    phone: '+91 1234567890',
    address: 'Bangalore, Karnataka, India'
  }

  const social = socialRes.data?.value || {}

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0A0A0A] border-t border-gold-500/15 text-gray-300">
      {/* Top Banner / Call to Action */}
      <div className="border-b border-gold-500/10 py-10 bg-gradient-to-r from-black via-[#141414] to-black">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">
              Be a part of the change.
            </h3>
            <p className="text-gray-400 text-sm">
              Your support empowers underprivileged communities and builds lasting hope.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/get-involved/donate"
              className="px-6 py-3 bg-gold-500 text-black font-semibold rounded-full hover:bg-gold-600 transition-all shadow-lg hover:shadow-gold-500/20"
            >
              Donate Now
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 border border-gold-500/40 text-gold-400 font-semibold rounded-full hover:bg-gold-500/10 transition-all"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: Organization Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gold-500">
                {org.name || 'SAMPIGE'}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {org.tagline || 'Transforming lives through education, healthcare, and sustainable development.'}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-gold-500/20 flex items-center justify-center text-gold-400 hover:text-black hover:bg-gold-500 transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-gold-500/20 flex items-center justify-center text-gold-400 hover:text-black hover:bg-gold-500 transition-all"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-gold-500/20 flex items-center justify-center text-gold-400 hover:text-black hover:bg-gold-500 transition-all"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-gold-500/20 flex items-center justify-center text-gold-400 hover:text-black hover:bg-gold-500 transition-all"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-gold-500/20 flex items-center justify-center text-gold-400 hover:text-black hover:bg-gold-500 transition-all"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4 border-l-2 border-gold-500 pl-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-gold-500 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-gold-500/60" /> Home
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-gold-500 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-gold-500/60" /> About Us
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-gold-500 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-gold-500/60" /> Our Projects
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-gold-500 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-gold-500/60" /> Gallery
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-gold-500 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-gold-500/60" /> News & Updates
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-500 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-gold-500/60" /> Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4 border-l-2 border-gold-500 pl-3">
              Contact Info
            </h4>
            <ul className="space-y-3 text-sm">
              {org.address && (
                <li className="flex items-start gap-3 text-gray-400">
                  <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-1" />
                  <span>{org.address}</span>
                </li>
              )}
              {org.phone && (
                <li className="flex items-center gap-3 text-gray-400">
                  <Phone className="w-4 h-4 text-gold-500 shrink-0" />
                  <a href={`tel:${org.phone}`} className="hover:text-gold-500 transition-colors">
                    {org.phone}
                  </a>
                </li>
              )}
              {org.email && (
                <li className="flex items-center gap-3 text-gray-400">
                  <Mail className="w-4 h-4 text-gold-500 shrink-0" />
                  <a href={`mailto:${org.email}`} className="hover:text-gold-500 transition-colors">
                    {org.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4 border-l-2 border-gold-500 pl-3">
              Stay Connected
            </h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to get latest updates about our projects, stories, and impact.
            </p>
            <form action="#" className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 bg-black border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-gold-500 text-black font-semibold rounded-lg text-sm hover:bg-gold-600 transition-colors flex items-center justify-center gap-2"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gold-500/10 py-6 bg-black">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {currentYear} {org.name || 'Sampige Foundation'}. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
            <span>for community development</span>
          </div>
        </div>
      </div>
    </footer>
  )
}