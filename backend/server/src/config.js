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
    secure: process.env.SMTP_SECURE !== 'false',
    user: required('SMTP_USER', 'Admin@HCheckers.org'),
    pass: required('SMTP_PASS'),
  },
  registrationFromEmail: process.env.REGISTRATION_FROM_EMAIL || 'Admin@HCheckers.org',
  registrationFromName: process.env.REGISTRATION_FROM_NAME || 'Hopeland Global Checkers',
  contactNotifyEmail: process.env.CONTACT_NOTIFY_EMAIL || 'Info@HCheckers.org',
  registrationAdminEmail: process.env.REGISTRATION_ADMIN_EMAIL || 'Admin@HCheckers.org',
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
