/**
 * Ensures the public demo account exists (login via API registration).
 * Runs once after the API starts on Render (see docker-entrypoint.sh).
 */

const apiBase = (process.env.DEMO_SEED_API_URL || `http://127.0.0.1:${process.env.APP_PORT || process.env.PORT || 1401}`).replace(/\/+$/, '')
const login = (process.env.DEMO_LOGIN || 'visitor').trim()
const password = process.env.DEMO_PASSWORD || 'visitor!!'
const email = (process.env.DEMO_EMAIL || 'visitor@demo.taskview.local').trim()

async function tryLogin() {
  const res = await fetch(`${apiBase}/module/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  })
  return res.ok
}

async function tryRegister() {
  const res = await fetch(`${apiBase}/module/auth/registration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      login,
      email,
      password,
      passwordRepeat: password,
    }),
  })
  return res.ok
}

async function main() {
  if (process.env.SEED_DEMO_USER === 'false') {
    console.log('[demo-user] SEED_DEMO_USER=false — skipping')
    return
  }

  if (await tryLogin()) {
    console.log(`[demo-user] "${login}" is ready`)
    return
  }

  console.log(`[demo-user] Creating "${login}" via registration...`)
  if (await tryRegister()) {
    console.log(`[demo-user] Registered "${login}"`)
    return
  }

  if (await tryLogin()) {
    console.log(`[demo-user] "${login}" already existed — login OK`)
    return
  }

  console.warn('[demo-user] Could not create or verify demo user (registration may be disabled)')
}

main().catch((err) => {
  console.warn('[demo-user] Failed:', err instanceof Error ? err.message : err)
})
