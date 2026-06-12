#!/usr/bin/env bash
# Dieses Skript bündelt den lokalen Frontend-Setup in einem Einstiegspunkt.
# So muss man für ein Uni-Projekt nicht mehrere Befehle auswendig kennen.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"

echo "==> Wechsle in das Frontend-Verzeichnis..."
cd "$FRONTEND_DIR"

echo "==> Installiere npm-Abhängigkeiten..."
npm install

echo "==> Prüfe TypeScript-Typen..."
npm run type-check

echo "==> Erzeuge einen Produktions-Build zur Verifikation..."
npm run build

echo "==> Frontend-Setup abgeschlossen."
echo "==> Starte die App anschließend mit: npm start"
