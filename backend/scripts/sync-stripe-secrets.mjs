/**
 * Reads Stripe keys from frontend/.env (or backend/.env / root .env)
 * and pushes them to Supabase Edge Function secrets.
 *
 * Usage (from repo root):
 *   set SUPABASE_ACCESS_TOKEN=sbp_...
 *   npm run stripe:sync
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backendRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(backendRoot, '..')

function findEnvFile() {
  const candidates = [
    path.join(repoRoot, 'frontend', '.env'),
    path.join(backendRoot, '.env'),
    path.join(repoRoot, '.env'),
    path.join(process.cwd(), '.env'),
  ]
  return candidates.find((p) => fs.existsSync(p)) ?? null
}

function loadEnvFile(filePath) {
  return Object.fromEntries(
    fs
      .readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const i = line.indexOf('=')
        const key = line.slice(0, i).trim()
        let value = line.slice(i + 1).trim()
        if (
          (value.startsWith("'") && value.endsWith("'")) ||
          (value.startsWith('"') && value.endsWith('"'))
        ) {
          value = value.slice(1, -1)
        }
        return [key, value]
      }),
  )
}

function mergeEnvFiles(...files) {
  const merged = {}
  for (const file of files) {
    if (!file || !fs.existsSync(file)) continue
    Object.assign(merged, loadEnvFile(file))
  }
  return merged
}

const envPath = findEnvFile()
const mailEnvPath = path.join(backendRoot, 'server', '.env')
if (!envPath && !fs.existsSync(mailEnvPath)) {
  console.error('Missing .env — copy frontend/.env.example to frontend/.env and fill keys first.')
  process.exit(1)
}

const env = mergeEnvFiles(envPath, fs.existsSync(mailEnvPath) ? mailEnvPath : null)

const secret = env.STRIPE_SECRET_KEY
if (!secret || /xxx|your_|change_me/i.test(secret)) {
  console.error(`Set a real STRIPE_SECRET_KEY in ${envPath} first.`)
  process.exit(1)
}

if (!process.env.SUPABASE_ACCESS_TOKEN) {
  console.error('Set SUPABASE_ACCESS_TOKEN (Dashboard → Account → Access Tokens), then re-run.')
  process.exit(1)
}

const projectRef =
  process.env.SUPABASE_PROJECT_REF ||
  (env.VITE_SUPABASE_URL?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1] ?? '')

if (!projectRef) {
  console.error('Could not detect Supabase project ref from VITE_SUPABASE_URL.')
  process.exit(1)
}

const pairs = {
  STRIPE_SECRET_KEY: secret,
  SITE_URL: env.SITE_URL || 'http://127.0.0.1:5173',
  REGISTRATION_FEE_AMOUNT: env.VITE_REGISTRATION_FEE_AMOUNT || env.REGISTRATION_FEE_AMOUNT || '25000',
  REGISTRATION_FEE_CURRENCY: (
    env.VITE_REGISTRATION_FEE_CURRENCY ||
    env.REGISTRATION_FEE_CURRENCY ||
    'usd'
  ).toLowerCase(),
}

if (env.STRIPE_WEBHOOK_SECRET && !/xxx|your_/i.test(env.STRIPE_WEBHOOK_SECRET)) {
  pairs.STRIPE_WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET
}
if (env.RESEND_API_KEY && !/xxx|your_/i.test(env.RESEND_API_KEY)) {
  pairs.RESEND_API_KEY = env.RESEND_API_KEY
}
if (env.REGISTRATION_FROM_EMAIL) {
  pairs.REGISTRATION_FROM_EMAIL = env.REGISTRATION_FROM_EMAIL
}
if (env.REGISTRATION_ADMIN_EMAIL) {
  pairs.REGISTRATION_ADMIN_EMAIL = env.REGISTRATION_ADMIN_EMAIL
}
if (env.MAIL_API_URL) {
  pairs.MAIL_API_URL = env.MAIL_API_URL.replace(/\/$/, '')
}
if (env.MAIL_API_SECRET && !/xxx|your_|change_me/i.test(env.MAIL_API_SECRET)) {
  pairs.MAIL_API_SECRET = env.MAIL_API_SECRET
}

const mailKeys = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
  'ADMIN_EMAIL',
  'ADMIN_PASS',
  'CONTACT_FROM_NAME',
  'CONTACT_FROM_EMAIL',
  'CONTACT_NOTIFY_EMAIL',
  'REGISTRATION_FROM_NAME',
  'REGISTRATION_ADMIN_EMAIL',
  'REGISTRATION_EMAIL_SUBJECT',
]

for (const key of mailKeys) {
  const value = env[key]
  if (value && !/xxx|your_|password/i.test(value)) {
    pairs[key] = value
  }
}

const args = ['supabase', 'secrets', 'set', `--project-ref=${projectRef}`]
for (const [k, v] of Object.entries(pairs)) {
  const escaped = String(v).replace(/"/g, '\\"')
  args.push(`${k}="${escaped}"`)
}

console.log(`Using env files: ${[envPath, fs.existsSync(mailEnvPath) ? mailEnvPath : null].filter(Boolean).join(', ')}`)
console.log(`Syncing Stripe secrets to project ${projectRef}…`)
const result = spawnSync('npx', args, { stdio: 'inherit', shell: true, env: process.env, cwd: backendRoot })
if (result.status !== 0) process.exit(result.status ?? 1)

console.log('Done. Deploy functions from repo root with:')
console.log('  npm run functions:deploy')
console.log('Or:')
console.log('  cd backend && npx supabase functions deploy create-checkout-session --project-ref', projectRef)
console.log('  cd backend && npx supabase functions deploy finalize-paid-registration --project-ref', projectRef)
console.log('  cd backend && npx supabase functions deploy stripe-webhook --project-ref', projectRef)
