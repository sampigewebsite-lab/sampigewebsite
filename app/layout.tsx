import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import SiteShell from '@/components/SiteShell'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata(): Promise<Metadata> {
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
    const name = org?.value?.name || 'Sampige'
    const tagline = org?.value?.tagline || 'Creating Change. Building Hope.'

    return {
      title: `${name} - ${tagline}`,
      description:
        org?.value?.description ||
        'Sampige is a non-profit organization working towards community development and social change.',
      icons: favicon
        ? { icon: favicon, shortcut: favicon, apple: favicon }
        : { icon: '/favicon.ico' },
    }
  } catch {
    return {
      title: 'Sampige - Creating Change. Building Hope.',
      description:
        'Sampige is a non-profit organization working towards community development and social change.',
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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