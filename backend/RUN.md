# Backend চালাবে কীভাবে (How to run)

এই ফোল্ডার = **Supabase + Stripe** (database, Edge Functions, payment)।  
সাধারণ `npm run dev` দিয়ে লোকাল server চলে **না** — cloud-এ setup/deploy করতে হয়।

## লাগবে

- Node.js **20+**
- [Supabase](https://supabase.com) account + project
- [Stripe](https://stripe.com) account (Test mode OK)
- Supabase CLI (`npx supabase` চলবে)

## Step 1 — এই ফোল্ডারে যাও

```powershell
cd "C:\Users\user\Desktop\Hopeland Global Checkers\backend"
```

## Step 2 — Env ফাইল

```powershell
copy .env.example .env
```

`.env`-এ বসাও:

```env
VITE_SUPABASE_URL=https://YOUR_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SITE_URL=http://127.0.0.1:5173
```

Keys কোথায় পাবে:

- Supabase → **Project Settings → API**
- Stripe → **Developers → API keys**

## Step 3 — Database (একবার)

1. [Supabase Dashboard](https://supabase.com/dashboard) → তোমার project  
2. বাম দিকে **SQL Editor**  
3. `supabase/SETUP.sql` ফাইলের **সব কোড** কপি → পেস্ট → **Run**

অথবা CLI:

```powershell
npx supabase login
npx supabase link
npx supabase db push
```

## Step 4 — Edge Functions deploy

```powershell
npx supabase login
npx supabase link
npm run functions:deploy
```

## Step 5 — Stripe secrets sync

```powershell
# আগে SUPABASE_ACCESS_TOKEN সেট করো (Supabase Account → Access Tokens)
$env:SUPABASE_ACCESS_TOKEN="sbp_your_token"
npm run stripe:sync
```

অথবা Dashboard → **Edge Functions → Secrets**-এ ম্যানুয়ালি:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SITE_URL`
- `REGISTRATION_FEE_AMOUNT`
- `REGISTRATION_FEE_CURRENCY`

## Step 6 — Stripe Webhook

Stripe Dashboard → **Developers → Webhooks** → Add endpoint:

- URL: `https://YOUR_REF.supabase.co/functions/v1/stripe-webhook`
- Event: `checkout.session.completed`

পাওয়া `whsec_...` → `.env` + Supabase secrets-এ বসাও।

## Frontend-এ কী দিবে

শুধু এগুলো frontend `.env`-এ দাও (secret নয়):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`

Local payment finalize-এর জন্য frontend `.env`-এ আরও লাগতে পারে:

- `STRIPE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL=http://127.0.0.1:5173`

Frontend চালানো: `../frontend/RUN.md`

## Production / Vercel deploy (payment যেন local-এর মতো চলে)

Frontend build-এ **শুধু** public env লাগে (Vercel → Project → Settings → Environment Variables):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_PAYMENT_MODE=stripe` (production-এ `local` দিও না — code-ও PROD-এ Stripe force করে)
- Optional: `VITE_REGISTRATION_FEE_AMOUNT`, `VITE_REGISTRATION_FEE_CURRENCY`

**কখনো** Vercel-এ `STRIPE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` দিও না — সেগুলো শুধু Supabase Edge Function secrets-এ।

Deploy-এর আগে/পরে:

1. Edge Functions deploy: `create-checkout-session`, `finalize-paid-registration`, `stripe-webhook`
2. Supabase secrets: `STRIPE_SECRET_KEY`, `SITE_URL=https://YOUR-VERCEL-DOMAIN` (optional backup — client origin প্রাধান্য পায়), fee vars, webhook secret
3. Stripe Dashboard → Webhooks → endpoint = `https://YOUR_REF.supabase.co/functions/v1/stripe-webhook` → event `checkout.session.completed`
4. Live mode হলে Stripe → Settings → Payment methods / Checkout domains-এ তোমার domain add করো

Payment flow (local = production):

Register → Edge `create-checkout-session` → pay → `/register/success` → Edge `finalize-paid-registration`

## মনে রাখো

| জিনিস | কোথায় চলে |
|--------|-----------|
| Frontend UI | `npm run dev` → localhost:5173 **বা** Vercel |
| Database / Auth / Functions | Supabase cloud |
| Card payment | Stripe |

দুটো আলাদা ফোল্ডার — keys দিয়ে connect হয়, ফোল্ডার মিলিয়ে এক করতে হয় না।
