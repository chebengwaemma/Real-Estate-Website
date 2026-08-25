import { publicEnv } from '@/config/publicEnv'

/** True only during `vite` / `vite preview` local tooling — false on Vercel builds. */
export const isDevRuntime = import.meta.env.DEV

/** Localhost / loopback — true for local Vite, false on any deployed host. */
export function isLocalHost(): boolean {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1'
}

function looksLikePlaceholder(value: string | undefined): boolean {
  if (!value) return true
  const v = value.trim().toLowerCase()
  return (
    v.length < 8 ||
    v.includes('your_') ||
    v.includes('your-') ||
    v.includes('xxxxxxxx') ||
    v.includes('change_me') ||
    v.includes('demo-anon') ||
    v === 'https://demo.supabase.co'
  )
}

/**
 * Project ref from https://REF.supabase.co
 */
function projectRefFromUrl(url: string): string | null {
  try {
    const host = new URL(url).hostname
    const m = /^([a-z0-9]+)\.supabase\.co$/i.exec(host)
    return m?.[1] ?? null
  } catch {
    return null
  }
}

/** Decode JWT payload ref claim without verifying signature (client-side sanity check). */
function projectRefFromJwt(token: string): string | null {
  if (!token.startsWith('eyJ')) return null
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const pad = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const json = JSON.parse(atob(pad)) as { ref?: string }
    return typeof json.ref === 'string' ? json.ref : null
  } catch {
    return null
  }
}

function resolveSupabasePair(): { url: string; key: string } {
  // Production / Hostinger: always ship the paired publicEnv values so a stale
  // CI or leftover VITE_* cannot mix old anon key + new project URL.
  if (import.meta.env.PROD) {
    return { url: publicEnv.supabaseUrl, key: publicEnv.supabaseAnonKey }
  }

  const urlEnv = import.meta.env.VITE_SUPABASE_URL
  const keyEnv = import.meta.env.VITE_SUPABASE_ANON_KEY
  const url = urlEnv && !looksLikePlaceholder(urlEnv) ? urlEnv.trim() : publicEnv.supabaseUrl
  let key = keyEnv && !looksLikePlaceholder(keyEnv) ? keyEnv.trim() : publicEnv.supabaseAnonKey

  const urlRef = projectRefFromUrl(url)
  const keyRef = projectRefFromJwt(key)
  if (urlRef && keyRef && urlRef !== keyRef) {
    // Mismatched pair → fall back to known-good publicEnv
    return { url: publicEnv.supabaseUrl, key: publicEnv.supabaseAnonKey }
  }

  return { url, key }
}

/** Resolved public Supabase URL (build env, else shipped fallback). */
export function getSupabaseUrl(): string {
  return resolveSupabasePair().url
}

/** Resolved public Supabase anon/publishable key (build env, else shipped fallback). */
export function getSupabaseAnonKey(): string {
  return resolveSupabasePair().key
}

/** Real Supabase project credentials (not placeholders / demo). */
export function hasSupabaseEnv(): boolean {
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  if (!url || !key) return false
  if (looksLikePlaceholder(url) || looksLikePlaceholder(key)) return false
  try {
    const host = new URL(url).hostname
    return host.endsWith('.supabase.co') || host.includes('supabase')
  } catch {
    return false
  }
}

/**
 * Intermediate / client-demo builds can set VITE_PAYMENT_MODE=local to skip
 * Stripe Checkout and complete a paid registration in-app.
 * Production builds always use real Stripe — never ship "local" payment mode.
 */
export function isLocalPaymentMode(): boolean {
  if (import.meta.env.PROD) return false
  const mode = (import.meta.env.VITE_PAYMENT_MODE || 'stripe').trim().toLowerCase()
  return mode === 'local' || mode === 'demo' || mode === 'test'
}
