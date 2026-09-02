import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight } from 'lucide-react'
import PageHero from '@/components/PageHero'
import { getPageHero, heroToStats } from '@/lib/getPageHero'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const hero = await getPageHero('projects')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-green-500/20 text-green-500'
      case 'completed': return 'bg-blue-500/20 text-blue-500'
      case 'upcoming': return 'bg-yellow-500/20 text-yellow-500'
      case 'paused': return 'bg-red-500/20 text-red-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  return (
    <main className="bg-black min-h-screen">
      <PageHero
        badge={hero?.badge}
        title={hero?.title || 'Our Projects'}
        description={hero?.description}
        backgroundImage={hero?.background_image}
        stats={heroToStats(hero)}
      />

      <div className="container mx-auto px-4 py-16">
        {!projects || projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No projects found</p>
            <p className="text-gray-500 mt-2">Check back soon for our latest initiatives</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group bg-[#1A1A1A] rounded-2xl overflow-hidden border border-gold-500/10 hover:border-gold-500/30 transition-all"
              >
                {project.cover_image && (
                  <div className="h-56 bg-[#0A0A0A] relative overflow-hidden">
                    <img
                      src={project.cover_image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white group-hover:text-gold-500 transition-colors mb-2">
                    {project.title}
                  </h3>
                  {project.location && (
                    <p className="text-gray-500 text-sm mb-2">📍 {project.location}</p>
                  )}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.short_description || 'Making a difference in our community.'}
                  </p>
                  <div className="flex items-center text-gold-500 font-medium">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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