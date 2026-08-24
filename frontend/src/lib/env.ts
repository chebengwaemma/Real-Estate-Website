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

/** Resolved public Supabase URL (build env, else shipped fallback). */
export function getSupabaseUrl(): string {
  const fromEnv = import.meta.env.VITE_SUPABASE_URL
  if (fromEnv && !looksLikePlaceholder(fromEnv)) return fromEnv.trim()
  return publicEnv.supabaseUrl
}

/** Resolved public Supabase anon key (build env, else shipped fallback). */
export function getSupabaseAnonKey(): string {
  const fromEnv = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (fromEnv && !looksLikePlaceholder(fromEnv)) return fromEnv.trim()
  return publicEnv.supabaseAnonKey
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
