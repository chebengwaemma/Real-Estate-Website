# Live Stripe payments (Hopeland)

Production path: **hosted Stripe Checkout** → Supabase Edge Functions.  
Secret key stays in Supabase Edge secrets only (never in frontend).

## Already required secrets (project `xydliulffdmacdfnkqts`)

- `STRIPE_SECRET_KEY` = `sk_live_…`
- `SITE_URL` = `https://hcheckers.org`
- `REGISTRATION_FEE_AMOUNT` = `25000`
- `REGISTRATION_FEE_CURRENCY` = `usd`
- Optional: `STRIPE_WEBHOOK_SECRET` = `whsec_…` (Stripe Dashboard → Webhooks)

## Frontend public env

- `VITE_STRIPE_PUBLIC_KEY` = `pk_live_…` (preferred)
- `VITE_STRIPE_PUBLISHABLE_KEY` = same (legacy alias)

## Deploy Edge Functions

```powershell
powershell -ExecutionPolicy Bypass -File backend/scripts/deploy-live-payments.ps1
```

## Stripe webhook (recommended)

Endpoint:

`https://xydliulffdmacdfnkqts.supabase.co/functions/v1/stripe-webhook`

Events:

- `checkout.session.completed` → registration `paid`
- `checkout.session.expired` → registration `failed`
- `checkout.session.async_payment_failed` → registration `failed`

## Live Hostinger note

If `/api/create-checkout-session.php` returns `STRIPE_SECRET_KEY is not configured`, delete `public_html/api` **or** upload the latest `public_html` build. Production JS prefers Edge Function first.
