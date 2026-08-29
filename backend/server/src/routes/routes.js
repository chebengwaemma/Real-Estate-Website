import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireMailApiSecret } from '../middleware/auth.js'
import { sendPaymentSuccessEmail, sendContactEmail, submitContact } from '../controllers/mailController.js'

const router = Router()

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
})

/** Contact form — POST /api/send-email (React Contact page) */
router.post('/send-email', contactLimiter, sendContactEmail)

/** Trigger 1 — contact / SMS-style message → info@hcheckers.org */
router.post('/contact', contactLimiter, submitContact)

/** Trigger 2 — payment success hook → registration HTML email */
router.post('/payment/success-email', requireMailApiSecret, sendPaymentSuccessEmail)

/** Backward-compatible alias used by Supabase Edge Functions */
router.post('/email/registration-confirmation', requireMailApiSecret, sendPaymentSuccessEmail)
router.post('/email/contact-notification', requireMailApiSecret, submitContact)

export default router
