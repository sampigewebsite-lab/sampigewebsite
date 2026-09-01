import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Sampige - Creating Change. Building Hope.',
  description: 'Sampige is a non-profit organization working towards community development and social change.',
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
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black text-white font-sans antialiased">
        {children}
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