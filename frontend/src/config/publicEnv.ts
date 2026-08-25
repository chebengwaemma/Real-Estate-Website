/**
 * Public client config (safe to ship in the browser).
 * Source of truth for production / Hostinger builds.
 *
 * Project: xydliulffdmacdfnkqts — URL + anon JWT must be from the SAME project.
 */
export const publicEnv = {
  supabaseUrl: 'https://xydliulffdmacdfnkqts.supabase.co',
  // Legacy anon JWT (verified working with Auth). Do not mix with another project's key.
  supabaseAnonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZGxpdWxmZmRtYWNkZm5rcXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTA2MjQsImV4cCI6MjEwMzE2NjYyNH0.Q5-H304jlappnhmMRSJ7pv3LS84YQaZFE-wxQ1cfwsk',
  stripePublishableKey:
    'pk_live_51KxzXWDFK01peQeTfqPjp7xTSfug4oo5UHS0X1nWlRVN54yK9NZ88aZmkg0oN4LQq92BlZDxCCdCbCdiBGorNr4c00b6org7P1',
  registrationFeeAmount: '1000',
  registrationFeeCurrency: 'usd',
  geoLookupUrl: 'https://ipapi.co/json/',
} as const
