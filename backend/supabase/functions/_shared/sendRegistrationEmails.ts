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
  bcc?: string | string[]
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
      ...(args.bcc ? { bcc: Array.isArray(args.bcc) ? args.bcc : [args.bcc] } : {}),
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
  const fromEmail =
    cleanSecret(Deno.env.get('ADMIN_EMAIL') ?? Deno.env.get('REGISTRATION_FROM_EMAIL') ?? '') ||
    auth.user ||
    'admin@hcheckers.org'
  const adminTo =
    cleanSecret(Deno.env.get('REGISTRATION_ADMIN_EMAIL') ?? Deno.env.get('ADMIN_EMAIL') ?? '') ||
    'admin@hcheckers.org'
  const fee = formatUsdCents(reg.fee_amount, reg.fee_currency)
  const playerTo = reg.email.trim().toLowerCase()
  const subject = cleanSecret(Deno.env.get('REGISTRATION_EMAIL_SUBJECT') ?? '') || 'Thank you for registering with Hopeland Global Checkers'
  const bccAdmin = adminTo && adminTo.toLowerCase() !== playerTo ? adminTo : undefined
  const playerText = playerThankYouText(reg, fee, playerTo)

  const playerOk = await sendHostingerHtmlMail({
    auth,
    fromName,
    fromEmail,
    to: playerTo,
    bcc: bccAdmin,
    replyTo: fromEmail,
    subject,
    html: registrationConfirmationHtml(reg, fee),
    text: playerText,
  })

  let adminOk = true
  if (adminTo && adminTo.toLowerCase() !== playerTo) {
    adminOk = await sendHostingerHtmlMail({
      auth,
      fromName,
      fromEmail,
      to: adminTo,
      replyTo: playerTo,
      subject: `New paid registration: ${reg.first_name} ${reg.last_name}`,
      html: adminRegistrationNotifyHtml(reg, fee),
      text: `New paid registration from ${reg.first_name} ${reg.last_name} (${playerTo}). Fee: ${fee}`,
    })
  }

  return playerOk && adminOk
}

function playerThankYouText(
  reg: { first_name: string; last_name: string },
  fee: string,
  playerTo: string,
): string {
  return `Dear ${reg.first_name} ${reg.last_name},

Thank you for registering with Hopeland Global Checkers. We are glad to welcome you into the championship community.

Your registration has been received. Hopeland Checkers Admin will contact you from admin@hcheckers.org with the next steps. Please watch your inbox (and spam folder) for that message.

Until then, keep this email for your records:

Name: ${reg.first_name} ${reg.last_name}
Email: ${playerTo}
Fee received: ${fee}

The championship is in Atlanta, Georgia, USA, July 19–25, 2027. There is no rush — our team will reach out to you personally.

Thank you again for registering.

Hopeland Checkers Admin
Hopeland Global Checkers (Draughts) Federation
admin@hcheckers.org`
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
    cleanSecret(Deno.env.get('ADMIN_EMAIL') ?? Deno.env.get('REGISTRATION_FROM_EMAIL') ?? '') ||
    'admin@hcheckers.org'
  const from = fromAddress.includes('<') ? fromAddress : `HCheckers Admin <${fromAddress}>`
  const adminTo =
    cleanSecret(Deno.env.get('REGISTRATION_ADMIN_EMAIL') ?? Deno.env.get('ADMIN_EMAIL') ?? '') ||
    'admin@hcheckers.org'
  const fee = formatUsdCents(reg.fee_amount, reg.fee_currency)
  const playerTo = reg.email.trim().toLowerCase()
  const bccAdmin = adminTo.toLowerCase() !== playerTo ? adminTo : undefined

  const playerOk = await sendViaResend({
    apiKey,
    from,
    to: playerTo,
    bcc: bccAdmin,
    subject: cleanSecret(Deno.env.get('REGISTRATION_EMAIL_SUBJECT') ?? '') || 'Thank you for registering with Hopeland Global Checkers',
    html: registrationConfirmationHtml(reg, fee),
    replyTo: fromAddress,
  })
  let adminOk = true
  if (adminTo.toLowerCase() !== playerTo) {
    adminOk = await sendViaResend({
      apiKey,
      from,
      to: adminTo,
      subject: `New paid registration: ${reg.first_name} ${reg.last_name}`,
      html: adminRegistrationNotifyHtml(reg, fee),
      replyTo: playerTo,
    })
  }

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
