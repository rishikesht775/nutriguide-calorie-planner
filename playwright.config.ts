import { defineConfig, devices } from '@playwright/test';
import { readExecutionProfile } from './scripts/execution-profile.mjs';
import { testServerSettings } from './scripts/dev-server-settings.mjs';

const server = testServerSettings(process.env.PLAYWRIGHT_BASE_URL, readExecutionProfile() === 'managed-linux');
const baseURL = server.baseURL;
const useLocalServer = server.local;
// Direct Node invocation avoids npm.cmd shell differences on Windows.
const devCommand = [JSON.stringify(process.execPath), 'scripts/run-framework.mjs', 'dev', ...server.args].join(' ');
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
  reporter: [['./tests/reporters/text-reporter.mjs'], ['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
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
        reuseExistingServer: false,
        timeout: 180_000,
      }
    : undefined,
});
