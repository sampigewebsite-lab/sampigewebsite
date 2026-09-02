import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Calendar, MapPin, Users, ArrowLeft, Target, Lightbulb } from 'lucide-react'
import Link from 'next/link'

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('*, category:category_id(*)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!project || error) notFound()

  // Fetch zig-zag content sections
  const { data: sections } = await supabase
    .from('project_sections')
    .select('*')
    .eq('project_id', project.id)
    .order('display_order', { ascending: true })

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
    <main className="bg-black min-h-screen pt-20">
      {/* Back Link */}
      <div className="container mx-auto px-4">
        <Link href="/projects"
          className="inline-flex items-center text-gray-400 hover:text-gold-500 transition-colors mt-4 text-sm">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </Link>
      </div>

      {/* Hero Cover */}
      <div className="relative h-[50vh] md:h-[60vh] bg-[#0A0A0A] mt-4 overflow-hidden">
        {project.cover_image ? (
          <img src={project.cover_image} alt={project.title}
            className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700 text-6xl">📷</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16">
          <div className="container mx-auto">
            <span className={`inline-block px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider mb-4 ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {project.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-gray-300 text-sm">
              {project.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold-500" /> {project.location}
                </span>
              )}
              {project.start_date && (
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gold-500" />
                  {new Date(project.start_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </span>
              )}
              {project.beneficiaries && (
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gold-500" /> {project.beneficiaries}+ beneficiaries
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {project.short_description && (
              <p className="text-xl text-gold-400 font-medium leading-relaxed">
                {project.short_description}
              </p>
            )}

            {project.description && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="h-6 w-6 text-gold-500" /> About This Project
                </h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{project.description}</p>
              </div>
            )}

            {project.problem && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">The Problem</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{project.problem}</p>
              </div>
            )}

            {project.approach && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-gold-500" /> Our Approach
                </h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{project.approach}</p>
              </div>
            )}

            {/* === ZIG-ZAG SECTIONS === */}
            {sections && sections.length > 0 && (
              <div className="space-y-16 pt-8 border-t border-gold-500/10">
                <h2 className="text-2xl font-bold text-white">Project Highlights</h2>

                {sections.map((section, index) => {
                  const isImageLeft = index % 2 === 0

                  return (
                    <div key={section.id}
                      className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center ${
                        isImageLeft ? '' : 'md:direction-rtl'
                      }`}>
                      
                      {/* Image Side */}
                      <div className={`${isImageLeft ? 'md:order-1' : 'md:order-2'}`}>
                        {section.image_url ? (
                          <div className="flex items-center justify-center">
                            <img
                              src={section.image_url}
                              alt={section.heading || `Section ${index + 1}`}
                              className="max-w-full max-h-[500px] w-auto h-auto object-contain rounded-xl shadow-2xl shadow-gold-500/5 border border-gold-500/10"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-64 bg-[#1A1A1A] rounded-xl border border-gold-500/10 flex items-center justify-center text-gray-600">
                            📷 No image
                          </div>
                        )}
                      </div>

                      {/* Text Side */}
                      <div className={`${isImageLeft ? 'md:order-2' : 'md:order-1'} space-y-3`}>
                        {section.heading && (
                          <h3 className="text-xl md:text-2xl font-bold text-white">
                            {section.heading}
                          </h3>
                        )}
                        {section.description && (
                          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                            {section.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gold-500/10 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Info</h3>
              <div className="space-y-4">
                {project.category && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">Category</p>
                    <p className="text-white font-medium">{project.category.name}</p>
                  </div>
                )}
                {project.beneficiaries && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">Beneficiaries</p>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-gold-500" /> {project.beneficiaries}+ people
                    </p>
                  </div>
                )}
                {project.budget && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">Budget</p>
                    <p className="text-white font-medium">₹{project.budget.toLocaleString('en-IN')}</p>
                  </div>
                )}
                {project.start_date && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">Timeline</p>
                    <p className="text-white font-medium text-sm">
                      {new Date(project.start_date).toLocaleDateString('en-IN')}
                      {project.end_date ? ` — ${new Date(project.end_date).toLocaleDateString('en-IN')}` : ' — Present'}
                    </p>
                  </div>
                )}
                {project.impact_summary && (
                  <div className="pt-3 border-t border-gold-500/10">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Impact</p>
                    <p className="text-gold-400 text-sm font-medium">{project.impact_summary}</p>
                  </div>
                )}
              </div>

              <Link href="/get-involved/donate"
                className="mt-6 block w-full py-3 bg-gold-500 text-black font-semibold rounded-lg text-center hover:bg-gold-600 transition-all">
                Support This Project
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}