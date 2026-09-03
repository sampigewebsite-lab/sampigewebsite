import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import PageHero from '@/components/PageHero'

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
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

  const publishedDate = article.published_at || article.created_at
  const dateLabel = publishedDate
    ? new Date(publishedDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : ''

  const stats = [
    dateLabel ? { value: dateLabel, label: 'PUBLISHED' } : null,
    article.category ? { value: String(article.category).toUpperCase(), label: 'CATEGORY' } : null,
    article.author ? { value: article.author, label: 'AUTHOR' } : null,
  ].filter(Boolean) as { value: string; label: string }[]

  return (
    <main className="bg-black min-h-screen">
      <PageHero
        badge={article.category ? String(article.category).toUpperCase() : 'BLOG'}
        title={article.title}
        description={article.excerpt || article.summary || null}
        backgroundImage={article.featured_image || article.cover_image || null}
        stats={stats}
      />

      <div className="container mx-auto px-4 pt-8">
        <Link
          href="/blogs"
          className="inline-flex items-center text-gray-400 hover:text-gold-500 transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blogs
        </Link>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
          {publishedDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gold-500" />
              {new Date(publishedDate).toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          )}
          {article.author && (
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-gold-500" />
              {article.author}
            </span>
          )}
          {article.category && (
            <span className="px-3 py-1 bg-gold-500/20 text-gold-500 rounded-full text-xs font-semibold">
              {article.category}
            </span>
          )}
        </div>

        {article.content ? (
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-base md:text-lg">
            {article.content}
          </div>
        ) : (
          <p className="text-gray-500">No content available for this blog post.</p>
        )}

        <div className="mt-12 pt-8 border-t border-gold-500/10">
          <Link
            href="/blogs"
            className="inline-flex items-center text-gold-500 hover:text-gold-400 font-semibold text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            More blogs & stories
          </Link>
        </div>
      </div>
    </main>
  )
}