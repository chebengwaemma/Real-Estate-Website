import type { CmsPage } from '@/types'
import { FOOTER_LEGAL, FOOTER_NAV, HEADER_NAV, type PublicNavItem } from '@/config/publicNav'

export type EditableNavItem = {
  to: string
  label: string
  cmsSlug?: string
}

export type ResolvedNavLink = {
  to: string
  label: string
}

function slugFromPath(to: string): string {
  return to.replace(/^\//, '').replace(/\/$/, '')
}

export function parseNavJson(raw?: string | null): EditableNavItem[] | null {
  if (!raw?.trim()) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    const items = parsed
      .map((row) => {
        if (!row || typeof row !== 'object') return null
        const rec = row as Record<string, unknown>
        const to = String(rec.to ?? rec.href ?? '').trim()
        if (!to.startsWith('/')) return null
        const label = String(rec.label ?? '').trim()
        const cmsSlug = String(rec.cmsSlug ?? '').trim()
        const item: EditableNavItem = { to, label }
        if (cmsSlug) item.cmsSlug = cmsSlug
        return item
      })
      .filter((row): row is EditableNavItem => row !== null)
    return items.length ? items : null
  } catch {
    return null
  }
}

export function defaultsFromCode(items: PublicNavItem[], t: (key: string) => string): EditableNavItem[] {
  return items.map((item) => ({
    to: item.to,
    label: t(item.labelKey),
    cmsSlug: item.cmsSlug,
  }))
}

export function resolveNavLinks(
  custom: EditableNavItem[] | null,
  fallback: PublicNavItem[],
  pages: CmsPage[] | undefined,
  t: (key: string) => string,
): ResolvedNavLink[] {
  const source: EditableNavItem[] = custom ?? defaultsFromCode(fallback, t)
  const preferSavedLabel = custom !== null
  return source.map((item) => {
    const slug = item.cmsSlug || slugFromPath(item.to)
    const page = pages?.find((p) => p.slug === slug)
    const label = preferSavedLabel
      ? item.label.trim() || page?.title?.trim() || slugFromPath(item.to) || item.to
      : page?.title?.trim() || item.label.trim() || slugFromPath(item.to) || item.to
    return { to: item.to, label }
  })
}

export const DEFAULT_HEADER_EDITABLE: EditableNavItem[] = [
  { to: '/about', label: 'About', cmsSlug: 'about' },
  { to: '/leadership', label: 'Leadership Board', cmsSlug: 'leadership' },
  { to: '/rules', label: 'Rules', cmsSlug: 'rules' },
  { to: '/competition-2027', label: '2027 Competition', cmsSlug: 'competition-2027' },
  { to: '/videos', label: 'Videos' },
  { to: '/blog', label: 'Blog' },
  { to: '/sponsors', label: 'Sponsors' },
  { to: '/contact', label: 'Contact' },
]

export const DEFAULT_FOOTER_EDITABLE: EditableNavItem[] = [
  { to: '/', label: 'Home' },
  ...DEFAULT_HEADER_EDITABLE,
  { to: '/register', label: 'Register' },
]

export const DEFAULT_LEGAL_EDITABLE: EditableNavItem[] = [
  { to: '/privacy-policy', label: 'Privacy Policy', cmsSlug: 'privacy-policy' },
  { to: '/terms-of-use', label: 'Terms of Use', cmsSlug: 'terms-of-use' },
  { to: '/contact', label: 'Contact' },
]

export { HEADER_NAV, FOOTER_NAV, FOOTER_LEGAL }
