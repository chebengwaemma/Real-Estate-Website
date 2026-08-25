/**
 * Public client config (safe to ship in the browser).
 * Used when Vercel/build env is missing `VITE_*` so production matches local.
 * Anon + publishable keys are designed to be public; secrets stay server-side.
 *
 * Project: xydliulffdmacdfnkqts — use Dashboard → Settings → API → Publishable / anon key.
 */
export const publicEnv = {
  supabaseUrl: 'https://xydliulffdmacdfnkqts.supabase.co',
  // Prefer new publishable key (sb_publishable_…). Legacy JWT anon also works if valid.
  supabaseAnonKey: 'sb_publishable_U5snXCrIo0kavEPF4Nz0Uw_F4DHiRsz',
  stripePublishableKey:
    'pk_live_51KxzXWDFK01peQeTfqPjp7xTSfug4oo5UHS0X1nWlRVN54yK9NZ88aZmkg0oN4LQq92BlZDxCCdCbCdiBGorNr4c00b6org7P1',
  registrationFeeAmount: '1000',
  registrationFeeCurrency: 'usd',
  geoLookupUrl: 'https://ipapi.co/json/',
} as const
