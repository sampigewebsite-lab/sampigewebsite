'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  LayoutDashboard, 
  FolderTree, 
  Users, 
  LogOut, 
  Image,
  FileText,
  Settings,
  Tag,
  Calendar,
  Newspaper,
  Menu,
  X,
  Inbox,
  FileDown,
  Layout,
  Sparkles
} from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: FolderTree, label: 'Projects', href: '/admin/projects' },
    { icon: Tag, label: 'Categories', href: '/admin/categories' },
    { icon: Users, label: 'Team', href: '/admin/team' },
    { icon: Image, label: 'Gallery', href: '/admin/gallery' },
    { icon: Newspaper, label: 'Blogs', href: '/admin/news' },
    { icon: Calendar, label: 'Events', href: '/admin/events' },
    { icon: FileDown, label: 'Resources', href: '/admin/resources' },
    { icon: Inbox, label: 'Submissions', href: '/admin/submissions' },
    { icon: Sparkles, label: '#BeTheChange', href: '/admin/be-the-change' },
    { icon: FileText, label: 'Pages', href: '/admin/pages' },
    { icon: Layout, label: 'Page Heroes', href: '/admin/page-heroes' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/admin/login')
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between mb-8">
        <span className="text-gold-500 font-bold text-xl">SAMPIGE</span>
        {isMobile && (
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          
          return (
            <a
              key={item.label}
              href={item.href}
              onClick={() => isMobile && setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                isActive
                  ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0 text-gold-500" />
              <span className="truncate">{item.label}</span>
            </a>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors w-full mt-4 border-t border-gold-500/10 pt-4"
      >
        <LogOut className="h-5 w-5 flex-shrink-0" />
        <span>Logout</span>
      </button>
    </>
  )

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 right-4 z-50 p-2 bg-[#1A1A1A] rounded-lg border border-gold-500/10 text-gray-400 hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </button>

        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/70 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}

        <aside className={`fixed top-0 right-0 h-full w-64 bg-[#0A0A0A] border-l border-gold-500/10 p-6 flex flex-col z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <SidebarContent />
        </aside>
      </>
    )
  }

  return (
    <aside className="w-64 bg-[#0A0A0A] border-l border-gold-500/10 min-h-screen p-6 flex flex-col sticky top-0 flex-shrink-0 order-last">
      <SidebarContent />
    </aside>
  )
}