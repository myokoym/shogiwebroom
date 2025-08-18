/**
 * Example Unit Test
 * Simple test to verify Jest configuration is working
 */

describe('Example Unit Tests', () => {
  test('Jest is configured correctly', () => {
    expect(true).toBe(true);
  });

  test('Environment variables are set for testing', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('Global utilities are available', () => {
    expect(typeof global.nextTick).toBe('function');
  });

  test('Mock fetch is available', () => {
    expect(typeof global.fetch).toBe('function');
  });
});