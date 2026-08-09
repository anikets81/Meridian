#!/usr/bin/env sh
# Seed the visitor demo user + sample data into the local dev stack (API on :8080, Postgres on :5433).
set -e
cd "$(dirname "$0")/seed"

export API_URL="${API_URL:-http://localhost:8080}"
export DB_HOST="${DB_HOST:-localhost}"
export DB_USER="${DB_USER:-tvdbuser}"
export DB_PASSWORD="${DB_PASSWORD:-tvdbpass}"
export DB_NAME="${DB_NAME:-taskviewdb}"
export DB_PORT="${DB_PORT:-5433}"

echo "Seeding visitor demo into local dev API ($API_URL)..."
bun run seed-demo.ts

echo ""
echo "Demo login:"
echo "  Username: visitor"
echo "  Password: visitor!!"
