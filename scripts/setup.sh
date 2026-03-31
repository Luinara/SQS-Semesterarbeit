#!/usr/bin/env bash
# setup.sh – Install all project dependencies (backend + frontend)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "==> Installing backend dependencies (Maven)..."
cd "$ROOT_DIR/backend"
mvn --no-transfer-progress dependency:resolve

echo "==> Installing frontend dependencies (npm)..."
cd "$ROOT_DIR/frontend"
npm install

echo "==> Setup complete."
