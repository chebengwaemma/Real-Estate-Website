import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'
import { clearPendingAuth, readPendingAuth } from '@/lib/pendingAuth'
import type { Registration } from '@/types'

type FinalizeResponse = {
  paid?: boolean
  registration?: Registration
  accountCreated?: boolean
  accountError?: string | null
  error?: string
}

async function finalizeViaRawFetch(
  sessionId: string,
  password: string,
): Promise<FinalizeResponse | null> {
  const base = getSupabaseUrl().replace(/\/$/, '')
  const key = getSupabaseAnonKey()
  if (!base || !key) return null
  const res = await fetch(`${base}/functions/v1/finalize-paid-registration`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      sessionId,
      password: password.length >= 6 ? password : undefined,
    }),
  })
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) return null
  const data = (await res.json()) as FinalizeResponse
  if (!res.ok) {
    return {
      paid: data.paid,
      error: data.error ?? 'Could not finalize payment.',
      registration: data.registration,
    }
  }
  return data
}

async function finalizeViaEdgeFunction(
  sessionId: string,
  password: string,
): Promise<{ data: FinalizeResponse | null; errorMessage: string | null; unpaid: boolean }> {
  const { data, error } = await supabase.functions.invoke<FinalizeResponse>('finalize-paid-registration', {
    body: {
      sessionId,
      password: password.length >= 6 ? password : undefined,
    },
  })

  if (error) {
    try {
      const fallback = await finalizeViaRawFetch(sessionId, password)
      if (fallback?.paid && fallback.registration) {
        return { data: fallback, errorMessage: null, unpaid: false }
      }
      if (fallback?.error) {
        return {
          data: fallback,
          errorMessage: fallback.error,
          unpaid: fallback.paid === false || /not completed|not paid|invalid checkout/i.test(fallback.error),
        }
      }
    } catch {
      // fall through
    }
    if (error instanceof FunctionsHttpError) {
      try {
        const body = (await error.context.json()) as FinalizeResponse
        if (body?.error) {
          return {
            data: body,
            errorMessage: body.error,
            unpaid: body.paid === false || /not completed|not paid|invalid checkout/i.test(body.error),
          }
        }
      } catch {
        // fall through
      }
    }
    return { data: null, errorMessage: error.message, unpaid: false }
  }

  return { data: data ?? null, errorMessage: null, unpaid: false }
}

/**
 * After Stripe redirects to success: verify payment via Supabase Edge Function only.
 * Does not call Hostinger PHP /api/* endpoints.
 */
export async function finalizePaidRegistration(sessionId: string): Promise<{
  registration: Registration | null
  error: string | null
  unpaid: boolean
}> {
  const pending = readPendingAuth()
  const password = pending?.password ?? ''

  const edge = await finalizeViaEdgeFunction(sessionId, password)
  let result = edge.data?.paid && edge.data.registration ? edge.data : null

  if (!result) {
    if (edge.errorMessage) {
      const { data: existing } = await supabase.functions.invoke<Registration>('get-registration-by-session', {
        body: { sessionId },
      })
      if (existing?.status === 'paid') {
        await activatePaidAccount(existing)
        clearPendingAuth()
        return { registration: existing, error: null, unpaid: false }
      }
      clearPendingAuth()
      return {
        registration: null,
        error:
          /Failed to send a request to the Edge Function|not found|FunctionsFetchError|CORS/i.test(
            edge.errorMessage,
          )
            ? 'Payment may have succeeded, but account setup is not ready yet. Please wait a moment and refresh, or contact support with your payment email.'
            : edge.errorMessage,
        unpaid: edge.unpaid,
      }
    }
    if (edge.data?.error && !edge.data.registration) {
      clearPendingAuth()
      const unpaid =
        edge.data.paid === false ||
        (/not completed|not paid|invalid checkout/i.test(edge.data.error) &&
          !/SERVICE_ROLE|not configured|not connected/i.test(edge.data.error))
      return {
        registration: null,
        error: edge.data.error,
        unpaid,
      }
    }
  }

  if (!result?.paid || !result.registration) {
    clearPendingAuth()
    const message = result?.error ?? edge.errorMessage ?? 'Payment not completed. No account was created.'
    const unpaid =
      result?.paid === false ||
      edge.unpaid ||
      (!result?.paid &&
        /not completed|not paid|invalid checkout/i.test(message) &&
        !/SERVICE_ROLE|not configured|not connected/i.test(message))
    return {
      registration: null,
      error: message,
      unpaid: Boolean(unpaid),
    }
  }

  if (pending && password.length >= 6 && pending.email === result.registration.email.trim().toLowerCase()) {
    await supabase.auth.signInWithPassword({ email: pending.email, password })
  }

  clearPendingAuth()
  return { registration: result.registration, error: null, unpaid: false }
}

/** Demo / webhook-fallback path: create Auth only when registration is already paid. */
export async function activatePaidAccount(registration: Registration): Promise<{ error: string | null }> {
  if (registration.status !== 'paid') {
    clearPendingAuth()
    return { error: 'Payment not completed. No account was created.' }
  }

  const pending = readPendingAuth()
  const email = registration.email.trim().toLowerCase()
  const password = pending?.email === email ? pending.password : null

  if (!password) {
    clearPendingAuth()
    return { error: null }
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        championship_registration: registration,
        first_name: registration.first_name,
        last_name: registration.last_name,
      },
    },
  })

  if (!signUpError) {
    clearPendingAuth()
    if (signUpData.session) return { error: null }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    return { error: signInError?.message ?? null }
  }

  const exists = /already registered|already been registered|user already exists/i.test(signUpError.message)
  if (exists) {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (!signInError) {
      await supabase.auth.updateUser({
        data: {
          championship_registration: registration,
          first_name: registration.first_name,
          last_name: registration.last_name,
        },
      })
    }
    clearPendingAuth()
    return { error: signInError?.message ?? null }
  }

  clearPendingAuth()
  return { error: signUpError.message }
}
