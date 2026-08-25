import { publicEnv } from '@/config/publicEnv'

/**
 * Stripe publishable key only (pk_live_… / pk_test_…).
 * Accepts VITE_STRIPE_PUBLIC_KEY or VITE_STRIPE_PUBLISHABLE_KEY (never the secret key).
 */
export function getStripePublishableKey(): string {
  const fromEnv = (
    import.meta.env.VITE_STRIPE_PUBLIC_KEY ||
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    ''
  ).trim()
  const key = fromEnv || publicEnv.stripePublishableKey.trim()
  if (!key || /your_|change_me|xxxxxxxx/i.test(key)) return ''
  if (!/^pk_(live|test)_/.test(key)) return ''
  return key
}

export function isLiveStripePublishableKey(key = getStripePublishableKey()): boolean {
  return key.startsWith('pk_live_')
}
