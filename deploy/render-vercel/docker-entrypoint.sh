#!/bin/sh
set -e

# Render injects PORT; the API reads APP_PORT.
export APP_PORT="${PORT:-${APP_PORT:-1401}}"
export TRUST_PROXY="${TRUST_PROXY:-true}"

# Render sets RENDER_EXTERNAL_URL once the service has a public URL.
if [ -n "${RENDER_EXTERNAL_URL:-}" ]; then
  export API_URL="${API_URL:-$RENDER_EXTERNAL_URL}"
  export API_PUBLIC_URL="${API_PUBLIC_URL:-$RENDER_EXTERNAL_URL}"
  export APP_URL="${APP_URL:-$RENDER_EXTERNAL_URL}"
fi

# APP_URL is required by the API — use a safe local fallback during first boot.
export APP_URL="${APP_URL:-http://127.0.0.1:${APP_PORT}}"

run_migrations() {
  echo "Waiting for Postgres at ${DB_HOST}:${DB_PORT}..."
  tries=0
  max_tries=90
  until PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" -c '\q' 2>/dev/null; do
    tries=$((tries + 1))
    if [ "$tries" -ge "$max_tries" ]; then
      echo "Postgres not available after ${max_tries} attempts"
      exit 1
    fi
    echo "Postgres unavailable — retrying (${tries}/${max_tries})"
    sleep 2
  done

  echo "Running database migrations..."
  TABLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'tasks';" 2>/dev/null | tr -d '[:space:]' || echo 0)

  if [ -z "$TABLE_COUNT" ] || [ "$TABLE_COUNT" = "0" ]; then
    node /app-migration/taskview-db-migration.js --create
  else
    node /app-migration/taskview-db-migration.js
  fi

  echo "Migrations complete"
}

# Run migrations in the background so the web server can pass Render health checks quickly.
run_migrations &
MIGRATION_PID=$!

cleanup() {
  if kill -0 "$MIGRATION_PID" 2>/dev/null; then
    wait "$MIGRATION_PID" || true
  fi
}
trap cleanup EXIT

echo "Starting API on port ${APP_PORT}..."
cd /usr/src/app

pm2-runtime start ecosystem.config.js --env production &
PM2_PID=$!

if [ "${SEED_DEMO_USER:-true}" != "false" ]; then
  (
    echo "Waiting for API before demo user seed..."
    tries=0
    max_tries=90
    until curl -sf "http://127.0.0.1:${APP_PORT}/health" >/dev/null 2>&1; do
      tries=$((tries + 1))
      if [ "$tries" -ge "$max_tries" ]; then
        echo "Demo user seed skipped — API health check timed out"
        exit 0
      fi
      sleep 2
    done
    DEMO_SEED_API_URL="http://127.0.0.1:${APP_PORT}" \
      DEMO_LOGIN="${DEMO_LOGIN:-visitor}" \
      DEMO_PASSWORD="${DEMO_PASSWORD:-visitor!!}" \
      DEMO_EMAIL="${DEMO_EMAIL:-visitor@demo.taskview.local}" \
      SEED_DEMO_USER="${SEED_DEMO_USER:-true}" \
      node /ensure-demo-user.mjs || true
  ) &
fi

wait "$PM2_PID"
