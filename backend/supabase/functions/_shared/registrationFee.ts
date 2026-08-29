/** Championship registration fee: $250.00 USD (Stripe uses cents). */
export const REGISTRATION_FEE_CENTS = 25000
export const REGISTRATION_FEE_CURRENCY = 'usd'

/** Old live secret was $10 (1000 cents). Never charge that again. */
const LEGACY_TEN_DOLLAR_CENTS = 1000

export function resolveRegistrationFeeCents(raw?: string | null): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 50 || n === LEGACY_TEN_DOLLAR_CENTS) {
    return REGISTRATION_FEE_CENTS
  }
  return Math.round(n)
}
