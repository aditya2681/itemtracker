import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
const localChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync(localChrome) ? localChrome : undefined);
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90000,
  expect: { timeout: 20000 },
  use: { baseURL: 'http://localhost:5187', viewport: { width: 360, height: 780 }, launchOptions: executablePath ? { executablePath } : {} },
  webServer: { command: 'npm run dev -- --host localhost --port 5187 --strictPort', port: 5187, reuseExistingServer: false, timeout: 30000, env: { ...process.env, VITE_CONVEX_URL: 'https://aromatic-emu-434.eu-west-1.convex.cloud' } },
});
