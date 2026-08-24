# Hopeland Backend — Client Delivery

This package is Supabase (database + Edge Functions) + Stripe payment wiring.

## What this is for

- Save paid registrations
- Create player accounts after successful payment
- Admin data, videos, sponsors, blog storage
- Stripe checkout + webhook

## Setup (high level)

1. Create a Supabase project
2. Run `supabase/SETUP.sql` in SQL Editor (or `npx supabase db push` from this folder)
3. Deploy Edge Functions (`npm run functions:deploy` from this folder, with project linked)
4. Set Stripe secrets (`npm run stripe:sync` or Supabase secrets UI)
5. Add Stripe webhook: `checkout.session.completed` →  
   `https://YOUR_REF.supabase.co/functions/v1/stripe-webhook`

## Connect to frontend

Give the frontend these public values only:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`

Frontend and backend stay in separate folders — they connect through these keys, not by merging folders.
