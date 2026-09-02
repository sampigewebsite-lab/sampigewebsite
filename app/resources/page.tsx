import { createClient } from '@/lib/supabase/server'
import { FileText, Download, Info } from 'lucide-react'
import PageHero from '@/components/PageHero'
import { getPageHero, heroToStats } from '@/lib/getPageHero'

export default async function ResourcesListing() {
  const supabase = await createClient()
  const hero = await getPageHero('resources')

  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <main className="bg-black min-h-screen">
      <PageHero
        badge={hero?.badge}
        title={hero?.title || 'Resource Center'}
        description={hero?.description}
        backgroundImage={hero?.background_image}
        stats={heroToStats(hero)}
      />

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {!resources || resources.length === 0 ? (
          <div className="text-center py-16 bg-[#1A1A1A] rounded-xl border border-gold-500/10 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gold-500 opacity-40" />
            <p>No downloadable documents at this time. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map((res) => (
              <div key={res.id}
                className="bg-[#1a1a1a] border border-gold-500/10 rounded-xl p-5 hover:border-gold-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="p-3 bg-black rounded-lg border border-gold-500/20 text-gold-500 shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-gold-500 transition-colors">{res.title}</h3>
                      <span className="px-2 py-0.5 bg-gold-500/10 text-gold-400 text-[10px] font-bold uppercase rounded border border-gold-500/20">{res.category}</span>
                    </div>
                    {res.description && <p className="text-gray-400 text-sm">{res.description}</p>}
                    <p className="text-xs text-gray-500">
                      <span className="uppercase">{res.file_type}</span> • {res.file_size || 'Unknown'}
                    </p>
                  </div>
                </div>
                <a href={res.file_url} download target="_blank" rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all text-sm flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-[#1A1A1A] border border-gold-500/10 rounded-xl p-5 flex items-start gap-3 text-sm text-gray-400">
          <Info className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
          <p>
            All financial audits, compliance reports, and program updates are maintained here.
            For specific queries, please <a href="/contact" className="text-gold-400 hover:underline">contact us</a>.
          </p>
        </div>
      </div>
    </main>
  )
}