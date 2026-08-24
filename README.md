<<<<<<< HEAD
# Hopeland Global Checkers

The official website for the Hopeland Global Checkers World Championship — React + Tailwind CSS + Supabase with a public marketing site, multi-language support, paid Stripe registration, and an admin dashboard.

## Monorepo layout

```
frontend/          Vite + React app (deploy to Vercel)
backend/           Supabase SQL, Edge Functions, Stripe secret sync
```

Functionality is unchanged — only folders are separated.

## Tech Stack

- **React 19 + TypeScript + Vite** (`frontend/`)
- **Tailwind CSS v4**, Framer Motion, React Router v7
- **Supabase** — Postgres, Auth, Storage, Edge Functions (`backend/supabase/`)
- **Stripe Checkout** via Edge Functions
- **TanStack Query**, **zustand**, **react-hook-form + zod**, **react-i18next**

## Getting Started

```bash
# from repo root
npm install          # installs frontend deps
npm run dev          # http://localhost:5173
```

Or work only in the frontend:

```bash
cd frontend
cp .env.example .env   # fill keys
npm install
npm run dev
```

### Demo mode

If `frontend/.env` has no Supabase credentials, hooks fall back to mock data and Register simulates checkout. Admin stays open for UI review.

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `frontend/.env.example` → `frontend/.env` and set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
3. Apply schema in the SQL Editor using [`backend/supabase/SETUP.sql`](./backend/supabase/SETUP.sql), **or**:
   ```bash
   cd backend
   npx supabase login
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```
4. Promote an admin with [`backend/supabase/PROMOTE_ADMIN.sql`](./backend/supabase/PROMOTE_ADMIN.sql).

## Connecting Stripe

In `frontend/.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
SITE_URL=http://localhost:5173
```

### Local

`npm run dev` — Register uses the Vite `/api/create-checkout-session` helper (dev only).

### Production

```bash
npm run stripe:sync              # needs SUPABASE_ACCESS_TOKEN
npm run functions:deploy         # from repo root (runs in backend/)
```

Stripe webhook: `checkout.session.completed` →  
`https://YOUR_REF.supabase.co/functions/v1/stripe-webhook`

### Vercel

- Build uses `frontend/` (see root `vercel.json`).
- Set only `VITE_*` env vars in Vercel.
- Never set `STRIPE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` on Vercel.

## Project Structure

```
frontend/
├─ src/            components, pages, layouts, hooks, lib, locales…
├─ public/         static assets
├─ vite/           local Stripe checkout plugin (dev only)
└─ package.json

backend/
├─ supabase/
│  ├─ migrations/  schema + RLS
│  ├─ functions/   create-checkout-session, stripe-webhook,
│  │               finalize-paid-registration, …
│  └─ *.sql        SETUP, admin fixes, storage fixes
└─ scripts/        sync-stripe-secrets.mjs
```

## Scripts (repo root)

| Command | What it does |
|---------|----------------|
| `npm run dev` | Start frontend Vite server |
| `npm run build` | Production build (`frontend/dist`) |
| `npm run preview` | Preview production build |
| `npm run lint` | oxlint in frontend |
| `npm run stripe:sync` | Push Stripe secrets to Supabase |
| `npm run functions:deploy` | Deploy all Edge Functions |

## Notes

- Paid registration + Auth account are created only after Stripe confirms payment.
- Cancelled / declined checkout creates no registration row and no account.
- Admin requires `profiles.role` of `admin` or `superadmin` when Supabase is connected.
=======
# claint
>>>>>>> 6b9287ed9d5db8e2b82c69f35676cb9abd544e14
