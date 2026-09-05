import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  return 'https://sampigewebsite.vercel.app'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const currentDate = new Date()

  // 1. Static Core Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/get-involved/donate`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/get-involved/volunteer`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  try {
    const supabase = await createClient()

    // 2. Dynamic Projects from Supabase
    const { data: projects } = await supabase
      .from('projects')
      .select('slug, updated_at, created_at')
      .eq('published', true)

    const projectRoutes: MetadataRoute.Sitemap = (projects || []).map(
      (item: { slug: string; updated_at?: string; created_at?: string }) => ({
        url: `${baseUrl}/projects/${item.slug}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    )

    // 3. Dynamic Blogs from Supabase (news table)
    const { data: blogs } = await supabase
      .from('news')
      .select('slug, updated_at, created_at')
      .eq('published', true)

    const blogRoutes: MetadataRoute.Sitemap = (blogs || []).map(
      (item: { slug: string; updated_at?: string; created_at?: string }) => ({
        url: `${baseUrl}/blogs/${item.slug}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    )

    // 4. Dynamic Events from Supabase
    const { data: events } = await supabase
      .from('events')
      .select('slug, updated_at, created_at')
      .eq('published', true)

    const eventRoutes: MetadataRoute.Sitemap = (events || []).map(
      (item: { slug: string; updated_at?: string; created_at?: string }) => ({
        url: `${baseUrl}/events/${item.slug}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : currentDate,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    )

    // 5. Dynamic Gallery Albums from Supabase
    const { data: albums } = await supabase
      .from('gallery_albums')
      .select('slug, created_at')

    const galleryRoutes: MetadataRoute.Sitemap = (albums || []).map(
      (item: { slug: string; created_at?: string }) => ({
        url: `${baseUrl}/gallery/${item.slug}`,
        lastModified: item.created_at ? new Date(item.created_at) : currentDate,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    )

    // 6. Dynamic Custom CMS Pages
    const { data: pages } = await supabase
      .from('pages')
      .select('slug, updated_at, created_at')
      .eq('published', true)

    const customPageRoutes: MetadataRoute.Sitemap = (pages || []).map(
      (item: { slug: string; updated_at?: string; created_at?: string }) => ({
        url: `${baseUrl}/${item.slug}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : currentDate,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    )

    return [
      ...staticRoutes,
      ...projectRoutes,
      ...blogRoutes,
      ...eventRoutes,
      ...galleryRoutes,
      ...customPageRoutes,
    ]
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error)
    return staticRoutes
  }
}