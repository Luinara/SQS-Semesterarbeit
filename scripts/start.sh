#!/usr/bin/env bash
# start.sh – Start the full stack via Docker Compose
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "==> Starting services with Docker Compose..."
cd "$ROOT_DIR"
docker compose up --build "$@"
