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
    'pk_test_51U1ladPXMalxkPZ2JjAwinCohIIyl36TRmPXlV9DLGpDN8zRGS0A9B5MNZPG2oZafYSDZ8yK0tpFIWJnjQ4C1nlm00kTbJ7AaR',
  registrationFeeAmount: '1000',
  registrationFeeCurrency: 'usd',
  geoLookupUrl: 'https://ipapi.co/json/',
} as const
