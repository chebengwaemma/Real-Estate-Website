import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { publicEnv } from '@/config/publicEnv'
import { getStripePublishableKey } from '@/lib/stripePublishableKey'
import { resolveRegistrationFeeCents } from '@/lib/registrationFee'

let stripePromise: Promise<Stripe | null> | null = null

/** Lazily loads and memoizes the Stripe.js client (publishable key only). */
export function getStripe() {
  if (!stripePromise) {
    const key = getStripePublishableKey()
    stripePromise = key ? loadStripe(key) : Promise.resolve(null)
  }
  return stripePromise
}

export const registrationFee = {
  amount: resolveRegistrationFeeCents(import.meta.env.VITE_REGISTRATION_FEE_AMOUNT || publicEnv.registrationFeeAmount),
  currency: (
    import.meta.env.VITE_REGISTRATION_FEE_CURRENCY || publicEnv.registrationFeeCurrency
  ).toLowerCase(),
}
