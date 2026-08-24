import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { publicEnv } from '@/config/publicEnv'

let stripePromise: Promise<Stripe | null> | null = null

/** Lazily loads and memoizes the Stripe.js client. */
export function getStripe() {
  if (!stripePromise) {
    const key = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || publicEnv.stripePublishableKey).trim()
    stripePromise = key ? loadStripe(key) : Promise.resolve(null)
  }
  return stripePromise
}

export const registrationFee = {
  amount: Number(import.meta.env.VITE_REGISTRATION_FEE_AMOUNT || publicEnv.registrationFeeAmount),
  currency: (
    import.meta.env.VITE_REGISTRATION_FEE_CURRENCY || publicEnv.registrationFeeCurrency
  ).toLowerCase(),
}
