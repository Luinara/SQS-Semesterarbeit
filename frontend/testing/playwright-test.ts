// Die E2E-Spezifikationen liegen bewusst im zentralen /tests-Ordner.
// Dieser kleine Re-Export sorgt dafuer, dass die Dateien trotzdem sauber
// auf das Playwright-Paket aus frontend/node_modules zugreifen koennen.
export { expect, test } from '@playwright/test';
