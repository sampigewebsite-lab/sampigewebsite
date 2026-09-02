import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function AboutUsPage() {
  const supabase = await createClient()
  
  // First try to fetch from pages table
  let { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'about-us')
    .eq('published', true)
    .single()

  // If not in pages, try to fetch from settings
  if (!page) {
    const { data: settings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'organization')
      .single()
    
    const orgData = settings?.value || {}
    
    return (
      <main className="bg-black min-h-screen pt-20">
        <div className="container mx-auto px-4 max-w-4xl py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">About {orgData.name || 'Sampige'}</h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            {orgData.description || 'Sampige is a non-profit organization committed to creating positive change in communities through education, healthcare, and sustainable development.'}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-black min-h-screen pt-20">
      <div className="container mx-auto px-4 max-w-4xl py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">{page.title}</h1>
        <div className="text-gray-300 text-lg leading-relaxed">
          <p>{page.seo_description || 'Content coming soon...'}</p>
        </div>
      </div>
    </main>
  )
}