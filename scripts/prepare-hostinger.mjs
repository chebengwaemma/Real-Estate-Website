/**
 * After Vite build, copy frontend/dist → repo-root dist/ and public_html/
 * so Hostinger Git deploy (output: dist) and File Manager (public_html) both work.
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
  const label = target.slice(root.length + 1).replace(/\\/g, '/')
  console.log(`Prepared ${label}/ for Hostinger`)
}
