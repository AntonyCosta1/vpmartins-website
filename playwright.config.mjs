import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:4173',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npx http-server . -p 4173 -s -c-1',
    url: 'http://localhost:4173/index.html',
    reuseExistingServer: true,
  },
});
