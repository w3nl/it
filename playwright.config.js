// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } }, testIgnore: /phone\.spec/ },
    { name: 'phone', use: { ...devices['Pixel 7'] }, testMatch: /phone\.spec/ },
    // Firefox runs the moving-parts tests when PW_FIREFOX=1 (set in the "Play the game" workflow).
    ...(process.env.PW_FIREFOX ? [{ name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 900 } }, testMatch: /(motion|fun)\.spec/ }] : []),
  ],
  webServer: {
    command: 'node tests/serve.js',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
});
