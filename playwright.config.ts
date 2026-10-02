import { defineConfig, devices } from '@playwright/test';

const PORT = 5500;
const BASE_URL = `http://127.0.0.1:${PORT}`;

/**
 * Minimal Playwright config for the Simple Task Manager workshop demo.
 * Automatically serves the static app (index.html/style.css/script.js)
 * on PORT and points tests at it — no separate "start server" step needed.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: `npx http-server -p ${PORT} -c-1 .`,
    url: BASE_URL,
    reuseExistingServer: true,
  },
});
