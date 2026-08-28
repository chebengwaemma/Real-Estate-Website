import { sendRegistrationMail, sendSupportMail } from '../services/emailService.js'

/** POST /api/contact — public contact form from React */
export async function submitContact(req, res) {
  try {
    const { name, email, message, phone } = req.body ?? {}
    await sendSupportMail({ name, email, message, phone })
    return res.json({ ok: true })
  } catch (err) {
    console.error('submitContact failed', err)
    const message = err instanceof Error ? err.message : 'Could not send contact email.'
    const status = /required|invalid/i.test(message) ? 400 : 500
    return res.status(status).json({ error: message })
  }
}

/** POST /api/payment/success-email — called after DB status = paid (Stripe webhook path) */
export async function sendPaymentSuccessEmail(req, res) {
  try {
    const registration = req.body?.registration
    await sendRegistrationMail(registration)
    return res.json({ ok: true })
  } catch (err) {
    console.error('sendPaymentSuccessEmail failed', err)
    const message = err instanceof Error ? err.message : 'Could not send registration email.'
    const status = /invalid/i.test(message) ? 400 : 500
    return res.status(status).json({ error: message })
  }
}
