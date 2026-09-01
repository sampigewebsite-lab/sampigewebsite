export interface Project {
  id: string
  title: string
  slug: string
  short_description: string | null
  description: string | null
  problem: string | null
  approach: string | null
  category_id: string | null
  status: 'ongoing' | 'completed' | 'upcoming' | 'paused'
  location: string | null
  start_date: string | null
  end_date: string | null
  cover_image: string | null
  budget: number | null
  beneficiaries: number | null
  impact_summary: string | null
  featured: boolean
  published: boolean
  seo_title: string | null
  seo_description: string | null
  og_image: string | null
  created_at: string
  updated_at: string
  category?: ProjectCategory
  objectives?: ProjectObjective[]
  metrics?: ProjectMetric[]
  timeline?: ProjectTimeline[]
  gallery?: ProjectGallery[]
  updates?: ProjectUpdate[]
  documents?: ProjectDocument[]
}

export interface ProjectCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  display_order: number
  active: boolean
}

export interface ProjectObjective {
  id: string
  project_id: string
  title: string
  description: string | null
  display_order: number
}

export interface ProjectMetric {
  id: string
  project_id: string
  label: string
  value: string
  icon: string | null
  display_order: number
}

export interface ProjectTimeline {
  id: string
  project_id: string
  date: string
  title: string
  description: string | null
  image: string | null
  display_order: number
}

export interface ProjectGallery {
  id: string
  project_id: string
  image_url: string
  caption: string | null
  display_order: number
}

export interface ProjectUpdate {
  id: string
  project_id: string
  title: string
  slug: string
  content: string
  cover_image: string | null
  published_at: string
  published: boolean
  created_at: string
  updated_at: string
}

export interface ProjectDocument {
  id: string
  project_id: string
  title: string
  file_url: string
  file_type: string | null
  description: string | null
  created_at: string
}

export interface TeamMember {
  id: string
  name: string
  designation: string | null
  bio: string | null
  photo: string | null
  linkedin: string | null
  instagram: string | null
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface Testimonial {
  id: string
  name: string
  designation: string | null
  content: string
  photo: string | null
  display_order: number
  active: boolean
  created_at: string
}

export interface Partner {
  id: string
  name: string
  logo: string
  website: string | null
  description: string | null
  display_order: number
  active: boolean
  created_at: string
}

export interface ImpactStatistic {
  id: string
  title: string
  value: string
  icon: string | null
  description: string | null
  display_order: number
  active: boolean
  updated_at: string
}

export interface SiteSettings {
  organization: {
    name: string
    tagline: string
    description: string
    email: string
    phone: string
    address: string
  }
  social: {
    instagram: string
    facebook: string
    linkedin: string
    youtube: string
    twitter: string
  }
  general: {
    favicon: string
    logo: string
    default_og_image: string
    google_analytics_id: string
  }
  donation: {
    upi_id: string
    bank_details: string
    qr_code: string
    payment_gateway: string
    donation_url: string
  }
}