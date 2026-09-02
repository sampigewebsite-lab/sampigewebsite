'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Users as UsersIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'

interface TeamMember {
  id: string
  name: string
  designation: string
  bio: string
  photo: string
  active: boolean
  display_order: number
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase =  createClient()

  useEffect(() => {
    checkAuth()
    fetchMembers()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
    }
  }

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      toast.error('Failed to fetch team members')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Team member deleted successfully')
      fetchMembers()
    } catch (error) {
      toast.error('Failed to delete team member')
    }
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ active: !currentActive })
        .eq('id', id)

      if (error) throw error
      toast.success(`Member ${!currentActive ? 'activated' : 'deactivated'}`)
      fetchMembers()
    } catch (error) {
      toast.error('Failed to update member')
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Team Members</h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">Manage your NGO team</p>
            </div>
            <button
              onClick={() => router.push('/admin/team/create')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all hover:scale-[1.02]"
            >
              <Plus className="h-5 w-5" />
              Add Member
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 bg-[#1A1A1A] rounded-xl border border-gold-500/10">
              <UsersIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No team members found</p>
              <button
                onClick={() => router.push('/admin/team/create')}
                className="mt-4 text-gold-500 hover:text-gold-400 transition-colors"
              >
                Add your first team member ?
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 hover:border-gold-500/30 transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-gold-500/20"
                      />
                    ) : (
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#2A2A2A] flex items-center justify-center">
                        <UsersIcon className="h-7 w-7 md:h-8 md:w-8 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-semibold text-white truncate">{member.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{member.designation || 'Team Member'}</p>
                    </div>
                  </div>

                  {member.bio && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{member.bio}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gold-500/10">
                    <button
                      onClick={() => toggleActive(member.id, member.active)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        member.active
                          ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                      }`}
                    >
                      {member.active ? 'Active' : 'Inactive'}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/team/edit/${member.id}`)}
                        className="p-2 text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Sidebar />
    </div>
  )
}
