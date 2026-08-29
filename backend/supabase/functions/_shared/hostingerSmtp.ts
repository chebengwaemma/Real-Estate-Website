import nodemailer from 'npm:nodemailer@6'

function cleanSecret(raw: string): string {
  return raw
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/^["']|["']$/g, '')
}

function formatFrom(name: string, email: string): string {
  return `"${name.replace(/"/g, '')}" <${email}>`
}

type SmtpAuth = {
  user: string
  pass: string
}

type SendHtmlMailInput = {
  auth: SmtpAuth
  fromName: string
  fromEmail: string
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

function getTransporter(auth: SmtpAuth) {
  const host = cleanSecret(Deno.env.get('SMTP_HOST') ?? '') || 'smtp.hostinger.com'
  const port = Number(cleanSecret(Deno.env.get('SMTP_PORT') ?? '') || 465)
  const secure = (Deno.env.get('SMTP_SECURE') ?? 'true') !== 'false'

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: auth.user,
      pass: auth.pass,
    },
  })
}

export function getContactSmtpAuth(): SmtpAuth | null {
  const user = cleanSecret(Deno.env.get('SMTP_USER') ?? '')
  const pass = cleanSecret(Deno.env.get('SMTP_PASS') ?? '')
  if (!user || !pass || /your_|password/i.test(pass)) return null
  return { user, pass }
}

export function getAdminSmtpAuth(): SmtpAuth | null {
  const user = cleanSecret(Deno.env.get('ADMIN_EMAIL') ?? Deno.env.get('REGISTRATION_FROM_EMAIL') ?? '')
  const pass = cleanSecret(Deno.env.get('ADMIN_PASS') ?? '')
  if (!user || !pass || /your_|password/i.test(pass)) return null
  return { user, pass }
}

export async function sendHostingerHtmlMail(input: SendHtmlMailInput): Promise<boolean> {
  try {
    const transporter = getTransporter(input.auth)
    await transporter.sendMail({
      from: formatFrom(input.fromName, input.fromEmail),
      to: input.to,
      replyTo: input.replyTo,
      subject: input.subject,
      html: input.html,
      text: input.text,
    })
    return true
  } catch (err) {
    console.error('Hostinger SMTP send failed', err)
    return false
  }
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function contactNotificationHtml(input: {
  name: string
  email: string
  message: string
  phone?: string
}): string {
  const safeMessage = escapeHtml(input.message).replace(/\n/g, '<br />')
  const phoneRow = input.phone
    ? `<p><strong>Phone:</strong> ${escapeHtml(input.phone)}</p>`
    : ''

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:620px">
      <h1 style="font-size:22px">New contact message</h1>
      <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      ${phoneRow}
      <p style="margin-top:16px">${safeMessage}</p>
    </div>
  `
}

export function registrationConfirmationHtml(
  reg: {
    first_name: string
    last_name: string
    email: string
    country?: string
    nationality?: string
    city?: string
    fee_amount?: number
    fee_currency?: string
  },
  feeLabel: string,
): string {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:620px">
      <h1 style="font-size:22px">Payment Successful — Registration Confirmed</h1>
      <p>Hello <strong>${escapeHtml(reg.first_name)}</strong>,</p>
      <p>
        Great news — your <strong>registration and payment were successful</strong>.
        We received your payment of <strong>${escapeHtml(feeLabel)}</strong> and your registration is now confirmed.
      </p>
      <p>
        <strong>Name:</strong> ${escapeHtml(reg.first_name)} ${escapeHtml(reg.last_name)}<br/>
        <strong>Email:</strong> ${escapeHtml(reg.email)}<br/>
        ${reg.city ? `<strong>City:</strong> ${escapeHtml(reg.city)}<br/>` : ''}
        ${reg.country ? `<strong>Country:</strong> ${escapeHtml(reg.country)}<br/>` : ''}
        ${reg.nationality ? `<strong>Nationality:</strong> ${escapeHtml(reg.nationality)}<br/>` : ''}
      </p>
      <p>You can sign in with this email and the password you created during registration.</p>
      <p>Questions? Email <a href="mailto:info@hcheckers.org">info@hcheckers.org</a></p>
    </div>
  `
}

export function adminRegistrationNotifyHtml(
  reg: {
    first_name: string
    last_name: string
    email: string
    phone?: string
    city?: string
    country?: string
  },
  feeLabel: string,
): string {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:620px">
      <h1 style="font-size:22px">New paid registration</h1>
      <p>${escapeHtml(reg.first_name)} ${escapeHtml(reg.last_name)} paid ${escapeHtml(feeLabel)}.</p>
      <p>
        <strong>Email:</strong> ${escapeHtml(reg.email)}<br/>
        <strong>Phone:</strong> ${escapeHtml(reg.phone || '—')}<br/>
        <strong>City:</strong> ${escapeHtml(reg.city || '—')}<br/>
        <strong>Country:</strong> ${escapeHtml(reg.country || '—')}
      </p>
    </div>
  `
}

export function formatUsdCents(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency || 'usd').toUpperCase(),
    }).format(amount / 100)
  } catch {
    return `$${(amount / 100).toFixed(2)}`
  }
}
