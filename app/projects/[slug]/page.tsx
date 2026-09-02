import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Target, Lightbulb, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import PageHero from '@/components/PageHero'

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

  const { data: sections } = await supabase
    .from('project_sections')
    .select('*')
    .eq('project_id', project.id)
    .order('display_order', { ascending: true })

  // Build project-specific stats
  const stats = [
    project.status ? { value: project.status.toUpperCase(), label: 'STATUS' } : null,
    project.beneficiaries ? { value: `${project.beneficiaries}+`, label: 'BENEFICIARIES' } : null,
    project.location ? { value: project.location.split(',')[0], label: 'LOCATION' } : null,
    project.budget ? { value: `₹${(project.budget / 100000).toFixed(1)}L`, label: 'BUDGET' } : null,
  ].filter(Boolean) as { value: string; label: string }[]

  return (
    <main className="bg-black min-h-screen">
      <PageHero
        badge={project.category?.name?.toUpperCase() || 'PROJECT'}
        title={project.title}
        description={project.short_description}
        backgroundImage={project.cover_image}
        stats={stats}
      />

      <div className="container mx-auto px-4 pt-8">
        <Link href="/projects"
          className="inline-flex items-center text-gray-400 hover:text-gold-500 transition-colors text-sm">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </Link>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
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

            {sections && sections.length > 0 && (
              <div className="space-y-16 pt-8 border-t border-gold-500/10">
                <h2 className="text-2xl font-bold text-white">Project Highlights</h2>
                {sections.map((section, index) => {
                  const isImageLeft = index % 2 === 0
                  return (
                    <div key={section.id}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
                      <div className={isImageLeft ? 'md:order-1' : 'md:order-2'}>
                        {section.image_url ? (
                          <img src={section.image_url} alt={section.heading || ''}
                            className="max-w-full max-h-[500px] w-auto h-auto object-contain rounded-xl shadow-2xl border border-gold-500/10 mx-auto" />
                        ) : (
                          <div className="w-full h-64 bg-[#1A1A1A] rounded-xl border border-gold-500/10" />
                        )}
                      </div>
                      <div className={`${isImageLeft ? 'md:order-2' : 'md:order-1'} space-y-3`}>
                        {section.heading && (
                          <h3 className="text-xl md:text-2xl font-bold text-white">{section.heading}</h3>
                        )}
                        {section.description && (
                          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{section.description}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gold-500/10 sticky top-24 space-y-4">
              <h3 className="text-lg font-semibold text-white">Quick Info</h3>
              {project.category && (
                <div>
                  <p className="text-gray-500 text-xs uppercase">Category</p>
                  <p className="text-white font-medium">{project.category.name}</p>
                </div>
              )}
              {project.impact_summary && (
                <div className="pt-3 border-t border-gold-500/10">
                  <p className="text-gray-500 text-xs uppercase mb-1">Impact</p>
                  <p className="text-gold-400 text-sm font-medium">{project.impact_summary}</p>
                </div>
              )}
              <Link href="/get-involved/donate"
                className="mt-4 block w-full py-3 bg-gold-500 text-black font-semibold rounded-lg text-center hover:bg-gold-600 transition-all">
                Support This Project
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}