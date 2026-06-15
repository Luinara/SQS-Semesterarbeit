import { defineConfig, devices } from '@playwright/test';

const localBaseURL = 'http://127.0.0.1:4200';
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? localBaseURL;

export default defineConfig({
  testDir: '../tests/e2e',
  fullyParallel: true,
  reporter: process.env.CI ? 'line' : 'html',
  use: {
    baseURL,
    headless: true,
    trace: 'on-first-retry',
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER
    ? undefined
    : {
        command: 'node ./node_modules/@angular/cli/bin/ng.js serve --host 127.0.0.1 --port 4200',
        url: localBaseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
