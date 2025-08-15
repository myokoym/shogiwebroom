const Redis = require('ioredis');

class RedisClient {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.inMemoryCache = new Map();
    this.defaultTTL = 86400; // 24時間（秒）
    
    this.init();
  }

  init() {
    try {
      const redisUrl = process.env.REDIS_URL;
      
      if (redisUrl) {
        console.log('Connecting to Redis with URL:', redisUrl.replace(/:[^:]*@/, ':***@'));
        this.redis = new Redis(redisUrl, {
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxRetriesPerRequest: null,
        });
      } else {
        console.log('Connecting to local Redis');
        this.redis = new Redis();
      }

      this.redis.on('connect', () => {
        console.log('Redis connected successfully');
        this.isConnected = true;
      });

      this.redis.on('error', (err) => {
        console.error('Redis connection error:', err.message);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        console.log('Redis connection closed');
        this.isConnected = false;
      });

    } catch (error) {
      console.error('Failed to initialize Redis:', error.message);
      this.isConnected = false;
    }
  }

  async ping() {
    try {
      if (this.redis && this.isConnected) {
        const result = await this.redis.ping();
        return result === 'PONG';
      }
      return false;
    } catch (error) {
      console.error('Redis ping failed:', error.message);
      return false;
    }
  }

  async get(key) {
    try {
      if (this.redis && this.isConnected) {
        const result = await this.redis.get(key);
        return result;
      } else {
        console.warn('Redis unavailable, using in-memory fallback for GET:', key);
        return this.inMemoryCache.get(key) || null;
      }
    } catch (error) {
      console.error('Redis GET error for key:', key, error.message);
      return this.inMemoryCache.get(key) || null;
    }
  }

  async set(key, value, ttl = null) {
    try {
      const ttlToUse = ttl || this.defaultTTL;
      
      if (this.redis && this.isConnected) {
        await this.redis.setex(key, ttlToUse, value);
      } else {
        console.warn('Redis unavailable, using in-memory fallback for SET:', key);
        this.inMemoryCache.set(key, value);
        
        // インメモリキャッシュのTTL処理
        setTimeout(() => {
          this.inMemoryCache.delete(key);
        }, ttlToUse * 1000);
      }
    } catch (error) {
      console.error('Redis SET error for key:', key, error.message);
      this.inMemoryCache.set(key, value);
      
      // エラー時のフォールバック用TTL
      setTimeout(() => {
        this.inMemoryCache.delete(key);
      }, (ttl || this.defaultTTL) * 1000);
    }
  }

  // 既存のコールバック形式のgetメソッドとの互換性維持
  get(key, callback) {
    if (typeof callback === 'function') {
      this.getAsync(key)
        .then(result => callback(null, result))
        .catch(error => callback(error, null));
    } else {
      return this.getAsync(key);
    }
  }

  async getAsync(key) {
    try {
      if (this.redis && this.isConnected) {
        const result = await this.redis.get(key);
        return result;
      } else {
        console.warn('Redis unavailable, using in-memory fallback for GET:', key);
        return this.inMemoryCache.get(key) || null;
      }
    } catch (error) {
      console.error('Redis GET error for key:', key, error.message);
      return this.inMemoryCache.get(key) || null;
    }
  }

  // 既存のsetメソッドとの互換性維持（コールバックなし）
  set(key, value, ttlOrCallback, callback) {
    let ttl = this.defaultTTL;
    let cb = null;

    // 引数の処理
    if (typeof ttlOrCallback === 'function') {
      cb = ttlOrCallback;
    } else if (typeof ttlOrCallback === 'number') {
      ttl = ttlOrCallback;
      cb = callback;
    }

    this.setAsync(key, value, ttl)
      .then(() => {
        if (cb) cb(null, 'OK');
      })
      .catch(error => {
        if (cb) cb(error, null);
      });
  }

  async setAsync(key, value, ttl = null) {
    try {
      const ttlToUse = ttl || this.defaultTTL;
      
      if (this.redis && this.isConnected) {
        await this.redis.setex(key, ttlToUse, value);
      } else {
        console.warn('Redis unavailable, using in-memory fallback for SET:', key);
        this.inMemoryCache.set(key, value);
        
        // インメモリキャッシュのTTL処理
        setTimeout(() => {
          this.inMemoryCache.delete(key);
        }, ttlToUse * 1000);
      }
    } catch (error) {
      console.error('Redis SET error for key:', key, error.message);
      this.inMemoryCache.set(key, value);
      
      // エラー時のフォールバック用TTL
      setTimeout(() => {
        this.inMemoryCache.delete(key);
      }, (ttl || this.defaultTTL) * 1000);
    }
  }

  disconnect() {
    if (this.redis) {
      this.redis.disconnect();
    }
    this.inMemoryCache.clear();
  }
}

// シングルトンインスタンスを作成
const redisClient = new RedisClient();

module.exports = redisClient;