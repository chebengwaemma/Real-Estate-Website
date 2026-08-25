# =============================================================================
# LIVE PAYMENTS SETUP — project xydliulffdmacdfnkqts
# Do this once after connecting the new Supabase project.
# =============================================================================
#
# ROOT CAUSE of "checkout service isn't reachable":
#   Edge Function `create-checkout-session` returns 404 — not deployed yet.
#
# -----------------------------------------------------------------------------
# A) Stripe Dashboard (live mode)
# -----------------------------------------------------------------------------
# 1. https://dashboard.stripe.com → toggle **Live** mode (not Test)
# 2. Developers → API keys → copy:
#      Publishable key  = pk_live_...
#      Secret key       = sk_live_...
# 3. Developers → Webhooks → Add endpoint:
#      URL = https://xydliulffdmacdfnkqts.supabase.co/functions/v1/stripe-webhook
#      Events: checkout.session.completed
#    Copy signing secret = whsec_...
#
# -----------------------------------------------------------------------------
# B) Put secrets in frontend/.env (local only — never commit)
# -----------------------------------------------------------------------------
# VITE_SUPABASE_URL=https://xydliulffdmacdfnkqts.supabase.co
# VITE_SUPABASE_ANON_KEY=<anon jwt>
# VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# SITE_URL=https://hcheckers.org
# REGISTRATION_FEE_AMOUNT=1000
# REGISTRATION_FEE_CURRENCY=usd
#
# -----------------------------------------------------------------------------
# C) Supabase Dashboard → Edge Functions → Secrets
# -----------------------------------------------------------------------------
# Set these secrets (Project Settings → Edge Functions → Secrets):
#   STRIPE_SECRET_KEY=sk_live_...
#   STRIPE_WEBHOOK_SECRET=whsec_...
#   SITE_URL=https://hcheckers.org
#   REGISTRATION_FEE_AMOUNT=1000
#   REGISTRATION_FEE_CURRENCY=usd
#   SUPABASE_SERVICE_ROLE_KEY=<service_role from API settings>
#   (SUPABASE_URL / SUPABASE_ANON_KEY are usually auto-provided)
#
# -----------------------------------------------------------------------------
# D) Deploy Edge Functions (from repo, needs Supabase access token)
# -----------------------------------------------------------------------------
# Dashboard → Account → Access Tokens → create token
#
# PowerShell:
#   $env:SUPABASE_ACCESS_TOKEN="sbp_..."
#   cd backend
#   npx supabase functions deploy create-checkout-session --project-ref xydliulffdmacdfnkqts
#   npx supabase functions deploy finalize-paid-registration --project-ref xydliulffdmacdfnkqts
#   npx supabase functions deploy stripe-webhook --project-ref xydliulffdmacdfnkqts
#   npx supabase functions deploy get-registration-by-session --project-ref xydliulffdmacdfnkqts
#   npx supabase functions deploy get-registration --project-ref xydliulffdmacdfnkqts
#   npx supabase functions deploy get-my-registration --project-ref xydliulffdmacdfnkqts
#   npx supabase functions deploy update-registration-profile --project-ref xydliulffdmacdfnkqts
#   npx supabase functions deploy admin-upload-media --project-ref xydliulffdmacdfnkqts
#
# Or: npm run stripe:sync   then   npm run functions:deploy --prefix backend
#
# -----------------------------------------------------------------------------
# E) Redeploy frontend (Hostinger public_html) so pk_live is in the build
# -----------------------------------------------------------------------------
#   npm run build
#   Upload public_html/ to Hostinger
#
# Verify: POST https://xydliulffdmacdfnkqts.supabase.co/functions/v1/create-checkout-session
# should NOT return 404 (400 invalid payload is OK).
