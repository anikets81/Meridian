#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -f .env.postgresql ]]; then
  cp .env.postgresql.example .env.postgresql
  echo "Created .env.postgresql — edit passwords before production use."
fi
if [[ ! -f .env.taskview ]]; then
  cp .env.taskview.example .env.taskview
  echo "Created .env.taskview — edit secrets before production use."
fi

echo "Starting TaskView (office setup)..."
docker compose up -d

echo ""
echo "TaskView is starting."
echo "  Web:  http://localhost:8888"
echo "  API:  http://localhost:1725"
echo ""
echo "Default admin (change after first login): user / user1!#Q"
