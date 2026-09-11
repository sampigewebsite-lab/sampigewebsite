import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Target, Lightbulb, ArrowLeft, ArrowRight, Recycle } from 'lucide-react'
import Link from 'next/link'
import PageHero from '@/components/PageHero'

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  return 'https://sampigewebsite.vercel.app'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const siteUrl = getBaseUrl()

  try {
    const supabase = await createClient()
    const { data: project } = await supabase
      .from('projects')
      .select('title, short_description, description, cover_image')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (!project) return {}

    const title = project.title
    const description =
      project.short_description ||
      (project.description
        ? project.description.substring(0, 160).replace(/\r?\n|\r/g, ' ') + '...'
        : 'Discover how Sampige Foundation is making a positive impact with this project in Bangalore.')

    const imageUrl = project.cover_image

    const isRecyclingProject =
      slug.includes('divine') ||
      slug.includes('photo-frame') ||
      slug.includes('disposal') ||
      slug.includes('recycle')

    const extraKeywords = isRecyclingProject
      ? [
          'photo frame recycling Bangalore',
          'recycle frames Malleshwaram',
          'divine items disposal',
          'god frame recycling',
          'photo frame disposal Bangalore',
        ]
      : []

    return {
      title,
      description,
      keywords: [
        title,
        'Sampige Foundation',
        'NGO Bangalore',
        'NGO project Karnataka',
        ...extraKeywords,
      ],
      alternates: {
        canonical: `${siteUrl}/projects/${slug}`,
      },
      openGraph: {
        type: 'article',
        title: `${title} | Sampige Foundation, Bangalore`,
        description,
        url: `${siteUrl}/projects/${slug}`,
        images: imageUrl
          ? [{ url: imageUrl, width: 1200, height: 630, alt: title }]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | Sampige Foundation, Bangalore`,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    }
  } catch (error) {
    return { title: 'Our Projects' }
  }
}

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const siteUrl = getBaseUrl()

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

  // ⭐ Related SEO service pages linked to this project
  const { data: relatedServices } = await supabase
    .from('seo_services')
    .select('slug, hero_heading, hero_subtext, meta_title, project_card_heading, project_card_text')
    .eq('related_project_slug', slug)
    .eq('published', true)

  // Fallback: divine-items project ↔ static photo-frame page
  const servicesForCard: any[] = [...(relatedServices || [])]
  if (
    (slug.includes('divine') || slug.includes('photo-frame') || slug.includes('disposal')) &&
    !servicesForCard.some((s) => s.slug === 'photo-frame-recycling-bangalore')
  ) {
    servicesForCard.push({
      slug: 'photo-frame-recycling-bangalore',
      hero_heading: 'Photo Frame Recycling in Malleshwaram, Bangalore',
      hero_subtext:
        'Schedule free pickup or drop off old photo frames, god frames & divine items for eco-friendly recycling.',
      meta_title: 'Photo Frame Recycling',
      project_card_heading: 'Need to Recycle Photo Frames?',
      project_card_text:
        'Visit our dedicated Photo Frame Recycling service page for free pickup, FAQs, and service areas across Bangalore.',
    })
  }

  const stats = [
    project.status ? { value: project.status.toUpperCase(), label: 'STATUS' } : null,
    project.beneficiaries ? { value: `${project.beneficiaries}+`, label: 'BENEFICIARIES' } : null,
    project.location ? { value: project.location.split(',')[0], label: 'LOCATION' } : null,
    project.budget ? { value: `₹${(project.budget / 100000).toFixed(1)}L`, label: 'BUDGET' } : null,
  ].filter(Boolean) as { value: string; label: string }[]

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: project.title,
    description:
      project.short_description ||
      (project.description
        ? project.description.substring(0, 160).replace(/\r?\n|\r/g, ' ')
        : ''),
    image: project.cover_image || `${siteUrl}/logo.png`,
    author: { '@type': 'Organization', name: 'Sampige Foundation', url: siteUrl },
    publisher: { '@type': 'Organization', name: 'Sampige Foundation', url: siteUrl },
    datePublished: project.created_at,
    dateModified: project.updated_at || project.created_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/projects/${slug}`,
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: `${siteUrl}/projects` },
      {
        '@type': 'ListItem',
        position: 3,
        name: project.title,
        item: `${siteUrl}/projects/${slug}`,
      },
    ],
  }

  return (
    <main className="bg-black min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHero
        badge={project.category?.name?.toUpperCase() || 'PROJECT'}
        title={project.title}
        description={project.short_description}
        backgroundImage={project.cover_image}
        stats={stats}
      />

      <div className="container mx-auto px-4 pt-8">
        <Link
          href="/projects"
          className="inline-flex items-center text-gray-400 hover:text-gold-500 transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </Link>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 space-y-12">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            {project.description && (
              <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gold-500/10">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="h-6 w-6 text-gold-500" /> About This Project
                </h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>
            )}

            {project.problem && (
              <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gold-500/10">
                <h2 className="text-2xl font-bold text-white mb-4">The Problem</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {project.problem}
                </p>
              </div>
            )}

            {project.approach && (
              <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gold-500/10">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-gold-500" /> Our Approach
                </h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {project.approach}
                </p>
              </div>
            )}
          </div>

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
            <Link
              href="/get-involved/donate"
              className="mt-2 block w-full py-3.5 bg-gold-500 text-black font-semibold rounded-xl text-center hover:bg-gold-400 hover:scale-[1.02] transition-all"
            >
              Support This Project
            </Link>
          </div>
        </div>

        {/* ⭐ OPTION D: Related SEO Service card(s) */}
        {servicesForCard.length > 0 && (
          <div className="space-y-4">
            {servicesForCard.map((svc) => (
              <div
                key={svc.slug}
                className="bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#141414] p-6 md:p-8 rounded-2xl border border-gold-500/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 rounded-full blur-[70px] pointer-events-none" />
                <div className="relative z-10 text-center md:text-left space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/30 rounded-full text-gold-500 text-xs font-bold uppercase tracking-wider">
                    <Recycle className="w-3.5 h-3.5" /> Related Service
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-white">
                    {svc.project_card_heading || svc.hero_heading || svc.meta_title}
                  </h3>
                  <p className="text-gray-400 text-sm max-w-2xl">
                    {svc.project_card_text ||
                      svc.hero_subtext ||
                      'Get free pickup, FAQs, and full service details on our dedicated landing page.'}
                  </p>
                </div>
                <Link
                  href={`/services/${svc.slug}`}
                  className="inline-flex items-center gap-2 bg-gold-500 text-black px-6 py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider hover:bg-gold-400 hover:scale-105 transition-all shrink-0 relative z-10"
                >
                  View Service Page <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}

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
                    <div
                      className={`${isImageLeft ? 'md:order-1' : 'md:order-2'} bg-black/40 flex items-center justify-center p-4 md:p-6`}
                    >
                      {section.image_url ? (
                        <img
                          src={section.image_url}
                          alt={section.heading || project.title}
                          className="max-w-full max-h-[420px] w-auto h-auto object-contain rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-64 bg-[#0A0A0A] rounded-xl" />
                      )}
                    </div>
                    <div
                      className={`${isImageLeft ? 'md:order-2' : 'md:order-1'} flex flex-col justify-center p-6 md:p-10 space-y-3`}
                    >
                      {section.heading && (
                        <h3 className="text-xl md:text-2xl font-bold text-white">
                          {section.heading}
                        </h3>
                      )}
                      {section.description && (
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {section.description}
                        </p>
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