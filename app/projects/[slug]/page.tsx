import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Target, Lightbulb, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
//
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

      <div className="container mx-auto px-4 py-12 md:py-16 space-y-12">

        {/* TOP: About + Quick Info side by side */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            {project.description && (
              <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gold-500/10">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="h-6 w-6 text-gold-500" /> About This Project
                </h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{project.description}</p>
              </div>
            )}

            {project.problem && (
              <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gold-500/10">
                <h2 className="text-2xl font-bold text-white mb-4">The Problem</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{project.problem}</p>
              </div>
            )}

            {project.approach && (
              <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gold-500/10">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-gold-500" /> Our Approach
                </h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{project.approach}</p>
              </div>
            )}
          </div>

          {/* Quick Info — sticky, sits beside About */}
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gold-500/10 sticky top-24 space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Info</h3>
            {project.category && (
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider">Category</p>
                <p className="text-white font-medium mt-1">{project.category.name}</p>
              </div>
            )}
            {project.status && (
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider">Status</p>
                <p className="text-white font-medium mt-1 capitalize">{project.status}</p>
              </div>
            )}
            {project.location && (
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider">Location</p>
                <p className="text-white font-medium mt-1">{project.location}</p>
              </div>
            )}
            {project.impact_summary && (
              <div className="pt-3 border-t border-gold-500/10">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Impact</p>
                <p className="text-gold-400 text-sm font-medium">{project.impact_summary}</p>
              </div>
            )}
            <Link href="/get-involved/donate"
              className="mt-2 block w-full py-3.5 bg-gold-500 text-black font-semibold rounded-xl text-center hover:bg-gold-400 hover:scale-[1.02] transition-all">
              Support This Project
            </Link>
          </div>
        </div>

        {/* BOTTOM: Project Highlights — FULL WIDTH, each section in its own box */}
        {sections && sections.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white border-t border-gold-500/10 pt-10">
              Project Highlights
            </h2>

            {sections.map((section, index) => {
              const isImageLeft = index % 2 === 0
              return (
                <div
                  key={section.id}
                  className="bg-[#1A1A1A] rounded-2xl border border-gold-500/10 overflow-hidden hover:border-gold-500/25 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
                    {/* Image */}
                    <div className={`${isImageLeft ? 'md:order-1' : 'md:order-2'} bg-black/40 flex items-center justify-center p-4 md:p-6`}>
                      {section.image_url ? (
                        <img
                          src={section.image_url}
                          alt={section.heading || ''}
                          className="max-w-full max-h-[420px] w-auto h-auto object-contain rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-64 bg-[#0A0A0A] rounded-xl" />
                      )}
                    </div>

                    {/* Text */}
                    <div className={`${isImageLeft ? 'md:order-2' : 'md:order-1'} flex flex-col justify-center p-6 md:p-10 space-y-3`}>
                      {section.heading && (
                        <h3 className="text-xl md:text-2xl font-bold text-white">{section.heading}</h3>
                      )}
                      {section.description && (
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{section.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
