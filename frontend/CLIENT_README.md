# Hopeland Frontend — Client Delivery

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

Open: http://localhost:5173

## Demo mode (no backend yet)

If `.env` has no real Supabase keys, the site still runs with demo/mock data.
You can review UI, pages, and admin layout without backend.

## Later — connect backend

When you receive the backend package and Supabase is set up, put these in `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_or_live_key
VITE_REGISTRATION_FEE_AMOUNT=1000
VITE_REGISTRATION_FEE_CURRENCY=usd
```

Then restart:

```bash
npm run dev
```

Do **not** put `STRIPE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
Those stay on the backend (Supabase secrets).

## Deploy frontend (Vercel)

1. Import this folder (or repo root Directory = this frontend folder)
2. Add the `VITE_*` env vars above
3. Deploy
