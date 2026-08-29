import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import type { RegistrationRow } from './recordPaidSession.ts'
import {
  adminRegistrationNotifyHtml,
  formatUsdCents,
  getAdminSmtpAuth,
  registrationConfirmationHtml,
  sendHostingerHtmlMail,
} from './hostingerSmtp.ts'

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

async function sendViaHostingerSmtpDirect(reg: RegistrationRow): Promise<boolean> {
  const auth = getAdminSmtpAuth()
  if (!auth) return false

  const fromName = cleanSecret(Deno.env.get('REGISTRATION_FROM_NAME') ?? '') || 'HCheckers Admin'
  const fromEmail = cleanSecret(Deno.env.get('ADMIN_EMAIL') ?? Deno.env.get('REGISTRATION_FROM_EMAIL') ?? '') || auth.user
  const adminTo =
    cleanSecret(Deno.env.get('REGISTRATION_ADMIN_EMAIL') ?? '') || auth.user
  const fee = formatUsdCents(reg.fee_amount, reg.fee_currency)
  const playerTo = reg.email.trim().toLowerCase()
  const subject = cleanSecret(Deno.env.get('REGISTRATION_EMAIL_SUBJECT') ?? '') || 'Payment Successful - Registration Confirmed'

  const playerOk = await sendHostingerHtmlMail({
    auth,
    fromName,
    fromEmail,
    to: playerTo,
    replyTo: fromEmail,
    subject,
    html: registrationConfirmationHtml(reg, fee),
    text: `Hello ${reg.first_name},\n\nYour registration and payment were successful. Fee: ${fee}.`,
  })

  const adminOk = await sendHostingerHtmlMail({
    auth,
    fromName,
    fromEmail,
    to: adminTo,
    replyTo: playerTo,
    subject: `New paid registration: ${reg.first_name} ${reg.last_name}`,
    html: adminRegistrationNotifyHtml(reg, fee),
    text: `New paid registration from ${reg.first_name} ${reg.last_name} (${playerTo}). Fee: ${fee}`,
  })

  return playerOk && adminOk
}

function cleanSecret(raw: string): string {
  return raw
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/^["']|["']$/g, '')
}

async function sendViaHostingerMailApi(reg: RegistrationRow): Promise<boolean> {
  const mailApiUrl = cleanSecret(Deno.env.get('MAIL_API_URL') ?? '').replace(/\/$/, '')
  const mailApiSecret = cleanSecret(Deno.env.get('MAIL_API_SECRET') ?? '')
  if (!mailApiUrl || !mailApiSecret || /localhost|127\.0\.0\.1/i.test(mailApiUrl)) return false

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

  const smtpOk = await sendViaHostingerSmtpDirect(reg)
  if (smtpOk) {
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
    console.warn('Mail API, Hostinger SMTP, and Resend are unavailable — skipping registration emails.')
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
    html: registrationConfirmationHtml(reg, fee),
    replyTo: 'info@hcheckers.org',
  })
  const adminOk = await sendViaResend({
    apiKey,
    from,
    to: adminTo,
    subject: `New paid registration: ${reg.first_name} ${reg.last_name}`,
    html: adminRegistrationNotifyHtml(reg, fee),
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
