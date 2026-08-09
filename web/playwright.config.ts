import { defineConfig, devices } from '@playwright/test'

const WEB_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5174'
const API_URL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:1725'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: WEB_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Reuse the already-running Vite server on 5174
  webServer: undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  metadata: { apiUrl: API_URL },
})
