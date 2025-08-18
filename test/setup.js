/**
 * Jest Test Setup
 * Global test configuration and utilities
 */

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment below lines to silence console output in tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
  // info: jest.fn(),
  // debug: jest.fn(),
};

// Global test utilities
global.nextTick = () => new Promise(resolve => process.nextTick(resolve));

// Vue Test Utils configuration
const { config } = require('@vue/test-utils');

// Global stubs for common components using component objects instead of strings
config.stubs = {
  'nuxt-link': { template: '<a><slot /></a>' },
  'router-link': { template: '<a><slot /></a>' },
  'no-ssr': { template: '<span><slot /></span>' },
  'client-only': { template: '<span><slot /></span>' }
};

// Mock Nuxt context
const mockNuxtContext = {
  $router: {
    push: jest.fn(),
    replace: jest.fn(),
    go: jest.fn(),
    back: jest.fn(),
    forward: jest.fn()
  },
  $route: {
    path: '/',
    params: {},
    query: {},
    hash: ''
  },
  $store: {
    state: {},
    getters: {},
    dispatch: jest.fn(),
    commit: jest.fn()
  }
};

// Global mocks
global.$nuxt = mockNuxtContext;

// Set up fetch mock for tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
    status: 200,
    statusText: 'OK'
  })
);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});