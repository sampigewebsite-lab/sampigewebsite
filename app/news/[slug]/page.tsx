import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import Link from 'next/link'

export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params  // AWAIT the params
  
  const supabase = await createClient()
  
  const { data: article } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!article) {
    notFound()
  }

  return (
    <main className="bg-black min-h-screen pt-20">
      <div className="container mx-auto px-4">
        <Link 
          href="/news" 
          className="inline-flex items-center text-gray-400 hover:text-gold-500 transition-colors mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to News
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {article.featured_image && (
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(article.published_at || article.created_at).toLocaleDateString()}
          </span>
          {article.author && (
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {article.author}
            </span>
          )}
          {article.category && (
            <span className="px-3 py-1 bg-gold-500/20 text-gold-500 rounded-full text-xs">
              {article.category}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">{article.title}</h1>

        {article.content && (
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
            {article.content}
          </div>
        )}
      </div>
    </main>
  )
}