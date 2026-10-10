import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/reports-*.spec.ts',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:4321', channel: 'chrome', launchOptions: { args: ['--no-sandbox'] } },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 4321', url: 'http://127.0.0.1:4321/pt/reports/', reuseExistingServer: !process.env.CI },
});
