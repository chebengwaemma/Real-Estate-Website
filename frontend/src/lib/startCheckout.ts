import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { isLocalHost } from '@/lib/env'

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
    return 'Payments aren\'t set up yet — the checkout service isn\'t reachable. Please try again shortly or contact support.'
  }
  return err instanceof Error ? err.message : null
}

async function invokeViaRawFetch(
  body: CheckoutRegistrationFields & { uiMode: 'embedded' | 'hosted'; siteUrl: string },
): Promise<CheckoutApiResponse | null> {
  const base = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
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
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) return null
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

async function createViaLocalDevApi(
  body: CheckoutRegistrationFields & { uiMode: 'embedded' | 'hosted'; siteUrl: string },
): Promise<CheckoutApiResponse | null> {
  if (!isLocalHost()) return null
  try {
    const localRes = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const contentType = localRes.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) return null
    const localData = (await localRes.json()) as CheckoutApiResponse
    if (!localRes.ok) {
      if (localRes.status === 404) return null
      throw new Error(localData.error ?? 'Could not start checkout.')
    }
    return localData
  } catch (err) {
    if (err instanceof Error && !/Failed to fetch|NetworkError|fetch|JSON/i.test(err.message)) {
      throw err
    }
    return null
  }
}

function toResult(data: CheckoutApiResponse, allowEmbedded: boolean): CheckoutStartResult | null {
  if (data.url) return { url: data.url }
  if (allowEmbedded && data.clientSecret) return { clientSecret: data.clientSecret }
  return null
}

/**
 * Starts Stripe Checkout the same way locally and on any deployed host:
 * - Localhost: Vite `/api` plugin first, then Edge Function
 * - Live/deploy: Edge Function only (hosted Checkout — works on any domain)
 * - Production never uses embedded Checkout (unregistered domains fail)
 */
export async function startRegistrationCheckout(
  fields: CheckoutRegistrationFields,
): Promise<CheckoutStartResult> {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : ''
  const allowEmbedded = isLocalHost()
  const base = { ...fields, siteUrl }

  const tryMode = async (uiMode: 'embedded' | 'hosted'): Promise<CheckoutStartResult | null> => {
    const payload = { ...base, uiMode }
    const local = await createViaLocalDevApi(payload)
    if (local) {
      const fromLocal = toResult(local, allowEmbedded)
      if (fromLocal) return fromLocal
      if (local.error) throw new Error(local.error)
    }
    const remote = await invokeCreateCheckout(payload)
    const fromRemote = toResult(remote, allowEmbedded)
    if (fromRemote) return fromRemote
    if (remote.error) throw new Error(remote.error)
    return null
  }

  const hosted = await tryMode('hosted')
  if (hosted) return hosted

  if (allowEmbedded) {
    const embedded = await tryMode('embedded')
    if (embedded) return embedded
  }

  throw new Error('Could not start Stripe Checkout. Please try again.')
}
