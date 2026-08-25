/**
 * Public client config (safe to ship in the browser).
 * Source of truth for production / Hostinger builds (see getSupabaseUrl/Key).
 *
 * Project: xydliulffdmacdfnkqts
 */
export const publicEnv = {
  supabaseUrl: 'https://xydliulffdmacdfnkqts.supabase.co',
  supabaseAnonKey: 'sb_publishable_U5snXCrIo0kavEPF4Nz0Uw_F4DHiRsz',
  stripePublishableKey:
    'pk_live_51KxzXWDFK01peQeTfqPjp7xTSfug4oo5UHS0X1nWlRVN54yK9NZ88aZmkg0oN4LQq92BlZDxCCdCbCdiBGorNr4c00b6org7P1',
  registrationFeeAmount: '1000',
  registrationFeeCurrency: 'usd',
  geoLookupUrl: 'https://ipapi.co/json/',
} as const
