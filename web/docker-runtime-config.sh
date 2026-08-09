#!/bin/sh
# Generates runtime config for the SPA from environment variables.
# Runs automatically at container start (nginx docker-entrypoint.d).
set -e

write_config() {
  parts=""

  if [ -n "${TASKVIEW_API_URL:-}" ]; then
    parts="apiUrl: \"${TASKVIEW_API_URL}\""
  fi

  if [ -n "${TASKVIEW_DEMO_LOGIN:-}" ] && [ -n "${TASKVIEW_DEMO_PASSWORD:-}" ]; then
    hide_registration="${TASKVIEW_DEMO_HIDE_REGISTRATION:-true}"
    demo_block="demo: { login: \"${TASKVIEW_DEMO_LOGIN}\", password: \"${TASKVIEW_DEMO_PASSWORD}\", hideRegistration: ${hide_registration} }"
    if [ -n "$parts" ]; then
      parts="${parts}, ${demo_block}"
    else
      parts="$demo_block"
    fi
  fi

  if [ -n "$parts" ]; then
    echo "window.__TASKVIEW_CONFIG__ = { ${parts} };" > /usr/share/nginx/html/config.js
    echo "TaskView runtime config written (apiUrl=${TASKVIEW_API_URL:-unset}, demo=${TASKVIEW_DEMO_LOGIN:-unset})"
  fi
}

write_config
