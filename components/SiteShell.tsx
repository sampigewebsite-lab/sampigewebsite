'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  // On Admin routes: hide public header & footer
  if (isAdmin) {
    return <>{children}</>
  }

  // On Public routes: show header & footer
  return (
    <>
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  )
}