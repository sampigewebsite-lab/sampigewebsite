'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit3, Trash2, ExternalLink, Eye, EyeOff, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'

export default function AdminSeoServices() {
  const supabase = createClient()
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadServices = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('seo_services')
      .select('*')
      .order('created_at', { ascending: false })
    setServices(data || [])
    setLoading(false)
  }

  useEffect(() => { loadServices() }, [])

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from('seo_services').update({ published: !current }).eq('id', id)
    toast.success(!current ? 'Page published!' : 'Page unpublished')
    loadServices()
  }

  const deleteService = async (id: string, slug: string) => {
    if (!confirm(`Delete SEO page "${slug}"? This cannot be undone.`)) return
    await supabase.from('seo_services').delete().eq('id', id)
    toast.success('Page deleted')
    loadServices()
  }

  return (
    <div className="flex min-h-screen bg-black text-white w-full justify-between">
      <main className="flex-1 min-w-0 p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">🔍 SEO Landing Pages</h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage keyword landing pages (Photo frames, Temple waste, CSR partners, etc.). Auto-generated schema & sitemap.
            </p>
          </div>
          <Link
            href="/admin/seo-services/edit/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-black font-bold rounded-full hover:bg-gold-400 transition-all text-sm shadow-lg shadow-gold-500/20"
          >
            <Plus className="h-4 w-4" /> Create New SEO Page
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading SEO Landing Pages...</p>
        ) : services.length === 0 ? (
          <div className="bg-[#1A1A1A] rounded-2xl p-12 border border-gold-500/10 text-center">
            <Search className="h-12 w-12 text-gold-500/30 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">No SEO Pages Configured</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Create your first keyword landing page to start ranking #1 for custom local searches.
            </p>
            <Link
              href="/admin/seo-services/edit/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-black font-bold rounded-full text-sm"
            >
              <Plus className="h-4 w-4" /> Create First Page
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="bg-[#111111] rounded-2xl border border-gold-500/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gold-500/25 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-bold text-lg truncate">{svc.hero_heading || svc.meta_title}</h3>
                    {svc.published ? (
                      <span className="px-2.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold rounded-full flex items-center gap-1">
                        <Eye className="h-3 w-3" /> Live
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-gray-500/10 text-gray-400 border border-gray-500/20 text-xs font-bold rounded-full flex items-center gap-1">
                        <EyeOff className="h-3 w-3" /> Draft
                      </span>
                    )}
                  </div>
                  <p className="text-gold-500/80 text-xs font-mono">
                    /services/{svc.slug}
                    {svc.related_project_slug && (
                      <span className="ml-3 text-gray-400">
                        → Project: /projects/{svc.related_project_slug}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-1">{svc.meta_description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {svc.published && (
                    <a
                      href={`/services/${svc.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gold-500 transition-colors"
                      title="View Live Page"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => togglePublish(svc.id, svc.published)}
                    className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                    title={svc.published ? 'Unpublish' : 'Publish'}
                  >
                    {svc.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <Link
                    href={`/admin/seo-services/edit/${svc.id}`}
                    className="p-2 text-gray-400 hover:text-gold-500 transition-colors"
                    title="Edit Page"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => deleteService(svc.id, svc.slug)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete Page"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Sidebar />
    </div>
  )
}