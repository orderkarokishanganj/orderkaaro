import { defineConfig, devices } from '@playwright/test';

// End-to-end tests on a phone-sized screen against a production build (`npm run preview`).
// They read the real catalogue from Supabase but never create orders: place_order is intercepted
// in the browser (see tests/e2e/helpers.ts).
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    ...devices['Pixel 5'],
    // Uses the Chrome already installed on this computer; no browser download needed.
    channel: 'chrome',
    baseURL: 'http://localhost:4173',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
