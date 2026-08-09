import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..')
const script = join(repoRoot, 'web', 'scripts', 'build-vercel.mjs')

if (!existsSync(script)) {
  console.error(`[build-vercel] Missing script: ${script}`)
  process.exit(1)
}

const result = spawnSync(process.execPath, [script], {
  cwd: repoRoot,
  env: process.env,
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
