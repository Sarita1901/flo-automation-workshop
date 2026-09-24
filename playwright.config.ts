import { defineConfig, devices } from '@playwright/test';

/**
 * Yammer / Viva Engage requires an authenticated Microsoft 365 session.
 * We reuse a stored session via `storageState` so tests don't perform SSO
 * each run. Run `npx playwright codegen ...` once, sign in, and save
 * `auth/user.json`, or wire up a `global-setup` script.
 */
export default defineConfig({
    testDir: './tests',
    timeout: 60_000,
    expect: {
        timeout: 15_000,
    },
    fullyParallel: false,
    retries: 0,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: 'https://engage.cloud.microsoft',
        headless: false,
        viewport: { width: 1440, height: 900 },
        actionTimeout: 15_000,
        navigationTimeout: 30_000,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        storageState: 'auth/user.json', // enable after first sign-in capture
    },
    projects: [
        {
            name: 'chromium',
            // Use the locally installed Google Chrome instead of Playwright's
            // bundled Chromium (workaround for CDN download timeouts).
            use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        },
    ],
});
