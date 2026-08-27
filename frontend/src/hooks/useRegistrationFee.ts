import { useSiteSettings } from '@/hooks/useCms'
import { REGISTRATION_FEE_CURRENCY, resolveRegistrationFeeCents } from '@/lib/registrationFee'
import { getSiteSetting } from '@/lib/siteSettings'
import { registrationFee as buildFee } from '@/lib/stripeClient'

export function useRegistrationFee() {
  const { data: settings } = useSiteSettings()
  const raw =
    getSiteSetting(settings, 'registration_fee_usd') ||
    getSiteSetting(settings, 'registration_fee_cents') ||
    String(buildFee.amount)
  return {
    amount: resolveRegistrationFeeCents(raw),
    currency: getSiteSetting(settings, 'registration_fee_currency', buildFee.currency || REGISTRATION_FEE_CURRENCY),
  }
}
