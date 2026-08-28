/**
 * Hand-written mirror of the Supabase schema defined in `supabase/migrations`.
 * Regenerate with `supabase gen types typescript` once the project is linked
 * to a live Supabase instance, then this file can be replaced automatically.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type RegistrationStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Registration {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  city: string
  country: string
  nationality: string | null
  phone: string
  email: string
  status: RegistrationStatus
  fee_amount: number
  fee_currency: string
  stripe_session_id: string | null
  stripe_payment_intent: string | null
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  published: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Sponsor {
  id: string
  name: string
  logo_url: string
  website_url: string | null
  tier: 'platinum' | 'gold' | 'silver' | 'partner'
  display_order: number
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string | null
  author: string
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export type UserRole = 'user' | 'admin' | 'superadmin'
export type AdminRole = UserRole

export interface Profile {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface SiteSettings {
  id: number
  championship_location: string
  championship_dates: string
  championship_dates_start: string
  championship_dates_end: string
  announcement_text: string
  announcement_cta: string
  contact_email: string
  contact_phone: string
  contact_address: string
  site_name: string
  website_url: string
  logo_url: string
  footer_tagline: string
  social_twitter: string
  social_instagram: string
  social_facebook: string
  social_youtube: string
  hero_eyebrow: string
  hero_title: string
  hero_subtitle: string
  final_cta_title: string
  final_cta_subtitle: string
  about_teaser: string
  /** Future / custom key-value pairs — add fields in siteSettingsFields with storage: 'extras' */
  extras: Record<string, string>
  updated_at: string
}

export interface SiteStatRow {
  id: string
  label: string
  sublabel: string | null
  value: number
  suffix: string
  display_order: number
  created_at: string
}

export interface FeatureRow {
  id: string
  icon: string
  title: string
  description: string
  display_order: number
  created_at: string
}

export interface FaqRow {
  id: string
  question: string
  answer: string
  published: boolean
  display_order: number
  created_at: string
}

export interface TestimonialRow {
  id: string
  quote: string
  name: string
  role: string
  avatar_initials: string
  published: boolean
  display_order: number
  created_at: string
}

export interface TimelineRow {
  id: string
  quarter: string
  title: string
  items: string[]
  status: 'done' | 'active' | 'upcoming'
  display_order: number
  created_at: string
}

export interface CmsPage {
  id: string
  slug: string
  title: string
  body: string
  updated_at: string
}

export interface SportsGameRow {
  id: string
  title: string
  provider: string
  category: string
  variant: 'original' | 'portrait'
  gradient: string
  accent: string | null
  badge: string | null
  image_url: string | null
  display_order: number
  published: boolean
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  read: boolean
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      registrations: {
        Row: Registration
        Insert: Partial<Registration> &
          Pick<
            Registration,
            'first_name' | 'last_name' | 'date_of_birth' | 'city' | 'country' | 'phone' | 'email'
          >
        Update: Partial<Registration>
      }
      videos: {
        Row: Video
        Insert: Partial<Video> & Pick<Video, 'title' | 'video_url'>
        Update: Partial<Video>
      }
      sponsors: {
        Row: Sponsor
        Insert: Partial<Sponsor> & Pick<Sponsor, 'name' | 'logo_url'>
        Update: Partial<Sponsor>
      }
      blog_posts: {
        Row: BlogPost
        Insert: Partial<BlogPost> & Pick<BlogPost, 'title' | 'slug' | 'excerpt' | 'content' | 'author'>
        Update: Partial<BlogPost>
      }
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & Pick<Profile, 'id' | 'email' | 'role'>
        Update: Partial<Profile>
      }
      site_settings: {
        Row: SiteSettings
        Insert: Partial<SiteSettings>
        Update: Partial<SiteSettings>
      }
      site_stats: {
        Row: SiteStatRow
        Insert: Partial<SiteStatRow> & Pick<SiteStatRow, 'label' | 'value'>
        Update: Partial<SiteStatRow>
      }
      site_features: {
        Row: FeatureRow
        Insert: Partial<FeatureRow> & Pick<FeatureRow, 'title' | 'description'>
        Update: Partial<FeatureRow>
      }
      faqs: {
        Row: FaqRow
        Insert: Partial<FaqRow> & Pick<FaqRow, 'question' | 'answer'>
        Update: Partial<FaqRow>
      }
      testimonials: {
        Row: TestimonialRow
        Insert: Partial<TestimonialRow> & Pick<TestimonialRow, 'quote' | 'name' | 'role'>
        Update: Partial<TestimonialRow>
      }
      timeline_items: {
        Row: TimelineRow
        Insert: Partial<TimelineRow> & Pick<TimelineRow, 'quarter' | 'title'>
        Update: Partial<TimelineRow>
      }
      cms_pages: {
        Row: CmsPage
        Insert: Partial<CmsPage> & Pick<CmsPage, 'slug' | 'title' | 'body'>
        Update: Partial<CmsPage>
      }
      sports_games: {
        Row: SportsGameRow
        Insert: Partial<SportsGameRow> & Pick<SportsGameRow, 'id' | 'title' | 'category'>
        Update: Partial<SportsGameRow>
      }
      contact_messages: {
        Row: ContactMessage
        Insert: Partial<ContactMessage> & Pick<ContactMessage, 'name' | 'email' | 'message'>
        Update: Partial<ContactMessage>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      save_site_settings: {
        Args: { data: Json }
        Returns: SiteSettings
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_my_registration: {
        Args: Record<PropertyKey, never>
        Returns: Registration
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
