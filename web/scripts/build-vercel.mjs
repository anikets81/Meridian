import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = join(webRoot, '..')

const env = {
  ...process.env,
  PNPM_CONFIG_ENGINE_STRICT: 'false',
}

/** @param {string} command @param {string} cwd */
function run(command, cwd) {
  console.log(`\n[build-vercel] (${cwd}) ${command}\n`)
  execSync(command, {
    cwd,
    env,
    stdio: 'inherit',
  })
}

const pnpm = 'pnpm --config.engine-strict=false'

run(`${pnpm} --filter taskview-db-schemas build`, repoRoot)
run(`${pnpm} --filter taskview-api build`, repoRoot)
run(`${pnpm} --filter capacitor-widget-bridge build`, repoRoot)
run('node ./scripts/generate-runtime-config.mjs', webRoot)
run(`${pnpm} exec vite build`, webRoot)
