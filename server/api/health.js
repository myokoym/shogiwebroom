const express = require('express');
const router = express.Router();
const redis = require('../lib/redis-client');

// アプリケーション開始時刻
const startTime = Date.now();

/**
 * Redisのレイテンシーを測定
 */
async function measureRedisLatency() {
  try {
    if (!redis.redis || !redis.isConnected) {
      return null;
    }
    
    const start = Date.now();
    await redis.ping();
    const end = Date.now();
    return end - start;
  } catch (error) {
    console.error('Redis latency measurement failed:', error.message);
    return null;
  }
}

/**
 * システム全体のヘルスチェック
 */
router.get('/', async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    
    // Redis接続状態とレイテンシーを取得
    const redisConnected = await redis.ping();
    const redisLatency = await measureRedisLatency();
    
    // メモリ使用量を取得
    const memoryUsage = process.memoryUsage();
    
    // システム状態を判定
    const isHealthy = redisConnected !== false; // Redis接続が成功またはフォールバック状態
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      service: 'shogiwebroom',
      redis: {
        connected: redisConnected,
        latency: redisLatency
      },
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external
      },
      uptime
    };
    
    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json(healthData);
    
  } catch (error) {
    console.error('Health check error:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'shogiwebroom',
      error: {
        message: 'Internal health check error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      redis: {
        connected: false,
        latency: null
      },
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0
      },
      uptime: Math.floor((Date.now() - startTime) / 1000)
    });
  }
});

/**
 * Redis詳細ヘルスチェック
 */
router.get('/redis', async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    
    // Redis接続状態の詳細チェック
    const pingResult = await redis.ping();
    const latency = await measureRedisLatency();
    
    // Redis接続情報
    const redisInfo = {
      connected: pingResult,
      latency,
      connectionStatus: redis.isConnected ? 'connected' : 'disconnected',
      fallbackMode: !redis.isConnected && redis.inMemoryCache.size >= 0
    };
    
    // インメモリキャッシュの統計（フォールバック時）
    if (!redis.isConnected) {
      redisInfo.inMemoryCache = {
        size: redis.inMemoryCache.size,
        keys: Array.from(redis.inMemoryCache.keys())
      };
    }
    
    const isHealthy = pingResult !== false;
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      service: 'shogiwebroom',
      component: 'redis',
      redis: redisInfo
    };
    
    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json(healthData);
    
  } catch (error) {
    console.error('Redis health check error:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'shogiwebroom',
      component: 'redis',
      error: {
        message: 'Redis health check failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      redis: {
        connected: false,
        latency: null,
        connectionStatus: 'error',
        fallbackMode: false
      }
    });
  }
});

module.exports = router;