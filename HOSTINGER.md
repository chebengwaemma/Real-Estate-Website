# Hostinger deploy (Hopeland Global Checkers)

This monorepo builds a static Vite site. Hostinger must publish the **built** files (`index.html` + `assets/`), not the source folders.

## hPanel → Websites → Deploy (GitHub)

Use these build settings:

| Setting | Value |
| --- | --- |
| Framework / type | Vite or React (static) |
| Node.js version | **20** (or 22) |
| Root directory | `/` (repository root) |
| Install command | `npm install` (default) |
| Build command | `npm run build` |
| Output directory | **`dist`** |

After build, the repo root has:

```
dist/          ← Hostinger publishes this (same as public_html contents)
public_html/   ← identical copy for File Manager / FTP upload
  index.html
  .htaccess
  assets/
  …
```

### If Hostinger asks for “Root directory” as the app folder

Set **Root directory** to `frontend`, then:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |

(Use this only if root `/` + `npm run build` fails.)

## Manual upload (File Manager / FTP)

1. On your PC: `npm install` then `npm run build`
2. Open Hostinger **File Manager** → `public_html`
3. Delete old site files inside `public_html` (keep the folder)
4. Upload **everything inside** local `public_html/` (or `dist/`) — not the folder name itself
5. Confirm `public_html/index.html` and `public_html/.htaccess` exist
6. **Payments:** confirm these exist on the server (File Manager → show hidden files):
   - `public_html/api/create-checkout-session.php`
   - `public_html/api/stripe-config.php`
   - `public_html/api/payments-secrets.php`
   - `public_html/api/.env`
7. Or upload only the local `public_html/api/` folder over the remote `api/` folder after a Git deploy

### Hostinger Git deploy + Stripe

Git builds do **not** see your local `.env`. In hPanel build environment set at least:

- `STRIPE_SECRET_KEY` = `sk_live_…`
- `VITE_SUPABASE_URL` = your Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` = service role key
- `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_live_…` (also in `frontend/.env.production` / `publicEnv`)

Without `STRIPE_SECRET_KEY` on the build machine, checkout returns “secret missing”.

## SPA routes (About, Register, …)

`.htaccess` is included so refreshing `/about` does not 404 on Apache.

## Do not

- Point the site at the raw Git checkout (`frontend/src`, `backend/`, etc.)
- Upload `node_modules` or the whole repo into `public_html`
