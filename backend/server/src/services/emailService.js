import nodemailer from 'nodemailer'
import { config, formatFrom, formatUsdCents } from '../config.js'
import {
  adminRegistrationNotifyHtml,
  contactNotificationHtml,
  registrationConfirmationHtml,
} from '../mail/templates.js'

/** Hostinger SMTP transporter — credentials live only in `.env`. */
let transporter

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    })
  }
  return transporter
}

export async function verifySmtpConnection() {
  await getTransporter().verify()
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

  const from = formatFrom(config.registrationFromName, config.registrationFromEmail)
  const textLines = [
    'New website contact message',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    '',
    message,
  ].filter(Boolean)

  await getTransporter().sendMail({
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
 * Trigger 2 — Payment success → HTML registration email from Admin@HCheckers.org
 * @param {object} registration — paid registration row from database
 */
export async function sendRegistrationMail(registration) {
  if (!registration?.email || !registration?.first_name || !registration?.last_name) {
    throw new Error('Invalid registration payload.')
  }

  const feeLabel = formatUsdCents(registration.fee_amount ?? 25000, registration.fee_currency ?? 'usd')
  const playerTo = String(registration.email).trim().toLowerCase()
  const from = formatFrom(config.registrationFromName, config.registrationFromEmail)

  await getTransporter().sendMail({
    from,
    to: playerTo,
    replyTo: config.contactNotifyEmail,
    subject: 'Hopeland Global Checkers — registration confirmed',
    html: registrationConfirmationHtml(registration, feeLabel),
    text: `Hello ${registration.first_name},\n\nYour registration fee of ${feeLabel} was received. Thank you for registering with Hopeland Global Checkers.`,
  })

  await getTransporter().sendMail({
    from,
    to: config.registrationAdminEmail,
    replyTo: playerTo,
    subject: `New paid registration: ${registration.first_name} ${registration.last_name}`,
    html: adminRegistrationNotifyHtml(registration, feeLabel),
    text: `New paid registration from ${registration.first_name} ${registration.last_name} (${playerTo}). Fee: ${feeLabel}`,
  })

  return { ok: true }
}
