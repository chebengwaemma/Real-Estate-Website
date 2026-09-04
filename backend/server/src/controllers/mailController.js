import { sendRegistrationMail, sendSupportMail } from '../services/emailService.js'

/** POST /api/send-email — public contact form (Hostinger SMTP) */
export async function sendContactEmail(req, res) {
  try {
    const { name, email, phone, message } = req.body ?? {}
    await sendSupportMail({ name, email, phone, message })
    return res.status(200).json({
      success: true,
      message: 'Your message was sent successfully.',
    })
  } catch (err) {
    console.error('sendContactEmail failed', err)
    const detail = err instanceof Error ? err.message : 'Could not send contact email.'
    const status = /required|invalid/i.test(detail) ? 400 : 500
    return res.status(status).json({ success: false, error: detail })
  }
}

/** POST /api/contact — alias */
export async function submitContact(req, res) {
  return sendContactEmail(req, res)
}

/** POST /api/payment/success-email — called after DB status = paid */
export async function sendPaymentSuccessEmail(req, res) {
  const registration = req.body?.registration

  if (!registration?.email || !registration?.first_name || !registration?.last_name) {
    return res.status(400).json({ error: 'Invalid registration payload.' })
  }

  try {
    await sendRegistrationMail(registration)
    return res.json({ ok: true })
  } catch (err) {
    console.error('sendPaymentSuccessEmail failed', err)
    const detail = err instanceof Error ? err.message : 'Could not send registration emails.'
    return res.status(500).json({ error: detail })
  }
}
