#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "Stopping demo and removing database volume..."
docker compose down -v

echo "Restarting with fresh demo data..."
docker compose up -d

echo ""
echo "Reset started. Watch seed: docker compose logs -f seed-demo"
echo "Login: visitor / visitor!!"
