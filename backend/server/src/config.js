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
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_SECURE ?? 'true') !== 'false',
    user: required('SMTP_USER', 'info@hcheckers.org'),
    pass: required('SMTP_PASS'),
  },
  contactFromName: process.env.CONTACT_FROM_NAME || 'Website Contact Form',
  contactFromEmail: process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER || 'info@hcheckers.org',
  contactNotifyEmail: process.env.CONTACT_NOTIFY_EMAIL || 'info@hcheckers.org',
  adminSmtp: {
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_SECURE ?? 'true') !== 'false',
    user: required('ADMIN_EMAIL', 'admin@hcheckers.org'),
    pass: required('ADMIN_PASS'),
  },
  registrationFromEmail:
    process.env.ADMIN_EMAIL || process.env.REGISTRATION_FROM_EMAIL || 'admin@hcheckers.org',
  registrationFromName: process.env.REGISTRATION_FROM_NAME || 'HCheckers Admin',
  registrationAdminEmail:
    process.env.REGISTRATION_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@hcheckers.org',
  registrationEmailSubject:
    process.env.REGISTRATION_EMAIL_SUBJECT || 'Thank you for registering with Hopeland Global Checkers',
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
