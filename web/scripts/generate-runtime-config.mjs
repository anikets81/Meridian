import { writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outPath = join(root, 'public', 'config.js')

const apiUrl = process.env.TASKVIEW_API_URL?.trim().replace(/\/+$/, '')

if (!apiUrl) {
  console.log('[config] TASKVIEW_API_URL not set — skipping config.js generation (local dev).')
  process.exit(0)
}

const demoLogin = process.env.TASKVIEW_DEMO_LOGIN?.trim()
const demoPassword = process.env.TASKVIEW_DEMO_PASSWORD
const hideRegistration = process.env.TASKVIEW_DEMO_HIDE_REGISTRATION !== 'false'

const lines = [
  '// Generated at build time — do not edit on Vercel/production builds.',
  'window.__TASKVIEW_CONFIG__ = {',
  `  apiUrl: ${JSON.stringify(apiUrl)},`,
]

if (demoLogin && demoPassword) {
  lines.push('  demo: {')
  lines.push(`    login: ${JSON.stringify(demoLogin)},`)
  lines.push(`    password: ${JSON.stringify(demoPassword)},`)
  lines.push(`    hideRegistration: ${hideRegistration},`)
  lines.push('  },')
}

lines.push('}', '')

writeFileSync(outPath, lines.join('\n'))
console.log(`[config] Wrote ${outPath} (apiUrl=${apiUrl})`)
