import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Calendar, MapPin, Clock, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!event || error) notFound()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-yellow-500/20 text-yellow-400'
      case 'ongoing': return 'bg-green-500/20 text-green-400'
      case 'completed': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <main className="bg-black min-h-screen pt-20">
      <div className="container mx-auto px-4">
        <Link href="/events"
          className="inline-flex items-center text-gray-400 hover:text-gold-500 transition-colors mt-4 text-sm">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
        </Link>
      </div>

      {/* Hero */}
      <div className="relative h-[40vh] md:h-[50vh] bg-[#0A0A0A] mt-4 overflow-hidden">
        {event.cover_image ? (
          <img src={event.cover_image} alt={event.title}
            className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700 text-6xl">📅</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16">
          <div className="container mx-auto">
            <span className={`inline-block px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider mb-4 ${getStatusColor(event.status)}`}>
              {event.status}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {event.description && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gold-500/10 sticky top-24 space-y-5">
              <h3 className="text-lg font-semibold text-white">Event Details</h3>

              {event.date && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-black rounded-lg border border-gold-500/20 text-gold-500">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">Date</p>
                    <p className="text-white font-medium text-sm">
                      {new Date(event.date).toLocaleDateString('en-IN', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {event.time && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-black rounded-lg border border-gold-500/20 text-gold-500">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">Time</p>
                    <p className="text-white font-medium text-sm">{event.time}</p>
                  </div>
                </div>
              )}

              {event.location && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-black rounded-lg border border-gold-500/20 text-gold-500">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">Location</p>
                    <p className="text-white font-medium text-sm">{event.location}</p>
                  </div>
                </div>
              )}

              {event.registration_link && (
                <a href={event.registration_link} target="_blank" rel="noopener noreferrer"
                  className="block w-full py-3 bg-gold-500 text-black font-semibold rounded-lg text-center hover:bg-gold-600 transition-all flex items-center justify-center gap-2 mt-4">
                  Register Now <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}