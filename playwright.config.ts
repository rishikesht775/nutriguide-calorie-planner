import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173';
const useLocalServer = !process.env.PLAYWRIGHT_BASE_URL || /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/.test(baseURL);
const devCommand = process.platform === 'win32' ? 'npm.cmd run dev' : 'npm run dev';
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
const configuredWorkers = process.env.PLAYWRIGHT_WORKERS;
const workers = configuredWorkers ? Number(configuredWorkers) : 1;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // Keep local runs serial by default. The dev server is stateful and can
  // become unresponsive when every project starts at once. Override with
  // PLAYWRIGHT_WORKERS when the environment can handle more concurrency.
  workers,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    testIdAttribute: 'data-testid',
    ...(executablePath ? { launchOptions: { executablePath, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--no-zygote', '--single-process'] } } : {}),
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
  webServer: useLocalServer
    ? {
        command: devCommand,
        url: `${baseURL}/legacy`,
        reuseExistingServer: true,
        timeout: 180_000,
      }
    : undefined,
});
