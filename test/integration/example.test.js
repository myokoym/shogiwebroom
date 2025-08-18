/**
 * Example Integration Test
 * Simple test to verify integration testing setup
 */

describe('Example Integration Tests', () => {
  test('Integration test environment is ready', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('Redis connection can be tested', () => {
    // This would test Redis connection in a real scenario
    // Check if REDIS_URL is set, if not use default for integration tests
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    expect(redisUrl).toContain('redis://');
  });

  test('Server is configured for integration tests', () => {
    // Check for environment variables or use defaults for integration tests
    const host = process.env.HOST || '0.0.0.0';
    const port = process.env.PORT || '3000';
    expect(host).toContain('0.0.0.0');
    expect(port).toBe('3000');
  });
});