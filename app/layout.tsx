import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import SiteShell from '@/components/SiteShell'
import { createClient } from '@/lib/supabase/server'

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  return 'https://sampigewebsite.vercel.app'
}

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getBaseUrl()

  try {
    const supabase = await createClient()

    const { data: general } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'general')
      .single()

    const { data: org } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'organization')
      .single()

    const favicon = general?.value?.favicon
    const logo = general?.value?.logo
    const name = org?.value?.name || 'Sampige Foundation'
    const tagline = org?.value?.tagline || 'Creating Change. Building Hope.'
    const description =
      org?.value?.description ||
      'Sampige Foundation is a non-profit organization in Malleshwaram, Bangalore dedicated to transforming lives through education, healthcare, sustainable development, photo frame recycling, and eco-friendly waste disposal.'

    const defaultTitle = `${name} — ${tagline}`

    return {
      metadataBase: new URL(siteUrl),
      title: {
        default: defaultTitle,
        template: `%s | ${name}`,
      },
      description,
      keywords: [
        'Sampige Foundation',
        'NGO India',
        'NGO Bangalore',
        'NGO Malleshwaram',
        'Charity Karnataka',
        'Community Development',
        'Education NGO',
        'Healthcare Non-profit',
        'Volunteer Karnataka',
        'Donate NGO India',
        'photo frame recycling',
        'recycle frames',
        'recycle frames Malleshwaram',
        'photo frame disposal Bangalore',
        'old photo frame recycling',
        'god frame recycling',
        'divine items disposal',
        'photo frame recycling near me',
        'frame recycling Bangalore',
        'eco-friendly waste disposal Bangalore',
        'e-waste recycling Bangalore',
        'corporate social responsibility Bangalore',
        'CSR activities Bangalore',
      ],
      authors: [{ name: name }],
      creator: name,
      publisher: name,
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      icons: favicon
        ? {
            icon: favicon,
            shortcut: favicon,
            apple: favicon,
          }
        : {
            icon: '/favicon.ico',
          },
      openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: siteUrl,
        siteName: name,
        title: defaultTitle,
        description,
        images: logo
          ? [
              {
                url: logo,
                width: 1200,
                height: 630,
                alt: name,
              },
            ]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: defaultTitle,
        description,
        images: logo ? [logo] : [],
      },
    }
  } catch (error) {
    return {
      metadataBase: new URL(siteUrl),
      title: {
        default: 'Sampige Foundation — Creating Change. Building Hope.',
        template: '%s | Sampige Foundation',
      },
      description:
        'Sampige Foundation is a non-profit organization in Malleshwaram, Bangalore dedicated to transforming lives through education, healthcare, sustainable development, and photo frame recycling.',
      robots: {
        index: true,
        follow: true,
      },
    }
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteUrl = getBaseUrl()
  const supabase = await createClient()

  // Dynamic values loaded directly from Supabase for JSON-LD Schemas
  let name = 'Sampige Foundation'
  let tagline = 'Creating Change. Building Hope.'
  let email = 'info@sampigefoundation.org'
  let phone = '+91 1234567890'
  let address = 'Malleshwaram, Bangalore, Karnataka, India'
  let logo = `${siteUrl}/logo.png`
  let socials: string[] = []

  try {
    const [orgData, socialData, generalData] = await Promise.all([
      supabase.from('site_settings').select('value').eq('key', 'organization').single(),
      supabase.from('site_settings').select('value').eq('key', 'social').single(),
      supabase.from('site_settings').select('value').eq('key', 'general').single(),
    ])

    if (orgData.data?.value) {
      name = orgData.data.value.name || name
      tagline = orgData.data.value.tagline || tagline
      email = orgData.data.value.email || email
      phone = orgData.data.value.phone || phone
      address = orgData.data.value.address || address
    }

    if (generalData.data?.value?.logo) {
      logo = generalData.data.value.logo
    }

    if (socialData.data?.value) {
      const s = socialData.data.value
      if (s.facebook) socials.push(s.facebook)
      if (s.instagram) socials.push(s.instagram)
      if (s.linkedin) socials.push(s.linkedin)
      if (s.twitter) socials.push(s.twitter)
      if (s.youtube) socials.push(s.youtube)
    }
  } catch (error) {
    console.error('Error fetching layout schema settings:', error)
  }

  // JSON-LD Structured Data for Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NGO',
        '@id': `${siteUrl}/#organization`,
        name,
        url: siteUrl,
        logo,
        description: `${name} is a registered NGO in Malleshwaram, Bangalore working on education, healthcare, environmental sustainability, photo frame recycling, divine items disposal, and community development. Tagline: ${tagline}`,
        foundingDate: '2019',
        sameAs: socials,
        address: {
          '@type': 'PostalAddress',
          streetAddress: address,
          addressLocality: 'Bangalore',
          addressRegion: 'Karnataka',
          postalCode: '560003',
          addressCountry: 'IN',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: phone,
          contactType: 'customer service',
          email: email,
          areaServed: 'IN',
          availableLanguage: ['English', 'Kannada', 'Hindi'],
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${siteUrl}/#localbusiness`,
        name: `${name} — Photo Frame Recycling & Eco Disposal`,
        image: logo,
        url: `${siteUrl}/services/photo-frame-recycling-bangalore`,
        telephone: phone,
        priceRange: 'Free',
        description: `Free photo frame recycling and divine items disposal service by ${name} in Malleshwaram, Bangalore. We collect, sort, and eco-friendly recycle old wooden, metal, plastic, and glass photo frames.`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: address,
          addressLocality: 'Bangalore',
          addressRegion: 'Karnataka',
          postalCode: '560003',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 12.9833,
          longitude: 77.5667,
        },
        areaServed: [
          {
            '@type': 'City',
            name: 'Bangalore',
          },
          {
            '@type': 'Place',
            name: 'Malleshwaram',
          },
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Recycling & Disposal Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Photo Frame Recycling',
                description:
                  'Eco-friendly recycling of old wooden, metal, plastic, and glass photo frames in Bangalore.',
                areaServed: 'Bangalore, Karnataka',
                provider: {
                  '@id': `${siteUrl}/#organization`,
                },
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Divine Items & God Frame Disposal',
                description:
                  'Respectful and eco-friendly disposal of old god photo frames, divine idols, and religious items in Bangalore.',
                areaServed: 'Bangalore, Karnataka',
                provider: {
                  '@id': `${siteUrl}/#organization`,
                },
              },
            },
          ],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name,
        description: `Official website of ${name} — NGO in Malleshwaram, Bangalore.`,
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        inLanguage: 'en-IN',
      },
    ],
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Dynamic JSON-LD Structured Data for Google SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-black text-white font-sans antialiased flex flex-col min-h-screen">
        <SiteShell>{children}</SiteShell>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#FAFAFA',
              border: '1px solid #FFB300',
            },
          }}
        />
      </body>
    </html>
  )
}