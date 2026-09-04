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
    'pk_live_51UAxYLEJx0A9C80JHMN53t7lBRtvhcpOM5W7fSkMqYp0NmG07qF0BBgFz0ox7fRcu2EeGP619E4fS6g7DBaZlvdn00BS5Z0QwL',
  registrationFeeAmount: '50',
  registrationFeeCurrency: 'usd',
  geoLookupUrl: 'https://ipapi.co/json/',
} as const
