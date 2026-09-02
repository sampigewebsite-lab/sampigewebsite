import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight } from 'lucide-react'

export default async function NewsPage() {
  const supabase = await createClient()
  
  const { data: articles } = await supabase
    .from('news')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <main className="bg-black min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            News & <span className="gradient-text">Stories</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Stay updated with our latest activities and stories
          </p>
        </div>

        {!articles || articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No news articles found</p>
            <p className="text-gray-500 mt-2">Check back soon for updates</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
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
                  <div className="flex items-center text-gold-500 font-medium mt-4 group-hover:gap-2 transition-all">
                    Read More
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
