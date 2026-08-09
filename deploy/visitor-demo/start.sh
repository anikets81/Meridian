#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

[[ -f .env.postgresql ]] || cp .env.postgresql.example .env.postgresql
[[ -f .env.taskview ]] || cp .env.taskview.example .env.taskview

echo "Starting TaskView visitor demo..."
echo "(First run may take a few minutes for images, migration, and seed data)"
docker compose up -d

echo ""
echo "Demo starting. When seed completes:"
echo "  Web:      http://localhost:8888"
echo "  API:      http://localhost:1725"
echo ""
echo "  Username: visitor"
echo "  Password: visitor!!"
echo "  Or click 'Continue as demo user' on the login page (dev web / rebuilt web image)"
echo ""
echo "Track seed progress: docker compose logs -f seed-demo"
