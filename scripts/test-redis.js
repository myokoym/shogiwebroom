#!/usr/bin/env node

/**
 * Redis Connection Test Script
 * Tests basic Redis connectivity using ioredis
 */

const Redis = require('ioredis');

async function testRedisConnection() {
  const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
  console.log(`Testing Redis connection to: ${redisUrl}`);
  
  let redis;
  
  try {
    // Create Redis client
    redis = new Redis(redisUrl, {
      connectTimeout: 5000,
      lazyConnect: true,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });
    
    // Connect to Redis
    await redis.connect();
    console.log('✓ Successfully connected to Redis');
    
    // Test ping/pong
    const pong = await redis.ping();
    if (pong === 'PONG') {
      console.log('✓ Redis ping/pong test successful');
    } else {
      throw new Error(`Unexpected ping response: ${pong}`);
    }
    
    // Test set/get
    const testKey = 'test:connection:' + Date.now();
    const testValue = 'test_value_' + Math.random();
    
    await redis.set(testKey, testValue);
    console.log('✓ Redis set operation successful');
    
    const retrievedValue = await redis.get(testKey);
    if (retrievedValue === testValue) {
      console.log('✓ Redis get operation successful');
    } else {
      throw new Error(`Value mismatch. Expected: ${testValue}, Got: ${retrievedValue}`);
    }
    
    // Cleanup test key
    await redis.del(testKey);
    console.log('✓ Test key cleanup successful');
    
    // Test Redis info
    const info = await redis.info('server');
    if (info && info.includes('redis_version')) {
      console.log('✓ Redis server info retrieved successfully');
      const versionMatch = info.match(/redis_version:([^\r\n]+)/);
      if (versionMatch) {
        console.log(`  Redis version: ${versionMatch[1]}`);
      }
    }
    
    console.log('\n🎉 All Redis tests passed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Redis connection test failed:');
    console.error(`Error: ${error.message}`);
    
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    
    if (error.errno) {
      console.error(`Error number: ${error.errno}`);
    }
    
    console.error('\nTroubleshooting:');
    console.error('1. Ensure Redis server is running');
    console.error('2. Check Redis connection URL');
    console.error('3. Verify network connectivity');
    console.error('4. Check firewall settings');
    
    process.exit(1);
    
  } finally {
    // Ensure Redis connection is closed
    if (redis) {
      try {
        await redis.quit();
        console.log('✓ Redis connection closed gracefully');
      } catch (closeError) {
        console.warn('Warning: Error closing Redis connection:', closeError.message);
      }
    }
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, exiting...');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, exiting...');
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the test
if (require.main === module) {
  testRedisConnection();
}

module.exports = testRedisConnection;