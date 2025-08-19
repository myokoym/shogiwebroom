module.exports = {
  // Nuxt.js 2.x configuration
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^vue$': 'vue/dist/vue.common.js'
  },
  
  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>'],
  
  // File extensions to test
  moduleFileExtensions: [
    'js',
    'vue',
    'json'
  ],
  
  // Transform files
  transform: {
    '^.+\\.js$': 'babel-jest'
    // Vue transform disabled for now - uncomment when vue-jest is installed
    // '.*\\.(vue)$': 'vue-jest'
  },
  
  // Vue serializer for snapshots (disabled for now)
  // snapshotSerializers: ['jest-serializer-vue'],
  
  // Test match patterns
  testMatch: [
    '**/test/**/*.spec.(js|jsx|ts|tsx)',
    '**/test/**/*.test.(js|jsx|ts|tsx)',
    '**/__tests__/**/*.(js|jsx|ts|tsx)'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Coverage settings - removed duplicate, see bottom of file
  collectCoverageFrom: [
    // Vue files excluded until vue-jest is properly configured
    // '<rootDir>/components/**/*.vue',
    // '<rootDir>/pages/**/*.vue',
    // '<rootDir>/layouts/**/*.vue',
    '<rootDir>/store/**/*.js',
    '<rootDir>/server/**/*.js',
    '!<rootDir>/server/index.js', // Exclude main server file
    '!**/node_modules/**'
  ],
  coverageDirectory: '<rootDir>/tmp/coverage',
  coverageReporters: process.env.DOCKER_CONTAINER ? ['text-summary'] : ['html', 'text-summary', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10
    }
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.nuxt/',
    '<rootDir>/node_modules/',
    '<rootDir>/test/e2e/'  // E2E tests should be run with Playwright
  ],
  
  // Module paths for better resolution
  modulePaths: ['<rootDir>'],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Test timeout
  testTimeout: 10000,
  
  // Always show individual test results like RSpec
  verbose: true,
  
  // Always collect coverage
  collectCoverage: true
}