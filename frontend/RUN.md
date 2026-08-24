# Frontend চালাবে কীভাবে (How to run)

এই ফোল্ডার = **website / UI**। Local-এ Vite দিয়ে চলে।

## লাগবে

- Node.js **20+** ([nodejs.org](https://nodejs.org))
- Terminal / PowerShell

## Step 1 — এই ফোল্ডারে যাও

```powershell
cd "C:\Users\user\Desktop\Hopeland Global Checkers\frontend"
```

## Step 2 — Env ফাইল

```powershell
copy .env.example .env
```

`.env` খুলে নিজের keys বসাও (backend setup শেষ হলে):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SITE_URL=http://127.0.0.1:5173
VITE_PAYMENT_MODE=stripe
```

- `stripe` = আসল Stripe payment  
- `local` = demo (Stripe ছাড়া)

## Step 3 — Install + Run

```powershell
npm install
npm run dev
```

Browser খোলো:

**http://127.0.0.1:5173**

বন্ধ করতে: Terminal-এ `Ctrl + C`

## অন্য কমান্ড

| কমান্ড | কাজ |
|--------|-----|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Build preview |

## Backend সাথে connect

Frontend আর backend **একসাথে merge করতে হয় না**।  
Backend (Supabase) setup করে যে keys পাবে, সেগুলো এই `.env`-এ দিলেই connect হয়ে যাবে।

বিস্তারিত backend: `../backend/RUN.md`

## Vercel-এ publish করলে payment

Vercel Environment Variables (Production):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_PAYMENT_MODE=stripe`

Secret keys Vercel-এ দিও **না**। সেগুলো Supabase Edge Function secrets-এ থাকবে।  
Deploy-এর আগে backend functions deploy + Stripe webhook set থাকতে হবে — দেখো `../backend/RUN.md` → **Production / Vercel deploy**।
