// Die E2E-Spezifikationen liegen bewusst im zentralen /tests-Ordner.
// Dieser kleine Re-Export sorgt dafür, dass die Dateien trotzdem sauber
// auf das Playwright-Paket aus frontend/node_modules zugreifen können.
export { expect, test } from '@playwright/test';
