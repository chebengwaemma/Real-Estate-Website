# Hostinger SMTP — Email Workflow (Architecture)

পুরো সিস্টেম **২টি ট্রিগার**-এ ভিত্তি করে কাজ করে। মেইন কোড ৩টি অংশে:

| File | Role |
| --- | --- |
| `backend/server/.env` | SMTP password + secrets (কখনো Git-এ commit করবেন না) |
| `backend/server/src/services/emailService.js` | Nodemailer engine — `sendSupportMail()`, `sendRegistrationMail()` |
| `backend/server/src/routes/routes.js` + `controllers/mailController.js` | Express routes যা ওপরের ফাংশন call করে |

---

## Trigger 1 — Contact form → Info@HCheckers.org

```
React Contact page
    ↓ POST (Supabase Edge Function)
submit-contact-message
    ↓ saves row in contact_messages (admin inbox)
    ↓ POST /api/email/contact-notification
Express mailController.submitContact()
    ↓
emailService.sendSupportMail()
    ↓ Hostinger SMTP (smtp.hostinger.com:465)
Info@HCheckers.org inbox
```

**Direct path (optional):** React can also call `POST /api/contact` on the mail server if you expose `VITE_MAIL_API_URL`.

**Payload:** `{ name, email, phone?, message }`

---

## Trigger 2 — Payment success → admin@hcheckers.org → User

```
User pays (Stripe Checkout)
    ↓
Stripe webhook OR finalize-paid-registration
    ↓
Database: registrations.status = paid
    ↓ (async — does not block payment response)
sendPaidRegistrationEmails()
    ↓ POST /api/payment/success-email
Express mailController.sendPaymentSuccessEmail()  → responds immediately { ok: true, queued: true }
    ↓ background
emailService.sendRegistrationMail()
    ↓ Hostinger SMTP as admin@hcheckers.org (ADMIN_EMAIL / ADMIN_PASS)
User email — subject: "Payment Successful - Registration Confirmed"
    + admin copy notification
```

---

## `.env` (security)

```bash
cd backend/server
cp .env.example .env
```

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@hcheckers.org
SMTP_PASS=your_info_mailbox_password

ADMIN_EMAIL=admin@hcheckers.org
ADMIN_PASS=your_admin_mailbox_password
REGISTRATION_FROM_NAME=HCheckers Admin
REGISTRATION_ADMIN_EMAIL=admin@hcheckers.org

CONTACT_NOTIFY_EMAIL=info@hcheckers.org

MAIL_API_SECRET=long_random_secret
SITE_URL=https://hcheckers.org
CORS_ORIGIN=https://hcheckers.org
PORT=3001
```

Supabase Edge secrets (`frontend/.env` → `npm run stripe:sync`):

```env
MAIL_API_URL=https://api.hcheckers.org
MAIL_API_SECRET=same_as_mail_server
```

---

## Run locally

```bash
npm run mail:install
npm run mail:dev
```

Health: `GET http://localhost:3001/health`

---

## Deploy

1. Hostinger-এ `backend/server` Node app run করুন (e.g. `api.hcheckers.org`)
2. `npm run stripe:sync`
3. `npm run functions:deploy`

---

## API summary

| Route | Auth | Function |
| --- | --- | --- |
| `POST /api/contact` | Public | `sendSupportMail()` |
| `POST /api/payment/success-email` | Bearer secret | `sendRegistrationMail()` |

---

## File map

```
backend/server/
├── .env                    ← SMTP credentials (secure)
├── src/
│   ├── index.js            ← Express app entry
│   ├── services/
│   │   └── emailService.js ← sendSupportMail + sendRegistrationMail
│   ├── controllers/
│   │   └── mailController.js
│   ├── routes/
│   │   └── routes.js
│   └── mail/
│       └── templates.js    ← HTML email designs
```

Password শুধু `.env`-এ থাকে — React বা GitHub-এ কখনো রাখবেন না।
