# Hostinger deploy (Hopeland Global Checkers)

This monorepo builds a static Vite site. Hostinger must publish the **built** files (`index.html` + `assets/`), not the source folders.

## Payments (Stripe)

Checkout uses **Supabase Edge Function** `create-checkout-session` only.  
Do **not** keep `public_html/api` PHP payment files on the server — delete them if present.  
`STRIPE_SECRET_KEY` lives only in Supabase Edge Function secrets (never in React or static files).

## hPanel → Websites → Deploy (GitHub)

| Setting | Value |
| --- | --- |
| Framework / type | Vite or React (static) |
| Node.js version | **20** (or 22) |
| Root directory | `/` (repository root) |
| Install command | `npm install` |
| Build command | `npm run build` |
| Output directory | **`dist`** |

## Manual upload (File Manager / FTP)

1. On your PC: `npm run build`
2. Hostinger File Manager → `public_html`
3. Delete old files (especially old `api/` folder)
4. Upload everything inside local `public_html/` (or `dist/`)
5. Confirm `index.html`, `.htaccess`, and `assets/` exist
6. Hard-refresh `https://hcheckers.org/register` (Ctrl+F5)

## Do not

- Point the site at the raw Git checkout (`frontend/src`, `backend/`, etc.)
- Upload `node_modules` or the whole repo into `public_html`
- Put `STRIPE_SECRET_KEY` in frontend env that ships to the browser
