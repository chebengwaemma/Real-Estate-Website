import { defaultSiteSettings } from '@/lib/cmsDefaults'
import { SITE_SETTING_COLUMN_KEYS } from '@/lib/siteSettingsFields'
import type { SiteSettings } from '@/types'

function asStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === 'string') out[k] = v
    else if (v == null) out[k] = ''
    else out[k] = String(v)
  }
  return out
}

/** Normalize a DB / mock row into SiteSettings (dates → YYYY-MM-DD, extras object). */
export function normalizeSiteSettings(row: Partial<SiteSettings> | null | undefined): SiteSettings {
  const base = { ...defaultSiteSettings, ...row }
  const start = String(base.championship_dates_start ?? '').slice(0, 10)
  const end = String(base.championship_dates_end ?? '').slice(0, 10)
  return {
    ...defaultSiteSettings,
    ...base,
    id: 1,
    championship_dates_start: /^\d{4}-\d{2}-\d{2}$/.test(start) ? start : defaultSiteSettings.championship_dates_start,
    championship_dates_end: /^\d{4}-\d{2}-\d{2}$/.test(end) ? end : defaultSiteSettings.championship_dates_end,
    contact_phone: base.contact_phone ?? '',
    contact_address: base.contact_address ?? defaultSiteSettings.contact_address,
    site_name: base.site_name || defaultSiteSettings.site_name,
    website_url: base.website_url || defaultSiteSettings.website_url,
    logo_url: base.logo_url ?? '',
    extras: { ...defaultSiteSettings.extras, ...asStringRecord(base.extras) },
    updated_at: base.updated_at || new Date().toISOString(),
  }
}

/** Build JSON payload for save_site_settings RPC / upsert. */
export function siteSettingsToPayload(form: SiteSettings): Record<string, unknown> {
  const extras: Record<string, string> = { ...asStringRecord(form.extras) }
  const payload: Record<string, unknown> = { extras }

  for (const key of SITE_SETTING_COLUMN_KEYS) {
    const value = form[key as keyof SiteSettings]
    if (key === 'extras') continue
    if (typeof value === 'string') payload[key] = value
    else if (typeof value === 'number') payload[key] = value
  }

  const start = String(payload.championship_dates_start ?? '').slice(0, 10)
  const end = String(payload.championship_dates_end ?? '').slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(start)) payload.championship_dates_start = start
  else delete payload.championship_dates_start
  if (/^\d{4}-\d{2}-\d{2}$/.test(end)) payload.championship_dates_end = end
  else delete payload.championship_dates_end

  return payload
}

/** Read a setting: column first, then extras, then fallback. */
export function getSiteSetting(
  settings: SiteSettings | null | undefined,
  key: string,
  fallback = '',
): string {
  if (!settings) return fallback
  if (key in settings && key !== 'extras' && key !== 'id') {
    const value = settings[key as keyof SiteSettings]
    if (typeof value === 'string' && value.trim()) return value
  }
  const fromExtras = settings.extras?.[key]
  if (typeof fromExtras === 'string' && fromExtras.trim()) return fromExtras
  return fallback
}
