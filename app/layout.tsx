import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import SiteShell from '@/components/SiteShell'
import { createClient } from '@/lib/supabase/server'

// Automatically gets the live domain (switches seamlessly when you add sampigefoundation.com)
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
      'Sampige Foundation is a non-profit organization dedicated to transforming lives through education, healthcare, and sustainable community development.'

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
        'Charity Karnataka',
        'Community Development',
        'Education NGO',
        'Healthcare Non-profit',
        'Volunteer Karnataka',
        'Donate NGO India',
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
        'Sampige Foundation is a non-profit organization dedicated to transforming lives through education, healthcare, and sustainable community development.',
      robots: {
        index: true,
        follow: true,
      },
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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