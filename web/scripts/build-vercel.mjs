import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = join(webRoot, '..')

if (!existsSync(join(repoRoot, 'pnpm-workspace.yaml'))) {
  console.error('[build-vercel] Could not find monorepo root (pnpm-workspace.yaml).')
  console.error(`  cwd: ${process.cwd()}`)
  console.error(`  webRoot: ${webRoot}`)
  console.error(`  repoRoot: ${repoRoot}`)
  console.error('  If Vercel Root Directory is "web", enable "Include source files outside Root Directory".')
  process.exit(1)
}

console.log('[build-vercel] cwd:', process.cwd())
console.log('[build-vercel] repoRoot:', repoRoot)
console.log('[build-vercel] webRoot:', webRoot)

const env = {
  ...process.env,
  PNPM_CONFIG_ENGINE_STRICT: 'false',
}

/** @param {string} command @param {string} cwd */
function run(command, cwd) {
  console.log(`\n[build-vercel] (${cwd}) ${command}\n`)
  try {
    execSync(command, {
      cwd,
      env,
      stdio: 'inherit',
    })
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error ? error.status : 1
    console.error(`[build-vercel] Step failed with exit code ${status ?? 1}`)
    process.exit(status ?? 1)
  }
}

const pnpm = 'pnpm --config.engine-strict=false'

run(`${pnpm} --filter taskview-db-schemas build`, repoRoot)
run(`${pnpm} --filter taskview-api build`, repoRoot)
run(`${pnpm} --filter capacitor-widget-bridge build`, repoRoot)
run('node ./scripts/generate-runtime-config.mjs', webRoot)
run(`${pnpm} exec vite build`, webRoot)
