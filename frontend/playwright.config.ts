import { defineConfig, devices } from '@playwright/test';

const localBaseURL = 'http://127.0.0.1:4200';
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? localBaseURL;
const shouldCreateDemoEvidence = process.env.PLAYWRIGHT_EVIDENCE === '1';
const shouldRunMobileCheck = process.env.PLAYWRIGHT_MOBILE_CHECK === '1';
const reporter = resolveReporter();

export default defineConfig({
  testDir: '../tests/e2e',
  fullyParallel: true,
  reporter,
  use: {
    baseURL,
    headless: true,
    screenshot: shouldCreateDemoEvidence ? 'on' : 'only-on-failure',
    trace: shouldCreateDemoEvidence ? 'on' : 'on-first-retry',
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
    ...(shouldRunMobileCheck
      ? [
          {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
          },
        ]
      : []),
  ],
});

function resolveReporter() {
  if (shouldCreateDemoEvidence) {
    return [['html', { open: 'never' }], ['line']];
  }

  return process.env.CI ? 'line' : 'html';
}
