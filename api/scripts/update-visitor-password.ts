import { hashSync } from 'bcryptjs'
import pg from 'pg'

const password = process.env.DEMO_PASSWORD ?? 'visitor!!'
const login = process.env.DEMO_LOGIN ?? 'visitor'

const client = new pg.Client({
  host: process.env.DB_HOST ?? 'localhost',
  user: process.env.DB_USER ?? 'tvdbuser',
  password: process.env.DB_PASSWORD ?? 'tvdbpass',
  database: process.env.DB_NAME ?? 'taskviewdb',
  port: Number(process.env.DB_PORT ?? 5433),
})

await client.connect()
const result = await client.query(
  'UPDATE tv_auth.users SET password = $1, block = 0 WHERE login = $2 RETURNING login',
  [hashSync(password, 10), login],
)
await client.end()

if (!result.rowCount) {
  console.error(`User "${login}" not found`)
  process.exit(1)
}

console.log(`Updated password for "${login}"`)
