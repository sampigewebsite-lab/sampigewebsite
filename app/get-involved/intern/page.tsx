import PageHero from '@/components/PageHero'
import InternForm from '@/components/InternForm'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Intern with Us',
  description:
    'Apply for an internship at Sampige Foundation. Gain real-world experience while making a positive impact on society.',
}

export default async function InternPage() {
  const supabase = await createClient()

  const { data: internSettings } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'intern_page')
    .single()

  const { data: orgSettings } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'organization')
    .single()

  const s = internSettings?.value || {}
  const contactEmail =
    s.contact_email_override ||
    orgSettings?.value?.email ||
    'info@sampigefoundation.org'

  const stats = [
    { value: s.stat_1_value || '50+', label: s.stat_1_label || 'Past Interns' },
    { value: s.stat_2_value || '100%', label: s.stat_2_label || 'Mentorship' },
    { value: s.stat_3_value || 'Cert', label: s.stat_3_label || 'Awarded' },
  ]

  return (
    <main className="flex-1 bg-black min-h-screen pb-24">
      <PageHero
        badge={s.badge || 'Join The Team'}
        title={s.title || 'Intern With Us'}
        description={
          s.description ||
          'Kickstart your career while creating meaningful change.'
        }
        backgroundImage={s.background_image}
        stats={stats}
      />

      <section className="container mx-auto px-4 mt-20 max-w-6xl">
        <InternForm
          contactEmail={contactEmail}
          whyTitle={s.why_title}
          whyPoints={s.why_points}
          resumeTitle={s.resume_title}
          resumeDescription={s.resume_description}
        />
      </section>
    </main>
  )
}