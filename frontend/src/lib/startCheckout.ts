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
    return 'Checkout service unreachable. Please try again shortly or contact support.'
  }
  return err instanceof Error ? err.message : null
}

/** Direct POST to Edge Function (fallback if supabase.functions.invoke fails). */
async function invokeViaRawFetch(
  body: CheckoutRegistrationFields & { uiMode: 'hosted'; siteUrl: string },
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
      'Checkout Edge Function is not deployed. Deploy create-checkout-session on Supabase project xydliulffdmacdfnkqts.',
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
  body: CheckoutRegistrationFields & { uiMode: 'hosted'; siteUrl: string },
): Promise<CheckoutApiResponse> {
  const { data, error } = await supabase.functions.invoke<CheckoutApiResponse>('create-checkout-session', {
    body,
  })
  if (!error) return data ?? {}

  try {
    const fallback = await invokeViaRawFetch(body)
    if (fallback) return fallback
  } catch (fallbackErr) {
    if (
      fallbackErr instanceof Error &&
      fallbackErr.message &&
      !/Failed to fetch|NetworkError/i.test(fallbackErr.message)
    ) {
      throw fallbackErr
    }
  }

  const message = await readFunctionError(error)
  throw new Error(message ?? 'Could not start checkout. Please try again.')
}

/**
 * Starts hosted Stripe Checkout via Supabase Edge Function only.
 * Does NOT call Hostinger PHP or same-origin /api/* payment endpoints.
 * STRIPE_SECRET_KEY stays in Edge Function secrets — never in React.
 */
export async function startRegistrationCheckout(
  fields: CheckoutRegistrationFields,
): Promise<CheckoutStartResult> {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : ''
  const payload = { ...fields, siteUrl, uiMode: 'hosted' as const }

  const remote = await invokeCreateCheckout(payload)
  if (remote.url) return { url: remote.url }
  if (remote.error) throw new Error(remote.error)

  throw new Error('Could not start Stripe Checkout. Please try again.')
}
