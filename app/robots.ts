import type { MetadataRoute } from 'next'

const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sampigefoundation.com'
  
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://')
  }
  if (!url.startsWith('https://')) {
    url = `https://${url}`
  }
  
  if (url.includes('sampigefoundation.com') && !url.includes('www.sampigefoundation.com')) {
    url = url.replace('sampigefoundation.com', 'www.sampigefoundation.com')
  }
  
  return url.replace(/\/$/, '')
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/admin/*', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}