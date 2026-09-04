import nodemailer from 'nodemailer'
import { config, formatFrom, formatUsdCents } from '../config.js'
import {
  adminRegistrationNotifyHtml,
  contactNotificationHtml,
  registrationConfirmationHtml,
} from '../mail/templates.js'

/** Contact form SMTP (info@) — credentials live only in `.env`. */
let contactTransporter

/** Registration / payment SMTP (admin@) */
let adminTransporter

function createHostingerTransport(smtpConfig) {
  return nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
    logger: true,
    debug: true,
  })
}

function getContactTransporter() {
  if (!contactTransporter) {
    contactTransporter = createHostingerTransport(config.smtp)
  }
  return contactTransporter
}

function getAdminTransporter() {
  if (!adminTransporter) {
    adminTransporter = createHostingerTransport(config.adminSmtp)
  }
  return adminTransporter
}

async function sendMailWithDebug(transporter, mailOptions) {
  try {
    const result = await transporter.sendMail(mailOptions)
    console.log('Email Result:', result)
    return result
  } catch (error) {
    console.error('Email Error:', error)
    throw error
  }
}

export async function verifySmtpConnection() {
  const contact = getContactTransporter()
  const admin = getAdminTransporter()

  console.log('Verifying contact SMTP credentials...', {
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    user: config.smtp.user,
  })

  try {
    await contact.verify()
    console.log('Contact SMTP verify: connected successfully')
  } catch (error) {
    console.error('Contact SMTP verify failed:', error)
    throw error
  }

  console.log('Verifying admin SMTP credentials...', {
    host: config.adminSmtp.host,
    port: config.adminSmtp.port,
    secure: config.adminSmtp.secure,
    user: config.adminSmtp.user,
  })

  try {
    await admin.verify()
    console.log('Admin SMTP verify: connected successfully')
  } catch (error) {
    console.error('Admin SMTP verify failed:', error)
    throw error
  }
}

/**
 * Trigger 1 — Contact form / support message → Info@HCheckers.org
 * @param {{ name: string, email: string, message: string, phone?: string }} payload
 */
export async function sendSupportMail(payload) {
  const name = String(payload.name ?? '').trim()
  const email = String(payload.email ?? '').trim().toLowerCase()
  const message = String(payload.message ?? '').trim()
  const phone = String(payload.phone ?? '').trim()

  if (!name || !email || !message) {
    throw new Error('Name, email, and message are required.')
  }

  const from = formatFrom(config.contactFromName, config.contactFromEmail)
  const textLines = [
    'New website contact message',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    '',
    message,
  ].filter(Boolean)

  await sendMailWithDebug(getContactTransporter(), {
    from,
    to: config.contactNotifyEmail,
    replyTo: email,
    subject: `Website contact — ${name}`,
    html: contactNotificationHtml({ name, email, phone, message }),
    text: textLines.join('\n'),
  })

  return { ok: true }
}

/**
 * Trigger 2 — Payment success → HTML registration email from admin@hcheckers.org
 * @param {object} registration — paid registration row from database
 */
export async function sendRegistrationMail(registration) {
  if (!registration?.email || !registration?.first_name || !registration?.last_name) {
    throw new Error('Invalid registration payload.')
  }

  const feeLabel = formatUsdCents(registration.fee_amount ?? 25000, registration.fee_currency ?? 'usd')
  const playerTo = String(registration.email).trim().toLowerCase()
  const from = formatFrom(config.registrationFromName, config.registrationFromEmail)
  const subject = config.registrationEmailSubject

  const adminTo = String(config.registrationAdminEmail).trim().toLowerCase()
  const bccAdmin = adminTo && adminTo !== playerTo ? adminTo : undefined

  const playerResult = await sendMailWithDebug(getAdminTransporter(), {
    from,
    to: playerTo,
    bcc: bccAdmin,
    replyTo: config.registrationFromEmail,
    subject,
    html: registrationConfirmationHtml(registration, feeLabel),
    text: `Dear ${registration.first_name} ${registration.last_name},

Thank you for registering with Hopeland Global Checkers. We are glad to welcome you into the championship community.

Your registration has been received. Hopeland Checkers Admin will contact you from admin@hcheckers.org with the next steps. Please watch your inbox (and spam folder) for that message.

Until then, keep this email for your records:

Name: ${registration.first_name} ${registration.last_name}
Email: ${playerTo}
Fee received: ${feeLabel}

The championship is in Atlanta, Georgia, USA, July 19–25, 2027. There is no rush — our team will reach out to you personally.

Thank you again for registering.

Hopeland Checkers Admin
Hopeland Global Checkers (Draughts) Federation
admin@hcheckers.org`,
  })

  let adminResult = null
  if (adminTo && adminTo !== playerTo) {
    adminResult = await sendMailWithDebug(getAdminTransporter(), {
      from,
      to: adminTo,
      replyTo: playerTo,
      subject: `New paid registration: ${registration.first_name} ${registration.last_name}`,
      html: adminRegistrationNotifyHtml(registration, feeLabel),
      text: `New paid registration from ${registration.first_name} ${registration.last_name} (${playerTo}). Fee: ${feeLabel}`,
    })
  }

  return { ok: true, playerMessageId: playerResult?.messageId, adminMessageId: adminResult?.messageId }
}
