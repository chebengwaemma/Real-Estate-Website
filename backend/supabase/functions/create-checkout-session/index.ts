// Supabase Edge Function (Deno runtime).
// Creates a Stripe Checkout Session (hosted redirect) via Stripe REST API.
// Secret key: STRIPE_SECRET_KEY Edge secret only — never sent to the browser.
import { corsHeaders } from '../_shared/cors.ts'
import { REGISTRATION_FEE_CURRENCY, resolveRegistrationFeeCents } from '../_shared/registrationFee.ts'

interface RegistrationPayload {
  firstName: string
  lastName: string
  dateOfBirth: string
  city: string
  country: string
  nationality?: string
  phone: string
  email: string
}

function isValidPayload(body: unknown): body is RegistrationPayload {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.firstName === 'string' &&
    b.firstName.trim().length >= 2 &&
    typeof b.lastName === 'string' &&
    b.lastName.trim().length >= 2 &&
    typeof b.dateOfBirth === 'string' &&
    b.dateOfBirth.length > 0 &&
    typeof b.city === 'string' &&
    b.city.trim().length >= 2 &&
    typeof b.country === 'string' &&
    b.country.trim().length >= 2 &&
    typeof b.phone === 'string' &&
    b.phone.trim().length >= 6 &&
    typeof b.email === 'string' &&
    /.+@.+\..+/.test(b.email)
  )
}

/** Strip BOM / zero-width / quotes / whitespace that break Deno fetch headers. */
function cleanSecret(raw: string): string {
  return raw
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/^["']|["']$/g, '')
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  try {
    let raw: unknown
    try {
      raw = await req.json()
    } catch {
      return json(400, { error: 'Invalid JSON body.' })
    }

    // Production registration always uses hosted Checkout (redirect to Stripe).
    const requested =
      raw && typeof raw === 'object' ? (raw as { uiMode?: string }).uiMode : undefined
    const uiMode = requested === 'embedded' ? 'embedded' : 'hosted'

    if (!isValidPayload(raw)) {
      return json(400, { error: 'Invalid registration payload.' })
    }
    const body = raw as RegistrationPayload & { siteUrl?: string; uiMode?: string }

    const stripeSecretKey = cleanSecret(Deno.env.get('STRIPE_SECRET_KEY') ?? '')
    if (!stripeSecretKey || !/^sk_(test|live)_/.test(stripeSecretKey)) {
      return json(503, {
        error:
          'Payments are not configured. Set STRIPE_SECRET_KEY (sk_live_…) in Supabase Edge Function secrets.',
      })
    }

    const feeAmount = resolveRegistrationFeeCents(Deno.env.get('REGISTRATION_FEE_AMOUNT'))
    const feeCurrency = (Deno.env.get('REGISTRATION_FEE_CURRENCY') ?? REGISTRATION_FEE_CURRENCY).toLowerCase()
    if (!Number.isFinite(feeAmount) || feeAmount < 50) {
      return json(500, { error: 'Invalid registration fee configuration.' })
    }

    const configured = (Deno.env.get('SITE_URL') ?? '').trim().replace(/\/$/, '')
    const origin = (req.headers.get('origin') ?? '').trim().replace(/\/$/, '')
    const fromClient =
      typeof body.siteUrl === 'string' ? body.siteUrl.trim().replace(/\/$/, '') : ''
    const isHttpUrl = (u: string) => /^https?:\/\//i.test(u)
    const isLocal = (u: string) => /localhost|127\.0\.0\.1/i.test(u)
    const pick = (...candidates: string[]) => candidates.find((u) => u && isHttpUrl(u)) ?? ''

    const siteUrl =
      pick(
        fromClient,
        origin,
        !isLocal(configured) ? configured : '',
        configured,
        'https://hcheckers.org',
      ) || 'https://hcheckers.org'

    // Avoid accidentally charging live cards against a test secret (or the reverse).
    if (stripeSecretKey.startsWith('sk_test_') && !isLocal(siteUrl)) {
      return json(503, {
        error:
          'Stripe test secret is set, but this request is for a live site. Set STRIPE_SECRET_KEY=sk_live_… in Edge secrets.',
      })
    }

    const firstName = body.firstName.trim()
    const lastName = body.lastName.trim()
    const email = body.email.trim().toLowerCase()

    const params = new URLSearchParams()
    params.set('mode', 'payment')
    params.append('payment_method_types[]', 'card')
    params.set('customer_email', email)
    params.set('branding_settings[display_name]', 'Hopeland Global Checkers (Draughts) Federation')
    params.set('line_items[0][quantity]', '1')
    params.set('line_items[0][price_data][currency]', feeCurrency)
    params.set('line_items[0][price_data][unit_amount]', String(feeAmount))
    params.set(
      'line_items[0][price_data][product_data][name]',
      'Hopeland Global Checkers (Draughts) Federation — Championship Registration',
    )
    params.set(
      'line_items[0][price_data][product_data][description]',
      `Registration fee for ${firstName} ${lastName}`,
    )
    params.set('metadata[first_name]', firstName)
    params.set('metadata[last_name]', lastName)
    params.set('metadata[date_of_birth]', body.dateOfBirth)
    params.set('metadata[city]', body.city.trim())
    params.set('metadata[country]', body.country.trim())
    params.set('metadata[nationality]', (body.nationality || body.country).trim())
    params.set('metadata[phone]', body.phone.trim())
    params.set('metadata[email]', email)

    if (uiMode === 'embedded') {
      params.set('ui_mode', 'embedded_page')
      params.set('return_url', `${siteUrl}/register/success?session_id={CHECKOUT_SESSION_ID}`)
    } else {
      params.set('success_url', `${siteUrl}/register/success?session_id={CHECKOUT_SESSION_ID}`)
      params.set('cancel_url', `${siteUrl}/register/cancelled?session_id={CHECKOUT_SESSION_ID}`)
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2026-03-25.dahlia',
      },
      body: params.toString(),
    })

    const data = (await stripeRes.json()) as {
      id?: string
      url?: string
      client_secret?: string
      error?: { message?: string; type?: string }
    }

    if (!stripeRes.ok) {
      console.error('Stripe checkout.sessions error', stripeRes.status, data.error)
      return json(502, {
        error: data.error?.message ?? 'Stripe rejected checkout session creation.',
      })
    }

    if (uiMode === 'embedded') {
      if (!data.client_secret) {
        return json(500, { error: 'Stripe did not return an embedded checkout client secret.' })
      }
      return json(200, { clientSecret: data.client_secret, sessionId: data.id })
    }

    if (!data.url) {
      return json(500, { error: 'Stripe did not return a checkout URL.' })
    }

    return json(200, { url: data.url, sessionId: data.id })
  } catch (error) {
    console.error('create-checkout-session error', error)
    const message = error instanceof Error ? error.message : 'Unexpected error creating checkout session.'
    return json(500, { error: message })
  }
})
