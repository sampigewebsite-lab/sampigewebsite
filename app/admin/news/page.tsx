'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Eye, Search, Newspaper, Sparkles, Loader2 } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import Sidebar from '@/components/admin/Sidebar'

interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  published: boolean
  published_at: string
  created_at: string
}

export default function BlogsAdminPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchNews()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
    }
  }

  const fetchNews = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNews(data || [])
    } catch (error) {
      toast.error('Failed to fetch blogs')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Blog deleted successfully')
      fetchNews()
    } catch (error) {
      toast.error('Failed to delete blog')
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('news')
        .update({
          published: !currentStatus,
          published_at: !currentStatus ? new Date().toISOString() : null,
        })
        .eq('id', id)

      if (error) throw error
      toast.success(`Blog ${!currentStatus ? 'published' : 'draft saved'}`)
      fetchNews()
    } catch (error) {
      toast.error('Failed to update blog')
    }
  }

  async function seed8SEOBlogs() {
    if (!confirm('This will seed 4 pre-written Bangalore Flower Recycling SEO blog posts directly into your draft bank. Proceed?')) return
    setSeeding(true)
    
    const blogDrafts = [
      {
        title: "What to Do With Used Flowers After Pooja in Bangalore?",
        slug: "what-to-do-with-used-flowers-after-pooja-bangalore",
        excerpt: "Learn how to respectfully dispose of sacred pooja flowers in Bangalore without polluting our lakes, rivers, or streets. Discover the Pooja to Prakruthi program.",
        category: "Pooja to Prakruthi",
        content: `Every single morning, thousands of homes and temples in Bangalore offer fresh, beautiful flowers like marigolds, roses, jasmine, and chrysanthemums during their daily pooja. These offerings represent love, faith, and complete devotion.\n\nHowever, once the rituals are complete, many find themselves faced with a difficult question: What should we do with these used flowers?\n\n### The Problem: Landfills and Water Pollution\nHistorically, sacred offerings were discarded in flowing rivers or under large old trees to allow them to degrade naturally. But modern Bangalore is different. With our lakes struggling against urban pollution and municipal landfills overflowing, tossing flowers into water bodies causes massive algae blooms, blocks sunlight, and depletes vital oxygen for aquatic life.\n\nMixing sacred flowers with plastics, kitchen garbage, and hospital waste in everyday garbage bins is also deeply disrespectful.\n\n### The Solution: Return Them to the Soil\nRather than letting devotion turn into garbage, the team at Sampige Foundation has created 'Pooja to Prakruthi' - a flagship initiative to recycle sacred flower waste into high-grade organic plant compost.\n\nHere is how you can be a part of the solution:\n1. **Separate Early:** Keep a dedicated green bucket or cotton bag at home strictly for your daily pooja offerings.\n2. **Remove All Plastic:** Ensure no plastic threads, incense sticks, metal wires, or matchsticks enter your flower bag.\n3. **Use Local Collection Points:** Drop off your flower waste at a designated Sampige collection point across Bangalore.\n4. **Join the Subscription Program:** Opt for our monthly doorstep pickup service designed for apartments and independent households.\n\nLet us make Bangalore a leading example of waste management while keeping our devotional traditions intact. Join Pooja to Prakruthi today.`,
        published: false,
        author: "Sampige Team"
      },
      {
        title: "How to Recycle Old Wooden & Metal Photo Frames in Bangalore",
        slug: "how-to-recycle-old-photo-frames-bangalore",
        excerpt: "Got damaged or old deity photo frames sitting inside your attic? Here is a practical, eco-friendly guide on how to safely recycle them in Bangalore.",
        category: "Recycling Guide",
        content: `During festival seasons like Ayudha Pooja, Diwali, or Ugadi, many households upgrade or replace older, damaged deity photo frames. Over time, wood rots, glass chips, and frames break. Because they contain sacred images, throwing them in municipal garbage feels wrong, leaving many boxes gathering dust in home attics.\n\nHere is a clean, practical, and highly eco-friendly way to handle them in Bangalore.\n\n### Step 1: Disassemble With Care\nBefore recycling, carefully segregate the materials:\n- **Glass:** Gently slide out the glass cover. Glass is 100% recyclable but must be kept clean.\n- **Paper Prints:** Gently remove the printed picture. If it is severely damaged, compost it or bury it in clean garden soil.\n- **The Frame (Wood or Metal):** Sort according to the material.\n\n### Step 2: Finding Recycling Partners\nMost dry waste collection centers (DWCC) in Bangalore accept glass and clean metals, but wooden framing elements require dedicated wood-recycling facilities.\n\nSampige Foundation regularly runs community collection drives in areas like Malleshwaram, Sadashivanagar, and Rajajinagar to accept deity frames, ensuring that metals are melted down, glass is ground safely, and wood is processed for biomass fuel or community reuse.\n\nStart sorting your storeroom today, and bring your old photo frames to our next collection drive!`,
        published: false,
        author: "Sampige Team"
      },
      {
        title: "Can Pooja Flowers Be Composted? DIY Vs Community Solutions",
        slug: "can-pooja-flowers-be-composted-bangalore",
        excerpt: "Yes, pooja flowers make fantastic organic compost. We weigh the benefits of composting them at home versus subscribing to our Bangalore community collection program.",
        category: "Composting",
        content: `The short answer is: Yes, absolutely! Pooja flowers like marigold, hibiscus, roses, and jasmine make some of the richest organic compost available. They are packed with nitrogen, which is highly beneficial for soil health.\n\nBut should you try to compost them at home, or are you better off using a community recycling system like Pooja to Prakruthi?\n\n### Option A: Composting at Home (DIY)\nIf you have a balcony or garden, home composting is highly rewarding.\n- **The Pros:** Free fertilizer for your balcony plants, and complete control over the process.\n- **The Cons:** Marigolds contain natural pest-repellent compounds that can slow down bacteria activity. Additionally, flowers hold high moisture, requiring a careful balance of dry leaves or cocopeat to prevent bad odors.\n\n### Option B: Community Recycling with Sampige\nFor apartments, busy professionals, and temples, DIY home composting is often too slow or space-limiting.\n- **The Pros:** Zero maintenance for you. We pick up, handle segregation, balance the composting mixture professionally, and turn it into rich compost on a large scale.\n- **The Cons:** Small monthly program subscription fee.\n\nBy subscribing to Pooja to Prakruthi, your household can save up to 30 kg of green waste from reaching landfills every single month!`,
        published: false,
        author: "Sampige Team"
      },
      {
        title: "How Apartments in Bangalore Can Manage Pooja Flower Waste Effectively",
        slug: "how-apartments-can-manage-pooja-flower-waste-bangalore",
        excerpt: "Discover how apartment complexes in Bangalore can easily set up community bins for pooja flower waste, reducing green waste and promoting clean living.",
        category: "Community Projects",
        content: `In high-rise apartment complexes across Bangalore, managing organic waste is a major logistical challenge. While wet kitchen waste is processed by standard digesters, sacred pooja flowers require special treatment because residents do not like throwing sacred offerings into kitchen garbage bins.\n\n### The Solution: A Dedicated Community Pooja Flower Bin\nSampige Foundation has partnered with over 25 apartment associations in Bangalore to implement simple, highly effective flower-segregation systems:\n\n1. **The Pooja Bin:** We place a beautifully marked, yellow collection bin in the common area (usually near the entrance or community temple).\n2. **Segregation Standards:** Clear signage explains that only natural flowers and leaves can enter the bin. Wires, plastic packaging, and cardboard are strictly excluded.\n3. **Weekly Sampige Pickup:** Our team visits your apartment weekly, empties the bins, and transports them to our composting yard.\n4. **Compost Returns:** Every month, Sampige returns a portion of the refined organic compost back to your apartment association to use in your community landscaping and gardens!\n\nIt is a perfect circular economy model. Contact us today to bring the Pooja to Prakruthi program to your apartment complex.`,
        published: false,
        author: "Sampige Team"
      }
    ]

    try {
      const { error } = await supabase.from('news').insert(blogDrafts)
      if (error) throw error
      toast.success('Successfully seeded 4 Bangalore Flower Recycling SEO drafts! Refreshing...')
      fetchNews()
    } catch (e: any) {
      toast.error(e.message || 'Error seeding blogs')
    } finally {
      setSeeding(false)
    }
  }

  const filteredNews = news.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto text-gray-200">
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Blogs & Stories</h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">Manage blog posts, stories, and SEO visibility.</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={seed8SEOBlogs}
                disabled={seeding}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-md"
              >
                {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Seed 4 Flagship SEO Drafts
              </button>
              
              <button
                onClick={() => router.push('/admin/news/create')}
                className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition-all"
              >
                <Plus className="h-5 w-5" />
                Add Blog
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-gold-500/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#FFB300] mx-auto mb-2" />
              Loading...
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12 bg-[#1A1A1A] rounded-xl border border-gold-500/10">
              <Newspaper className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No blog posts found</p>
              <p className="text-gray-500 text-xs mt-1">Click the 'Seed' button above to load templates instantly!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {filteredNews.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gold-500/10 hover:border-gold-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">{item.title}</h3>
                      {item.category && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gold-500/20 text-gold-500 text-xs rounded-full">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => togglePublish(item.id, item.published)}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all ml-2 flex-shrink-0 ${
                        item.published
                          ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30 border border-green-500/30'
                          : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/20'
                      }`}
                    >
                      {item.published ? 'Published' : 'Draft'}
                    </button>
                  </div>

                  {item.excerpt && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.excerpt}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gold-500/10">
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/news/edit/${item.id}`)}
                        className="p-2 text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <a
                        href={`/blogs/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}