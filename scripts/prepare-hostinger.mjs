/**
 * After Vite build, copy frontend/dist → repo-root dist/ and public_html/
 * and inject Hostinger PHP payment config from frontend/.env / backend/.env.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'frontend', 'dist')
const targets = [join(root, 'dist'), join(root, 'public_html')]

if (!existsSync(join(source, 'index.html'))) {
  console.error('Missing frontend/dist/index.html — run the Vite build first.')
  process.exit(1)
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {}
  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const i = line.indexOf('=')
        return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
      }),
  )
}

const env = {
  ...loadEnvFile(join(root, 'backend', '.env')),
  ...loadEnvFile(join(root, 'frontend', '.env')),
}

const stripeSecret = env.STRIPE_SECRET_KEY || ''
const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || ''
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || ''
const feeAmount = env.REGISTRATION_FEE_AMOUNT || env.VITE_REGISTRATION_FEE_AMOUNT || '1000'
const feeCurrency = (env.REGISTRATION_FEE_CURRENCY || env.VITE_REGISTRATION_FEE_CURRENCY || 'usd').toLowerCase()

function phpString(value) {
  return JSON.stringify(String(value ?? ''))
}

const stripeConfigPhp = `<?php
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'stripe-config.php') {
  http_response_code(403);
  header('Content-Type: application/json');
  echo json_encode(['error' => 'Forbidden']);
  exit;
}
return [
  'stripe_secret_key' => ${phpString(stripeSecret)},
  'supabase_url' => ${phpString(supabaseUrl)},
  'supabase_service_role_key' => ${phpString(serviceKey)},
  'fee_amount' => ${(Number(feeAmount) || 1000)},
  'fee_currency' => ${phpString(feeCurrency)},
];
`

if (!/^sk_(live|test)_/.test(stripeSecret)) {
  console.warn('Warning: STRIPE_SECRET_KEY missing — Hostinger /api/create-checkout-session.php will return 503 until you rebuild with sk_live_… in frontend/.env')
}

for (const target of targets) {
  rmSync(target, { recursive: true, force: true })
  mkdirSync(target, { recursive: true })
  cpSync(source, target, { recursive: true })
  const apiDir = join(target, 'api')
  mkdirSync(apiDir, { recursive: true })
  writeFileSync(join(apiDir, 'stripe-config.php'), stripeConfigPhp, 'utf8')
  const label = target.slice(root.length + 1).replace(/\\/g, '/')
  console.log(`Prepared ${label}/ for Hostinger`)
}
