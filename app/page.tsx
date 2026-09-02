import Link from 'next/link'
import { ArrowRight, Heart, Users, TreePine, Utensils, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  
  // Fetch impact statistics
  const { data: stats } = await supabase
    .from('impact_statistics')
    .select('*')
    .eq('active', true)
    .order('display_order')

  // Fetch featured projects
  const { data: featuredProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('featured', true)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3)

  // Fetch all published projects
  const { data: allProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch gallery albums
  const { data: galleryAlbums } = await supabase
    .from('gallery_albums')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(4)

  // Fetch news
  const { data: newsArticles } = await supabase
    .from('news')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3)

  // Default stats
  const defaultStats = [
    { title: 'People Supported', value: '15,000+', icon: 'Users' },
    { title: 'Meals Distributed', value: '100,000+', icon: 'Utensils' },
    { title: 'Trees Planted', value: '3,000+', icon: 'TreePine' },
    { title: 'Active Volunteers', value: '1,000+', icon: 'Heart' },
  ]

  const displayStats = stats && stats.length > 0 ? stats : defaultStats

  return (
    <main className="bg-black pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0A] to-[#1A0A00]"></div>
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-gold-500/5 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-gold-600/5 blur-3xl"></div>
        
        <div className="container mx-auto px-4 py-32 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-gold-500 h-6 w-6" />
              <span className="text-gold-500 font-medium tracking-wider">SAMPIGE FOUNDATION</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">Creating Change.</span>
              <br />
              <span className="gradient-text font-script">Building Hope.</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
              Sampige is committed to transforming lives through education, 
              healthcare, and sustainable development initiatives in our community.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center px-8 py-4 bg-gold-500 text-black font-semibold rounded-full hover:bg-gold-600 transition-all hover:scale-105 shadow-lg shadow-gold-500/25"
              >
                Our Projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              
              <Link
                href="/get-involved/donate"
                className="inline-flex items-center px-8 py-4 bg-transparent text-gold-500 font-semibold rounded-full border-2 border-gold-500 hover:bg-gold-500 hover:text-black transition-all hover:scale-105"
              >
                Donate Now
              </Link>
              
              <Link
                href="/get-involved/volunteer"
                className="inline-flex items-center px-8 py-4 bg-white/10 text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all hover:scale-105 backdrop-blur-sm"
              >
                Become a Volunteer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
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
            {displayStats.map((stat, index) => {
              const IconComponent = 
                stat.icon === 'Users' ? Users :
                stat.icon === 'Utensils' ? Utensils :
                stat.icon === 'TreePine' ? TreePine :
                Heart
              
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

      {/* Projects Section */}
      {allProjects && allProjects.length > 0 && (
        <section className="py-20 bg-[#0A0A0A]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Our <span className="gradient-text">Projects</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Discover how we're making a difference in communities
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="group bg-[#1A1A1A] rounded-2xl overflow-hidden border border-gold-500/10 hover:border-gold-500/30 transition-all hover:shadow-2xl hover:shadow-gold-500/5"
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
                    <div className="flex items-center text-gold-500 font-medium group-hover:gap-2 transition-all">
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
                className="inline-flex items-center px-8 py-3 bg-gold-500 text-black font-semibold rounded-full hover:bg-gold-600 transition-all hover:scale-105"
              >
                View All Projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {galleryAlbums && galleryAlbums.length > 0 && (
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Our <span className="gradient-text">Gallery</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Moments captured from our work in communities
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {galleryAlbums.map((album) => (
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
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        📸
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white group-hover:text-gold-500 transition-colors">
                      {album.title}
                    </h3>
                    {album.description && (
                      <p className="text-gray-400 text-sm mt-1 line-clamp-1">{album.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link
                href="/gallery"
                className="inline-flex items-center px-8 py-3 bg-gold-500 text-black font-semibold rounded-full hover:bg-gold-600 transition-all hover:scale-105"
              >
                View All Gallery
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* News Section */}
      {newsArticles && newsArticles.length > 0 && (
        <section className="py-20 bg-[#0A0A0A]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Latest <span className="gradient-text">News</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Stay updated with our latest activities and stories
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {newsArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
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
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <span>{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                      {article.category && (
                        <>
                          <span>•</span>
                          <span className="text-gold-500">{article.category}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-gold-500 transition-colors mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-gray-400 text-sm line-clamp-2">{article.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link
                href="/news"
                className="inline-flex items-center px-8 py-3 bg-gold-500 text-black font-semibold rounded-full hover:bg-gold-600 transition-all hover:scale-105"
              >
                Read All News
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}