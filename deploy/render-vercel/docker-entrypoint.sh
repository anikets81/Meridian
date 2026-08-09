#!/bin/sh
set -e

# Render injects PORT; the API reads APP_PORT.
export APP_PORT="${PORT:-${APP_PORT:-1401}}"

# Use Render's public URL when API_URL is not set manually.
if [ -n "${RENDER_EXTERNAL_URL:-}" ]; then
  export API_URL="${API_URL:-$RENDER_EXTERNAL_URL}"
  export API_PUBLIC_URL="${API_PUBLIC_URL:-$RENDER_EXTERNAL_URL}"
fi

echo "Waiting for Postgres at ${DB_HOST}:${DB_PORT}..."
until PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" -c '\q' 2>/dev/null; do
  echo "Postgres unavailable — retrying in 2s"
  sleep 2
done

echo "Running database migrations..."
TABLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'tasks';" 2>/dev/null | tr -d '[:space:]' || echo 0)

if [ -z "$TABLE_COUNT" ] || [ "$TABLE_COUNT" = "0" ]; then
  node /app-migration/taskview-db-migration.js --create
else
  node /app-migration/taskview-db-migration.js
fi

echo "Starting API on port ${APP_PORT}..."
cd /usr/src/app
exec pm2-runtime start ecosystem.config.js --env production
