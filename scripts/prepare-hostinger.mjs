/**
 * After Vite build, copy frontend/dist → repo-root dist/ and public_html/
 * for Hostinger static hosting. Payments use Supabase Edge Functions only
 * (no Hostinger PHP Stripe secrets in the deploy package).
 */
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'frontend', 'dist')
const targets = [join(root, 'dist'), join(root, 'public_html')]

if (!existsSync(join(source, 'index.html'))) {
  console.error('Missing frontend/dist/index.html — run the Vite build first.')
  process.exit(1)
}

for (const target of targets) {
  rmSync(target, { recursive: true, force: true })
  mkdirSync(target, { recursive: true })
  cpSync(source, target, { recursive: true })

  // Do not ship legacy Hostinger PHP payment APIs (Edge Function is the only path).
  const apiDir = join(target, 'api')
  rmSync(apiDir, { recursive: true, force: true })

  const label = target.slice(root.length + 1).replace(/\\/g, '/')
  console.log(`Prepared ${label}/ for Hostinger (static only, no /api payment PHP)`)
}
