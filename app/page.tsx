import Link from 'next/link'
import { ArrowRight, Heart, Users, TreePine, Utensils, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import WhatsAppFloat from '@/components/WhatsAppFloat'

// Always fetch fresh settings/content after admin saves
export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  const [
    { data: stats },
    { data: allProjects },
    { data: galleryAlbums },
    { data: newsArticles },
    { data: heroRow },
    { data: socialRow },
  ] = await Promise.all([
    supabase.from('impact_statistics').select('*').eq('active', true).order('display_order'),
    supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('gallery_albums')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('news')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase.from('site_settings').select('value').eq('key', 'homepage_hero').single(),
    supabase.from('site_settings').select('value').eq('key', 'social').single(),
  ])

  const hero = {
    badge: 'Architecture of Hope since 2019',
    title_line1: 'Creating Change.',
    title_line2: 'Building Hope.',
    description:
      'Sampige is committed to transforming lives through education, healthcare, and sustainable development initiatives in our community.',
    sub_description: 'We turn compassion into organized, documented, community-led action.',
    background_image: '',
    cta_primary_label: 'Explore Our Work',
    cta_primary_link: '/projects',
    cta_secondary_label: 'Donate Now',
    cta_secondary_link: '/get-involved/donate',
    ...(heroRow?.value || {}),
  }

  const whatsapp = socialRow?.value?.whatsapp || ''

  const defaultStats = [
    { title: 'People Supported', value: '15,000+', icon: 'Users' },
    { title: 'Meals Distributed', value: '100,000+', icon: 'Utensils' },
    { title: 'Trees Planted', value: '3,000+', icon: 'TreePine' },
    { title: 'Active Volunteers', value: '1,000+', icon: 'Heart' },
  ]
  const displayStats = stats && stats.length > 0 ? stats : defaultStats

  return (
    <main className="bg-black">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {hero.background_image ? (
          <img
            src={hero.background_image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0A] to-[#1A0A00]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50" />

        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          {/* WIDER content area */}
          <div className="max-w-5xl">
            {hero.badge && (
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="text-gold-500 h-5 w-5 shrink-0" />
                <span className="text-gold-500 font-semibold tracking-[0.15em] text-xs md:text-sm uppercase">
                  {hero.badge}
                </span>
              </div>
            )}

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
              {hero.title_line1}
              {hero.title_line2 && (
                <>
                  <br />
                  <span className="text-white">{hero.title_line2}</span>
                </>
              )}
            </h1>

            {hero.description && (
              <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-3 max-w-4xl leading-relaxed md:leading-8">
                {hero.description}
              </p>
            )}
            {hero.sub_description && (
              <p className="text-sm md:text-base text-gray-400 mb-8 max-w-4xl leading-relaxed">
                {hero.sub_description}
              </p>
            )}

            <div className="flex flex-wrap gap-3 md:gap-4">
              <Link
                href={hero.cta_primary_link || '/projects'}
                className="inline-flex items-center px-6 md:px-8 py-3.5 md:py-4 bg-gold-500 text-black font-bold rounded-lg hover:bg-gold-600 transition-all hover:scale-[1.02] shadow-lg shadow-gold-500/20 uppercase text-sm tracking-wide"
              >
                {hero.cta_primary_label || 'Explore Our Work'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

              <Link
                href={hero.cta_secondary_link || '/get-involved/donate'}
                className="inline-flex items-center px-6 md:px-8 py-3.5 md:py-4 bg-transparent text-white font-semibold rounded-lg border border-white/40 hover:bg-white/10 transition-all uppercase text-sm tracking-wide gap-2"
              >
                {hero.cta_secondary_label || 'Donate Now'}
                <Heart className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500" />
      </section>

      {/* Impact */}
      <section className="py-20 bg-gradient-to-b from-black to-[#0A0A0A] border-t border-gold-500/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="gradient-text">Impact</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Every number represents a life touched, a community transformed
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayStats.map((stat: any, index: number) => {
              const IconComponent =
                stat.icon === 'Users'
                  ? Users
                  : stat.icon === 'Utensils'
                    ? Utensils
                    : stat.icon === 'TreePine'
                      ? TreePine
                      : Heart

              return (
                <div key={index} className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold gradient-text mb-2 group-hover:scale-105 transition-transform">
                    {stat.value}
                  </div>
                  <div className="flex justify-center mb-2">
                    <IconComponent className="h-8 w-8 text-gold-500" />
                  </div>
                  <div className="text-white font-medium">{stat.title}</div>
                  {stat.description && (
                    <div className="text-sm text-gray-400 mt-1">{stat.description}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Projects */}
      {allProjects && allProjects.length > 0 && (
        <section className="py-20 bg-[#0A0A0A]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Our <span className="gradient-text">Projects</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Discover how we&apos;re making a difference in communities
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allProjects.map((project: any) => (
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
                        <span className="px-4 py-1.5 bg-gold-500 text-black text-xs font-bold rounded-full uppercase tracking-wider">
                          {project.status}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white group-hover:text-gold-500 transition-colors mb-2">
                      {project.title}
                    </h3>
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

            <div className="text-center mt-10">
              <Link
                href="/projects"
                className="inline-flex items-center px-8 py-3 bg-gold-500 text-black font-semibold rounded-full hover:bg-gold-600 transition-all"
              >
                View All Projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {galleryAlbums && galleryAlbums.length > 0 && (
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Our <span className="gradient-text">Gallery</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {galleryAlbums.map((album: any) => (
                <Link
                  key={album.id}
                  href={`/gallery/${album.slug}`}
                  className="group bg-[#1A1A1A] rounded-2xl overflow-hidden border border-gold-500/10 hover:border-gold-500/30 transition-all"
                >
                  <div className="h-48 bg-[#0A0A0A] relative overflow-hidden">
                    {album.cover_image ? (
                      <img
                        src={album.cover_image}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">📸</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white group-hover:text-gold-500 transition-colors">
                      {album.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/gallery"
                className="inline-flex items-center px-8 py-3 bg-gold-500 text-black font-semibold rounded-full hover:bg-gold-600"
              >
                View All Gallery
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Blogs */}
      {newsArticles && newsArticles.length > 0 && (
        <section className="py-20 bg-[#0A0A0A]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Latest <span className="gradient-text">Blogs</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {newsArticles.map((article: any) => (
                <Link
                  key={article.id}
                  href={`/blogs/${article.slug}`}
                  className="group bg-[#1A1A1A] rounded-2xl overflow-hidden border border-gold-500/10 hover:border-gold-500/30 transition-all"
                >
                  {article.featured_image && (
                    <div className="h-48 bg-[#0A0A0A] overflow-hidden">
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="text-sm text-gray-500 mb-2">
                      {new Date(article.published_at || article.created_at).toLocaleDateString()}
                    </div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-gold-500 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/blogs"
                className="inline-flex items-center px-8 py-3 bg-gold-500 text-black font-semibold rounded-full hover:bg-gold-600"
              >
                Read All Blogs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {whatsapp && <WhatsAppFloat phone={whatsapp} />}
    </main>
  )
}