/**
 * Field registry for Admin Site Settings.
 * Add a new field here → it appears in Admin and can drive the public site.
 * - storage: 'column' = site_settings column (requires SQL column / save_site_settings RPC)
 * - storage: 'extras' = stored in site_settings.extras jsonb (no migration needed)
 */
export type SiteSettingFieldType = 'text' | 'email' | 'url' | 'tel' | 'textarea' | 'date' | 'image'

export type SiteSettingFieldDef = {
  key: string
  label: string
  section: string
  type: SiteSettingFieldType
  storage: 'column' | 'extras'
  rows?: number
  hint?: string
}

export const SITE_SETTING_SECTIONS = [
  'Website',
  'Contact',
  'Social',
  'Prizes',
  'Championship',
  'Announcement',
  'Hero',
  'About & CTA',
  'Custom',
] as const

export const SITE_SETTING_FIELDS: SiteSettingFieldDef[] = [
  { key: 'site_name', label: 'Site / brand name', section: 'Website', type: 'text', storage: 'column' },
  { key: 'website_url', label: 'Website URL', section: 'Website', type: 'url', storage: 'column' },
  { key: 'logo_url', label: 'Logo', section: 'Website', type: 'image', storage: 'column', hint: 'Shown in header & footer when set.' },
  { key: 'footer_tagline', label: 'Footer tagline', section: 'Website', type: 'textarea', storage: 'column', rows: 3 },

  { key: 'contact_email', label: 'Public contact email', section: 'Contact', type: 'email', storage: 'column', hint: 'Shown on the website. Default: Info@HCheckers.org' },
  { key: 'contact_phone', label: 'Phone', section: 'Contact', type: 'tel', storage: 'column' },
  { key: 'contact_address', label: 'Address', section: 'Contact', type: 'textarea', storage: 'column', rows: 2 },
  { key: 'registration_from_email', label: 'Registration from-email', section: 'Contact', type: 'email', storage: 'extras', hint: 'Paid players receive confirmation from this address. Default: Admin@HCheckers.org' },
  { key: 'registration_admin_email', label: 'Admin registration notify email', section: 'Contact', type: 'email', storage: 'extras', hint: 'Receives a copy when someone pays and registers. Default: Admin@HCheckers.org' },

  { key: 'social_twitter', label: 'X (Twitter) URL', section: 'Social', type: 'url', storage: 'column', hint: 'Full profile URL, e.g. https://x.com/yourpage' },
  { key: 'social_instagram', label: 'Instagram URL', section: 'Social', type: 'url', storage: 'column', hint: 'Full profile URL, e.g. https://instagram.com/yourpage' },
  { key: 'social_facebook', label: 'Facebook URL', section: 'Social', type: 'url', storage: 'column', hint: 'Full page URL, e.g. https://facebook.com/yourpage' },
  { key: 'social_youtube', label: 'YouTube URL', section: 'Social', type: 'url', storage: 'column', hint: 'Full channel URL, e.g. https://youtube.com/@yourchannel' },

  { key: 'prize_first', label: 'Winner prize (USD)', section: 'Prizes', type: 'text', storage: 'extras', hint: 'Number only, e.g. 25000. Shown in large type at the top of the homepage.' },
  { key: 'prize_second', label: 'Second prize (USD)', section: 'Prizes', type: 'text', storage: 'extras', hint: 'Number only, e.g. 10000' },
  { key: 'prize_third', label: 'Third prize (USD)', section: 'Prizes', type: 'text', storage: 'extras', hint: 'Number only, e.g. 5000' },

  { key: 'championship_location', label: 'Location', section: 'Championship', type: 'text', storage: 'column' },
  { key: 'championship_dates', label: 'Dates (display)', section: 'Championship', type: 'text', storage: 'column' },
  { key: 'championship_dates_start', label: 'Start date', section: 'Championship', type: 'date', storage: 'column' },
  { key: 'championship_dates_end', label: 'End date', section: 'Championship', type: 'date', storage: 'column' },

  { key: 'announcement_text', label: 'Announcement text', section: 'Announcement', type: 'text', storage: 'column' },
  { key: 'announcement_cta', label: 'Announcement CTA', section: 'Announcement', type: 'text', storage: 'column' },

  { key: 'hero_eyebrow', label: 'Eyebrow', section: 'Hero', type: 'text', storage: 'column' },
  { key: 'hero_title', label: 'Title', section: 'Hero', type: 'text', storage: 'column' },
  { key: 'hero_subtitle', label: 'Subtitle', section: 'Hero', type: 'textarea', storage: 'column', rows: 3 },

  { key: 'about_teaser', label: 'About teaser', section: 'About & CTA', type: 'textarea', storage: 'column', rows: 4 },
  { key: 'final_cta_title', label: 'Final CTA title', section: 'About & CTA', type: 'text', storage: 'column' },
  { key: 'final_cta_subtitle', label: 'Final CTA subtitle', section: 'About & CTA', type: 'textarea', storage: 'column', rows: 2 },
]

/** Known DB column keys (everything else goes into extras). */
export const SITE_SETTING_COLUMN_KEYS = new Set(
  SITE_SETTING_FIELDS.filter((f) => f.storage === 'column').map((f) => f.key),
)
