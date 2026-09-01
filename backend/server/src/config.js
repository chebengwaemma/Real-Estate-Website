import 'dotenv/config'

function required(name, fallback) {
  const value = (process.env[name] ?? fallback ?? '').trim()
  if (!value) throw new Error(`Missing required env: ${name}`)
  return value
}

export const config = {
  port: Number(process.env.PORT || 3001),
  siteUrl: (process.env.SITE_URL || 'https://hcheckers.org').replace(/\/$/, ''),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  mailApiSecret: process.env.MAIL_API_SECRET || '',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: required('SMTP_USER', 'chebengwaemma@gmail.com'),
    pass: required('SMTP_PASS'),
  },
  contactFromName: process.env.CONTACT_FROM_NAME || 'Website Contact Form',
  contactFromEmail: process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER || 'chebengwaemma@gmail.com',
  contactNotifyEmail: process.env.CONTACT_NOTIFY_EMAIL || 'chebengwaemma@gmail.com',
  adminSmtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: required('ADMIN_EMAIL', 'chebengwaemma@gmail.com'),
    pass: required('ADMIN_PASS'),
  },
  registrationFromEmail:
    process.env.ADMIN_EMAIL || process.env.REGISTRATION_FROM_EMAIL || 'chebengwaemma@gmail.com',
  registrationFromName: process.env.REGISTRATION_FROM_NAME || 'HCheckers Admin',
  registrationAdminEmail:
    process.env.REGISTRATION_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'chebengwaemma@gmail.com',
  registrationEmailSubject:
    process.env.REGISTRATION_EMAIL_SUBJECT || 'Payment Successful - Registration Confirmed',
}

export function formatFrom(name, email) {
  return `"${name.replace(/"/g, '')}" <${email}>`
}

export function formatUsdCents(amount, currency = 'usd') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(Number(amount) / 100)
  } catch {
    return `$${(Number(amount) / 100).toFixed(2)}`
  }
}
