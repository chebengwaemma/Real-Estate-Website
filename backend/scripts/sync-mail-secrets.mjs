/**
 * Push Hostinger SMTP credentials to Supabase Edge Function secrets (live email).
 *
 * Usage (from repo root):
 *   set SUPABASE_ACCESS_TOKEN=sbp_...
 *   npm run mail:sync
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backendRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(backendRoot, '..')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}
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

const frontendEnv = path.join(repoRoot, 'frontend', '.env')
const mailEnv = path.join(backendRoot, 'server', '.env')
const env = { ...loadEnvFile(frontendEnv), ...loadEnvFile(mailEnv) }

if (!process.env.SUPABASE_ACCESS_TOKEN) {
  console.error('Set SUPABASE_ACCESS_TOKEN (Dashboard → Account → Access Tokens), then re-run.')
  process.exit(1)
}

const projectRef =
  process.env.SUPABASE_PROJECT_REF ||
  (env.VITE_SUPABASE_URL?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1] ?? 'xydliulffdmacdfnkqts')

const keys = [
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
  'MAIL_API_SECRET',
  'MAIL_API_URL',
]

const pairs = {
  SITE_URL: env.SITE_URL || 'https://hcheckers.org',
}

for (const key of keys) {
  const value = env[key]
  if (value && !/xxx|your_|password/i.test(value)) {
    pairs[key] = value
  }
}

const args = ['supabase', 'secrets', 'set', `--project-ref=${projectRef}`]
for (const [k, v] of Object.entries(pairs)) {
  // Quote values so spaces/special chars survive shell parsing (e.g. CONTACT_FROM_NAME).
  const escaped = String(v).replace(/"/g, '\\"')
  args.push(`${k}="${escaped}"`)
}

console.log(`Syncing Hostinger SMTP secrets to project ${projectRef}…`)
const result = spawnSync('npx', args, {
  stdio: 'inherit',
  shell: true,
  env: process.env,
  cwd: backendRoot,
})
if (result.status !== 0) process.exit(result.status ?? 1)

console.log('Done. Deploy email functions with: npm run deploy:live-email')
