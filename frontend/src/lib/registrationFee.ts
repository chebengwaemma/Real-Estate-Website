/** Championship registration fee: $250.00 USD (Stripe uses cents). */
export const REGISTRATION_FEE_CENTS = 25000
export const REGISTRATION_FEE_CURRENCY = 'usd'

/** Old live secret was $10 (1000 cents). Never charge that again. */
const LEGACY_TEN_DOLLAR_CENTS = 1000

/**
 * Accepts Stripe cents (25000) or whole dollars (250).
 * Values below 500 are treated as dollars so Admin can type 250.
 */
export function resolveRegistrationFeeCents(raw?: string | number | null): number {
  const n = typeof raw === 'number' ? raw : Number(String(raw ?? '').trim())
  if (!Number.isFinite(n) || n <= 0 || n === LEGACY_TEN_DOLLAR_CENTS) {
    return REGISTRATION_FEE_CENTS
  }
  if (n < 500) return Math.round(n * 100)
  return Math.round(n)
}
