import { createClient } from '@/lib/supabase/server'
import ContactForm from '@/components/ContactForm'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export default async function ContactPage() {
  const supabase = await createClient()
  
  // Fetch organization settings from database
  const { data: settings } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'organization')
    .single()

  const orgData = settings?.value || {
    email: 'info@sampige.org',
    phone: '+91 1234567890',
    address: 'Bangalore, Karnataka, India',
    name: 'Sampige'
  }

  return (
    <main className="bg-black min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-gold-500 text-sm font-semibold tracking-wider uppercase">
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
            Contact Us
          </h1>
          <p className="text-gray-400">
            Have questions or want to collaborate? Reach out to us and we'll be happy to assist you.
          </p>
        </div>
        
        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Contact Info (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gold-500/10">
              <h2 className="text-xl font-semibold text-white mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-black rounded-lg border border-gold-500/20 text-gold-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Email</h3>
                    <a href={`mailto:${orgData.email}`} className="text-white hover:text-gold-500 text-sm transition-colors font-medium">
                      {orgData.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-black rounded-lg border border-gold-500/20 text-gold-500">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Phone</h3>
                    <a href={`tel:${orgData.phone}`} className="text-white hover:text-gold-500 text-sm transition-colors font-medium">
                      {orgData.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-black rounded-lg border border-gold-500/20 text-gold-500">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Address</h3>
                    <p className="text-white text-sm font-medium leading-relaxed">
                      {orgData.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-black rounded-lg border border-gold-500/20 text-gold-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Office Hours</h3>
                    <p className="text-white text-sm font-medium">
                      Mon - Sat: 9:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form (3 cols) */}
          <div className="md:col-span-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  )
}