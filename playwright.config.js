/**
 * Playwright E2E Test Configuration
 * For testing critical user paths in Shogiwebroom
 */

module.exports = {
  testDir: './test/e2e',
  testMatch: '**/*.spec.js',
  
  // Test timeout
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },

  // Run tests in parallel
  fullyParallel: true,
  workers: 2,

  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Reporter
  reporter: process.env.CI ? 'github' : 'list',

  // Shared settings for all the projects
  use: {
    // Base URL
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Emulate real browser conditions
    viewport: { width: 1280, height: 720 },
    
    // Timeout for actions
    actionTimeout: 10000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
    // Firefox disabled for now (installation timeout)
    // {
    //   name: 'firefox',
    //   use: {
    //     browserName: 'firefox',
    //   },
    // },
  ],

  // Run local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
};