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
  bcc?: string | string[]
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
      bcc: input.bcc,
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
  const first = escapeHtml(reg.first_name)
  const last = escapeHtml(reg.last_name)
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.8;color:#0f172a;max-width:620px">
      <h1 style="font-size:22px;line-height:1.3">Thank you for registering</h1>
      <p>Dear <strong>${first} ${last}</strong>,</p>
      <p>
        Thank you for registering with <strong>Hopeland Global Checkers</strong>. We are genuinely glad to welcome you
        into the championship community. Completing your registration is an important first step, and we appreciate
        the time and trust you have placed in us.
      </p>
      <p>
        Your place in the Hopeland Global Checkers World Championship has been received. Please do not worry about
        next steps just yet. <strong>Hopeland Checkers Admin will contact you</strong> directly from
        <a href="mailto:admin@hcheckers.org">admin@hcheckers.org</a>
        with the information you need, including how we will stay in touch, what to expect before Atlanta, and any
        details we still need from you.
      </p>
      <p>
        Until then, keep this email for your records. If anything below looks incorrect, reply to this message
        or write to <a href="mailto:admin@hcheckers.org">admin@hcheckers.org</a>.
      </p>
      <p>
        <strong>Name:</strong> ${first} ${last}<br/>
        <strong>Email:</strong> ${escapeHtml(reg.email)}<br/>
        ${reg.city ? `<strong>City:</strong> ${escapeHtml(reg.city)}<br/>` : ''}
        ${reg.country ? `<strong>Country:</strong> ${escapeHtml(reg.country)}<br/>` : ''}
        ${reg.nationality ? `<strong>Nationality:</strong> ${escapeHtml(reg.nationality)}<br/>` : ''}
        <strong>Registration fee received:</strong> ${escapeHtml(feeLabel)}
      </p>
      <p>
        The championship will take place in <strong>Atlanta, Georgia, USA, July 19–25, 2027</strong>.
        Please watch your inbox (and your spam or promotions folder) for messages from
        <strong>admin@hcheckers.org</strong>.
      </p>
      <p>
        If you created a password during registration, you may sign in on our website with this same email
        whenever you are ready. There is no rush. Our team will contact you personally.
      </p>
      <p>
        Once again, thank you for registering. We are honoured to have you with us, and we look forward to being
        in touch soon.
      </p>
      <p>
        With appreciation,<br/>
        <strong>Hopeland Checkers Admin</strong><br/>
        Hopeland Global Checkers (Draughts) Federation<br/>
        <a href="mailto:admin@hcheckers.org">admin@hcheckers.org</a>
      </p>
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
      <h1 style="font-size:22px">New registration — please follow up</h1>
      <p>
        Someone just completed registration. Follow up from <strong>admin@hcheckers.org</strong>
        so they hear from Hopeland Checkers Admin on time.
      </p>
      <p>${escapeHtml(reg.first_name)} ${escapeHtml(reg.last_name)} paid ${escapeHtml(feeLabel)}. A thank-you email was sent to the player from this mailbox.</p>
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
