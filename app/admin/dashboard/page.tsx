'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'  // Use client
import { 
  Plus, 
  FolderTree, 
  Users, 
  Image, 
  Tag, 
  FileText, 
  Settings, 
  Calendar, 
  Newspaper,
  TrendingUp
} from 'lucide-react'
import Sidebar from '@/components/admin/Sidebar'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [stats, setStats] = useState({
    projects: 0,
    team: 0,
    volunteers: 0,
    contacts: 0,
  })
  const router = useRouter()
  const supabase = createClient()  // No await needed

  useEffect(() => {
    checkAuth()
    fetchStats()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin/login')
        return
      }
      setUserEmail(session.user.email || '')
      setLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin/login')
    }
  }

  const fetchStats = async () => {
    try {
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
      
      const { count: teamCount } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
      
      const { count: volunteerCount } = await supabase
        .from('volunteer_submissions')
        .select('*', { count: 'exact', head: true })
      
      const { count: contactCount } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })

      setStats({
        projects: projectCount || 0,
        team: teamCount || 0,
        volunteers: volunteerCount || 0,
        contacts: contactCount || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold-500 text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-base">Welcome back, {userEmail}!</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 hover:border-gold-500/30 transition-all">
              <div className="text-xl md:text-2xl font-bold text-gold-500 mb-1 md:mb-2">{stats.projects}</div>
              <p className="text-gray-400 text-sm md:text-base">Total Projects</p>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 hover:border-gold-500/30 transition-all">
              <div className="text-xl md:text-2xl font-bold text-blue-500 mb-1 md:mb-2">{stats.team}</div>
              <p className="text-gray-400 text-sm md:text-base">Team Members</p>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 hover:border-gold-500/30 transition-all">
              <div className="text-xl md:text-2xl font-bold text-green-500 mb-1 md:mb-2">{stats.volunteers}</div>
              <p className="text-gray-400 text-sm md:text-base">Volunteers</p>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 hover:border-gold-500/30 transition-all">
              <div className="text-xl md:text-2xl font-bold text-purple-500 mb-1 md:mb-2">{stats.contacts}</div>
              <p className="text-gray-400 text-sm md:text-base">Enquiries</p>
            </div>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <a href="/admin/projects/create" className="flex items-center justify-center gap-2 p-3 md:p-4 bg-black rounded-lg border border-gold-500/10 hover:border-gold-500/30 transition-all hover:scale-[1.02]">
                <Plus className="h-4 w-4 md:h-5 md:w-5 text-gold-500" />
                <p className="text-white text-sm md:text-base font-medium">Add Project</p>
              </a>
              <a href="/admin/categories" className="flex items-center justify-center gap-2 p-3 md:p-4 bg-black rounded-lg border border-gold-500/10 hover:border-gold-500/30 transition-all hover:scale-[1.02]">
                <Tag className="h-4 w-4 md:h-5 md:w-5 text-gold-500" />
                <p className="text-white text-sm md:text-base font-medium">Categories</p>
              </a>
              <a href="/admin/team/create" className="flex items-center justify-center gap-2 p-3 md:p-4 bg-black rounded-lg border border-gold-500/10 hover:border-gold-500/30 transition-all hover:scale-[1.02]">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-gold-500" />
                <p className="text-white text-sm md:text-base font-medium">Add Team Member</p>
              </a>
              <a href="/admin/impact" className="flex items-center justify-center gap-2 p-3 md:p-4 bg-black rounded-lg border border-gold-500/10 hover:border-gold-500/30 transition-all hover:scale-[1.02]">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-gold-500" />
                <p className="text-white text-sm md:text-base font-medium">Impact Stats</p>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Sidebar />
    </div>
  )
}