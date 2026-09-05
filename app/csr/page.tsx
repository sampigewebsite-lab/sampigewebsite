import PageHero from '@/components/PageHero'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CSR Partnerships',
  description: 'Partner with Sampige Foundation to fulfill your Corporate Social Responsibility goals and create lasting community impact.',
}

export default function CSRPage() {
  return (
    <main className="flex-1 bg-black min-h-screen">
      <PageHero
        badge="Corporate Partnerships"
        title="CSR Partnerships"
        description="Join hands with Sampige Foundation to drive meaningful social change. Together, we can align your corporate values with impactful grassroots initiatives."
        backgroundImage="https://images.unsplash.com/photo-1556761175-5973dc0f32d7?q=80&w=2000&auto=format&fit=crop"
        stats={[
          { value: '12+', label: 'Active Projects' },
          { value: '100%', label: 'Transparency' },
          { value: '80G', label: 'Tax Exemption' },
        ]}
      />

      {/* Temporary Placeholder Section until you tell me the layout you want */}
      <section className="py-20 container mx-auto px-4 max-w-5xl">
        <div className="bg-[#1A1A1A] rounded-2xl p-8 md:p-12 border border-gold-500/10 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            CSR Layout Coming Soon
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            This page is ready! Let me know how you want this dedicated CSR page to be designed, and we will build out the sections here.
          </p>
        </div>
      </section>
    </main>
  )
}