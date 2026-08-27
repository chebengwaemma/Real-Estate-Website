import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import { REGISTRATION_FEE_CURRENCY, resolveRegistrationFeeCents } from './registrationFee.ts'

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

export type SiteConfig = {
  siteName: string
  contactEmail: string
  fromEmail: string
  adminEmail: string
  feeCents: number
  feeCurrency: string
}

export async function loadSiteConfig(supabase: SupabaseClient): Promise<SiteConfig> {
  const { data } = await supabase
    .from('site_settings')
    .select('site_name, contact_email, extras')
    .eq('id', 1)
    .maybeSingle()

  const extras = asStringRecord((data as { extras?: unknown } | null)?.extras)
  const contactEmail =
    (typeof data?.contact_email === 'string' && data.contact_email.trim()) || 'Info@HCheckers.org'
  const feeRaw = extras.registration_fee_usd || extras.registration_fee_cents || Deno.env.get('REGISTRATION_FEE_AMOUNT')

  return {
    siteName: (typeof data?.site_name === 'string' && data.site_name.trim()) || 'Hopeland Global Checkers',
    contactEmail,
    fromEmail: extras.registration_from_email || Deno.env.get('REGISTRATION_FROM_EMAIL') || 'Admin@HCheckers.org',
    adminEmail: extras.registration_admin_email || Deno.env.get('REGISTRATION_ADMIN_EMAIL') || 'Admin@HCheckers.org',
    feeCents: resolveRegistrationFeeCents(feeRaw),
    feeCurrency: (extras.registration_fee_currency || Deno.env.get('REGISTRATION_FEE_CURRENCY') || REGISTRATION_FEE_CURRENCY).toLowerCase(),
  }
}
