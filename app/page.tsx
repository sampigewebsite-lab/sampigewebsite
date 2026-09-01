import Link from 'next/link'
import { ArrowRight, Heart, Users, TreePine, Utensils, Sparkles } from 'lucide-react'

export default function Home() {
  // Default stats for now
  const stats = [
    { title: 'People Supported', value: '15,000+', icon: Users },
    { title: 'Meals Distributed', value: '100,000+', icon: Utensils },
    { title: 'Trees Planted', value: '3,000+', icon: TreePine },
    { title: 'Active Volunteers', value: '1,000+', icon: Heart },
  ]

  return (
    <main className="bg-black min-h-screen">
      {/* Hero Section - Gold Theme */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0A] to-[#1A0A00]"></div>
        
        {/* Gold Accent Circles */}
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-gold-500/5 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-gold-600/5 blur-3xl"></div>
        
        <div className="container mx-auto px-4 py-32 relative z-10">
          <div className="max-w-3xl">
            {/* Gold Sparkle */}
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-gold-500 h-6 w-6" />
              <span className="text-gold-500 font-medium tracking-wider">SAMPIGE FOUNDATION</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">Creating Change.</span>
              <br />
              <span className="gradient-text font-script">Building Hope.</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
              Sampige is committed to transforming lives through education, 
              healthcare, and sustainable development initiatives in our community.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center px-8 py-4 bg-gold-500 text-black font-semibold rounded-full hover:bg-gold-600 transition-all hover:scale-105 shadow-lg shadow-gold-500/25"
              >
                Our Projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              
              <Link
                href="/get-involved/donate"
                className="inline-flex items-center px-8 py-4 bg-transparent text-gold-500 font-semibold rounded-full border-2 border-gold-500 hover:bg-gold-500 hover:text-black transition-all hover:scale-105"
              >
                Donate Now
              </Link>
              
              <Link
                href="/get-involved/volunteer"
                className="inline-flex items-center px-8 py-4 bg-white/10 text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all hover:scale-105 backdrop-blur-sm"
              >
                Become a Volunteer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-20 bg-gradient-to-b from-black to-[#0A0A0A] border-t border-gold-500/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="gradient-text">Impact</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Every number represents a life touched, a community transformed
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold gradient-text mb-2 group-hover:scale-105 transition-transform">
                    {stat.value}
                  </div>
                  <div className="flex justify-center mb-2">
                    <IconComponent className="h-8 w-8 text-gold-500" />
                  </div>
                  <div className="text-white font-medium">{stat.title}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}