import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react'
import PageHero from '@/components/PageHero'
import { getPageHero, heroToStats } from '@/lib/getPageHero'

export default async function EventsPage() {
  const supabase = await createClient()
  const hero = await getPageHero('events')

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('published', true)
    .order('display_order', { ascending: true })
    .order('date', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'ongoing': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <main className="bg-black min-h-screen">
      <PageHero
        badge={hero?.badge}
        title={hero?.title || 'Events'}
        description={hero?.description}
        backgroundImage={hero?.background_image}
        stats={heroToStats(hero)}
      />

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {!events || events.length === 0 ? (
          <div className="text-center py-16 bg-[#1A1A1A] rounded-xl border border-gold-500/10">
            <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No events at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`}
                className="group bg-[#1A1A1A] rounded-xl border border-gold-500/10 hover:border-gold-500/30 overflow-hidden transition-all">
                <div className="relative h-48 bg-[#0A0A0A] overflow-hidden">
                  {event.cover_image ? (
                    <img src={event.cover_image} alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">📅</div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-gold-500 transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-400">
                    {event.date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gold-500 shrink-0" />
                        <span>{new Date(event.date).toLocaleDateString('en-IN', {
                          weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
                        })}</span>
                      </div>
                    )}
                    {event.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gold-500 shrink-0" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gold-500 shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-gray-500 text-sm line-clamp-2">{event.description}</p>
                  )}
                  <div className="pt-2 flex items-center text-gold-500 text-sm font-semibold gap-1">
                    View Details <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}