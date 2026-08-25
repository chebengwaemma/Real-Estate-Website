import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'

export type CheckoutStartResult =
  | { clientSecret: string; url?: undefined }
  | { url: string; clientSecret?: undefined }

type CheckoutApiResponse = {
  clientSecret?: string
  url?: string
  error?: string
}

export type CheckoutRegistrationFields = {
  firstName: string
  lastName: string
  dateOfBirth: string
  city: string
  country: string
  phone: string
  email: string
}

async function readFunctionError(err: unknown): Promise<string | null> {
  if (err instanceof FunctionsHttpError) {
    try {
      const body = (await err.context.json()) as { error?: string }
      if (typeof body?.error === 'string') return body.error
    } catch {
      // fall through
    }
    return 'Could not start checkout. Please try again.'
  }
  if (err instanceof FunctionsRelayError || err instanceof FunctionsFetchError) {
    return 'Payments are not reachable yet. Please try again shortly or contact support.'
  }
  return err instanceof Error ? err.message : null
}

async function invokeViaRawFetch(
  body: CheckoutRegistrationFields & { uiMode: 'embedded' | 'hosted'; siteUrl: string },
): Promise<CheckoutApiResponse | null> {
  const base = getSupabaseUrl().replace(/\/$/, '')
  const key = getSupabaseAnonKey()
  if (!base || !key) return null
  const res = await fetch(`${base}/functions/v1/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  })
  if (res.status === 404) {
    throw new Error(
      'Checkout is not available on the server yet. Re-upload the latest public_html (including /api) or deploy the create-checkout-session function.',
    )
  }
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new Error('Checkout service returned an unexpected response. Please try again shortly.')
  }
  const data = (await res.json()) as CheckoutApiResponse
  if (!res.ok) {
    throw new Error(data.error ?? 'Could not start checkout.')
  }
  return data
}

async function invokeCreateCheckout(
  body: CheckoutRegistrationFields & { uiMode: 'embedded' | 'hosted'; siteUrl: string },
): Promise<CheckoutApiResponse> {
  const { data, error } = await supabase.functions.invoke<CheckoutApiResponse>('create-checkout-session', {
    body,
  })
  if (!error) return data ?? {}
  try {
    const fallback = await invokeViaRawFetch(body)
    if (fallback) return fallback
  } catch (fallbackErr) {
    if (fallbackErr instanceof Error && fallbackErr.message && !/Failed to fetch|NetworkError/i.test(fallbackErr.message)) {
      throw fallbackErr
    }
  }
  const message = await readFunctionError(error)
  throw new Error(message ?? 'Could not start checkout. Please try again.')
}

function isSameOriginConfigMiss(status: number, error?: string): boolean {
  if (status === 503 || status === 501) return true
  return /STRIPE_SECRET_KEY|Payment secret missing|not configured on the server|missing_stripe_secret/i.test(
    error ?? '',
  )
}

/**
 * Same path on localhost (Vite plugin) and live (Hostinger PHP via .htaccess).
 * Also tries the explicit .php URL if the extensionless route is missing.
 * Misconfigured Hostinger PHP must NOT block Supabase Edge Function fallback.
 */
async function createViaSameOriginApi(
  body: CheckoutRegistrationFields & { uiMode: 'embedded' | 'hosted'; siteUrl: string },
): Promise<CheckoutApiResponse | null> {
  const endpoints = ['/api/create-checkout-session', '/api/create-checkout-session.php']
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 404) continue
      const contentType = res.headers.get('content-type') ?? ''
      if (!contentType.includes('application/json')) continue
      const data = (await res.json()) as CheckoutApiResponse
      if (!res.ok) {
        if (isSameOriginConfigMiss(res.status, data.error)) continue
        throw new Error(data.error ?? 'Could not start checkout.')
      }
      return data
    } catch (err) {
      if (err instanceof Error && !/Failed to fetch|NetworkError|fetch|JSON/i.test(err.message)) {
        throw err
      }
    }
  }
  return null
}

function toResult(data: CheckoutApiResponse, allowEmbedded: boolean): CheckoutStartResult | null {
  if (data.url) return { url: data.url }
  if (allowEmbedded && data.clientSecret) return { clientSecret: data.clientSecret }
  return null
}

/**
 * Starts Stripe Checkout the same way locally and on live:
 * hosted Checkout session (redirect to Stripe), never embedded.
 * Local: Vite /api first. Live: Supabase Edge Function first (no Hostinger secrets needed).
 */
export async function startRegistrationCheckout(
  fields: CheckoutRegistrationFields,
): Promise<CheckoutStartResult> {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : ''
  const payload = { ...fields, siteUrl, uiMode: 'hosted' as const }
  const host = typeof window !== 'undefined' ? window.location.hostname : ''
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1'

  if (isLocal) {
    const sameOrigin = await createViaSameOriginApi(payload)
    if (sameOrigin) {
      const fromSame = toResult(sameOrigin, false)
      if (fromSame) return fromSame
      if (sameOrigin.error) throw new Error(sameOrigin.error)
    }
  }

  try {
    const remote = await invokeCreateCheckout(payload)
    const fromRemote = toResult(remote, false)
    if (fromRemote) return fromRemote
    if (remote.error) throw new Error(remote.error)
  } catch (edgeErr) {
    if (!isLocal) {
      const php = await createViaSameOriginApi(payload)
      if (php) {
        const fromPhp = toResult(php, false)
        if (fromPhp) return fromPhp
      }
    }
    throw edgeErr instanceof Error ? edgeErr : new Error('Could not start Stripe Checkout. Please try again.')
  }

  throw new Error('Could not start Stripe Checkout. Please try again.')
}
