/**
 * Public client config (safe to ship in the browser).
 * Used when Vercel/build env is missing `VITE_*` so production matches local.
 * Anon + publishable keys are designed to be public; secrets stay server-side.
 */
export const publicEnv = {
  supabaseUrl: 'https://pskzpccgcikoyewlkmgb.supabase.co',
  supabaseAnonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBza3pwY2NnY2lrb3lld2xrbWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwOTg4MzQsImV4cCI6MjEwMTY3NDgzNH0.5gwjmO8Jc0SWqIiR6Nd0h1q2miqUcEJH4WHoVZ_PfAc',
  stripePublishableKey:
    'pk_live_51KxzXWDFK01peQeTfqPjp7xTSfug4oo5UHS0X1nWlRVN54yK9NZ88aZmkg0oN4LQq92BlZDxCCdCbCdiBGorNr4c00b6org7P1',
  registrationFeeAmount: '1000',
  registrationFeeCurrency: 'usd',
  geoLookupUrl: 'https://ipapi.co/json/',
} as const
