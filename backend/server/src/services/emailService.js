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

function getContactTransporter() {
  if (!contactTransporter) {
    contactTransporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    })
  }
  return contactTransporter
}

function getAdminTransporter() {
  if (!adminTransporter) {
    adminTransporter = nodemailer.createTransport({
      host: config.adminSmtp.host,
      port: config.adminSmtp.port,
      secure: config.adminSmtp.secure,
      auth: {
        user: config.adminSmtp.user,
        pass: config.adminSmtp.pass,
      },
    })
  }
  return adminTransporter
}

export async function verifySmtpConnection() {
  await Promise.all([getContactTransporter().verify(), getAdminTransporter().verify()])
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

  await getContactTransporter().sendMail({
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

  await getAdminTransporter().sendMail({
    from,
    to: playerTo,
    replyTo: config.registrationFromEmail,
    subject,
    html: registrationConfirmationHtml(registration, feeLabel),
    text: `Hello ${registration.first_name},\n\nYour registration and payment were successful. Your registration fee of ${feeLabel} was received. Thank you for registering with Hopeland Global Checkers.`,
  })

  await getAdminTransporter().sendMail({
    from,
    to: config.registrationAdminEmail,
    replyTo: playerTo,
    subject: `New paid registration: ${registration.first_name} ${registration.last_name}`,
    html: adminRegistrationNotifyHtml(registration, feeLabel),
    text: `New paid registration from ${registration.first_name} ${registration.last_name} (${playerTo}). Fee: ${feeLabel}`,
  })

  return { ok: true }
}
