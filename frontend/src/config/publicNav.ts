export type PublicNavItem = {
  to: string
  labelKey: string
  /** CMS page slug when this nav item is an editable document. */
  cmsSlug?: string
}

/** Shared links (no Sports, no Blog). */
const PRIMARY_NAV: PublicNavItem[] = [
  { to: '/about', labelKey: 'nav.about', cmsSlug: 'about' },
  { to: '/leadership', labelKey: 'nav.leadership', cmsSlug: 'leadership' },
  { to: '/rules', labelKey: 'nav.rules', cmsSlug: 'rules' },
  { to: '/competition-2027', labelKey: 'nav.competition2027', cmsSlug: 'competition-2027' },
  { to: '/videos', labelKey: 'nav.videos' },
  { to: '/sponsors', labelKey: 'nav.sponsors' },
  { to: '/contact', labelKey: 'nav.contact' },
]

/** Header — no Sports, no Blog. */
export const HEADER_NAV: PublicNavItem[] = [...PRIMARY_NAV]

/** Footer — Blog kept; Sports removed. */
export const FOOTER_NAV: PublicNavItem[] = [
  { to: '/', labelKey: 'nav.home' },
  ...PRIMARY_NAV,
  { to: '/blog', labelKey: 'nav.blog' },
  { to: '/register', labelKey: 'nav.register' },
]

export const FOOTER_LEGAL: PublicNavItem[] = [
  { to: '/privacy-policy', labelKey: 'footer.privacy', cmsSlug: 'privacy-policy' },
  { to: '/terms-of-use', labelKey: 'footer.terms', cmsSlug: 'terms-of-use' },
  { to: '/contact', labelKey: 'nav.contact' },
]

export const CONTACT_EMAIL_DEFAULT = 'chebengwaemma@gmail.com'
export const ADMIN_NOTIFY_EMAIL_DEFAULT = 'chebengwaemma@gmail.com'

export const DEFAULT_PRIZES = {
  first: 25000,
  second: 10000,
  third: 5000,
} as const
