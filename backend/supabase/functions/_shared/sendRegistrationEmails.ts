import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import type { RegistrationRow } from './recordPaidSession.ts'

function cleanSecret(raw: string): string {
  return raw
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/^["']|["']$/g, '')
}

function formatUsdCents(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency || 'usd').toUpperCase(),
    }).format(amount / 100)
  } catch {
    return `$${(amount / 100).toFixed(2)}`
  }
}

async function sendViaResend(args: {
  apiKey: string
  from: string
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}): Promise<boolean> {
  const to = Array.isArray(args.to) ? args.to : [args.to]
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: args.from,
      to,
      subject: args.subject,
      html: args.html,
      reply_to: args.replyTo,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    console.error('Resend email failed', res.status, body)
    return false
  }
  return true
}

function playerHtml(reg: RegistrationRow, fee: string): string {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
      <h1 style="font-size:20px">Registration confirmed</h1>
      <p>Hello ${reg.first_name},</p>
      <p>Thank you for registering with <strong>Hopeland Global Checkers</strong>. Your registration fee of <strong>${fee}</strong> has been received.</p>
      <p>
        Name: ${reg.first_name} ${reg.last_name}<br/>
        Email: ${reg.email}<br/>
        Country: ${reg.country}<br/>
        ${reg.nationality ? `Nationality: ${reg.nationality}<br/>` : ''}
      </p>
      <p>You can sign in with this email and the password you created during registration.</p>
      <p>Questions: <a href="mailto:Info@HCheckers.org">Info@HCheckers.org</a></p>
      <p>— Hopeland Global Checkers</p>
    </div>
  `
}

function adminHtml(reg: RegistrationRow, fee: string): string {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
      <h1 style="font-size:20px">New paid registration</h1>
      <p>${reg.first_name} ${reg.last_name} paid the registration fee (${fee}).</p>
      <p>
        Email: ${reg.email}<br/>
        Phone: ${reg.phone}<br/>
        City: ${reg.city}<br/>
        Country: ${reg.country}<br/>
        ${reg.nationality ? `Nationality: ${reg.nationality}<br/>` : ''}
      </p>
    </div>
  `
}

async function sendViaHostingerMailApi(reg: RegistrationRow): Promise<boolean> {
  const mailApiUrl = cleanSecret(Deno.env.get('MAIL_API_URL') ?? '').replace(/\/$/, '')
  const mailApiSecret = cleanSecret(Deno.env.get('MAIL_API_SECRET') ?? '')
  if (!mailApiUrl || !mailApiSecret) return false

  const res = await fetch(`${mailApiUrl}/api/payment/success-email`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mailApiSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ registration: reg }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('Hostinger mail API failed', res.status, body)
    return false
  }
  return true
}

/**
 * Emails the player from Admin@HCheckers.org and notifies admin.
 * Prefers Hostinger SMTP mail API (MAIL_API_URL). Falls back to Resend when configured.
 * Does not throw — payment must still succeed.
 */
export async function sendPaidRegistrationEmails(
  supabase: SupabaseClient,
  reg: RegistrationRow,
): Promise<void> {
  if (reg.id) {
    const { data } = await supabase
      .from('registrations')
      .select('id, confirmation_email_sent_at')
      .eq('id', reg.id)
      .maybeSingle()
    if (data && (data as { confirmation_email_sent_at?: string | null }).confirmation_email_sent_at) {
      return
    }
  }

  const hostingerOk = await sendViaHostingerMailApi(reg)
  if (hostingerOk) {
    if (reg.id) {
      await supabase
        .from('registrations')
        .update({ confirmation_email_sent_at: new Date().toISOString() } as never)
        .eq('id', reg.id)
    }
    return
  }

  const apiKey = cleanSecret(Deno.env.get('RESEND_API_KEY') ?? '')
  if (!apiKey) {
    console.warn('MAIL_API_URL or RESEND_API_KEY is not set — skipping registration emails.')
    return
  }

  const fromAddress =
    cleanSecret(Deno.env.get('REGISTRATION_FROM_EMAIL') ?? '') || 'Admin@HCheckers.org'
  const from = fromAddress.includes('<') ? fromAddress : `Hopeland Checkers <${fromAddress}>`
  const adminTo =
    cleanSecret(Deno.env.get('REGISTRATION_ADMIN_EMAIL') ?? '') || 'Admin@HCheckers.org'
  const fee = formatUsdCents(reg.fee_amount, reg.fee_currency)
  const playerTo = reg.email.trim().toLowerCase()

  const playerOk = await sendViaResend({
    apiKey,
    from,
    to: playerTo,
    subject: 'Payment Successful - Registration Confirmed',
    html: playerHtml(reg, fee),
    replyTo: 'Info@HCheckers.org',
  })
  const adminOk = await sendViaResend({
    apiKey,
    from,
    to: adminTo,
    subject: `New paid registration: ${reg.first_name} ${reg.last_name}`,
    html: adminHtml(reg, fee),
    replyTo: playerTo,
  })

  if (!playerOk || !adminOk) {
    console.error('Registration email send incomplete', { playerOk, adminOk, email: playerTo })
    return
  }

  if (reg.id) {
    await supabase
      .from('registrations')
      .update({ confirmation_email_sent_at: new Date().toISOString() } as never)
      .eq('id', reg.id)
  }
}
