import { createClient } from '@/lib/supabase/server'

export interface PageHeroData {
  badge?: string | null
  title: string
  description?: string | null
  background_image?: string | null
  stat_1_value?: string | null
  stat_1_label?: string | null
  stat_2_value?: string | null
  stat_2_label?: string | null
  stat_3_value?: string | null
  stat_3_label?: string | null
  stat_4_value?: string | null
  stat_4_label?: string | null
}

export async function getPageHero(pageKey: string): Promise<PageHeroData | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('page_heroes')
      .select('*')
      .eq('page_key', pageKey)
      .single()

    return data
  } catch {
    return null
  }
}

export function heroToStats(data: PageHeroData | null) {
  if (!data) return []
  return [
    { value: data.stat_1_value || '', label: data.stat_1_label || '' },
    { value: data.stat_2_value || '', label: data.stat_2_label || '' },
    { value: data.stat_3_value || '', label: data.stat_3_label || '' },
    { value: data.stat_4_value || '', label: data.stat_4_label || '' },
  ]
}