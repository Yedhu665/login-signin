const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: '.',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'https://aakri.in',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(__dirname, 'storageState.json'),
      },
      dependencies: ['setup'],
    },
  ],
});
