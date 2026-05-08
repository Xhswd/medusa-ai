#!/usr/bin/env bash
set -euo pipefail

echo "=== Medusa AI Setup ==="

command -v docker >/dev/null 2>&1 || { echo "Error: docker is required"; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo "Error: docker compose is required"; exit 1; }

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example -- please edit with your settings"
fi

echo "Starting PostgreSQL..."
docker compose up -d postgres

echo "Waiting for PostgreSQL..."
until docker compose exec postgres pg_isready -U medusa >/dev/null 2>&1; do
  sleep 1
done

echo "Building Medusa..."
docker compose build medusa

echo "Running migrations..."
docker compose run --rm medusa npx medusa db:migrate

echo "Creating admin user..."
docker compose run --rm medusa npx medusa user -e admin@example.com -p supersecret || true

echo "Starting Medusa..."
docker compose up -d medusa

echo ""
echo "=== Setup Complete ==="
echo "Admin dashboard: http://localhost:9000/app"
echo "Store API:       http://localhost:9000/store"
echo "Admin API:       http://localhost:9000/admin"
echo ""
echo "Login: admin@example.com / supersecret"
