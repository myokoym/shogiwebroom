const Redis = require('ioredis');
const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * Redis Connection Wrapper
 * Supports both Upstash Redis REST API and standard Redis with fallback capabilities
 */
class RedisClient {
  constructor(options = {}) {
    this.options = {
      retryAttempts: 3,
      retryDelay: 1000,
      defaultTTL: 24 * 60 * 60, // 24 hours in seconds
      connectionTimeout: 5000,
      operationTimeout: 3000,
      ...options
    };
    
    this.isUpstash = false;
    this.redisClient = null;
    this.memoryFallback = new Map();
    this.isConnected = false;
    this.isInitialized = false;
    
    // Initialize connection
    this.init();
  }

  /**
   * Initialize Redis connection
   */
  async init() {
    if (this.isInitialized) return;
    
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      console.log('Redis: No REDIS_URL provided, using memory fallback');
      this.isInitialized = true;
      return;
    }

    try {
      // Check if it's an Upstash Redis URL (https://)
      if (redisUrl.startsWith('https://')) {
        this.isUpstash = true;
        this.upstashUrl = redisUrl;
        this.upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
        
        if (!this.upstashToken) {
          throw new Error('UPSTASH_REDIS_REST_TOKEN is required for Upstash Redis');
        }
        
        console.log('Redis: Using Upstash Redis REST API');
        await this.testUpstashConnection();
      } else {
        // Standard Redis connection
        console.log('Redis: Using standard Redis connection');
        await this.initStandardRedis(redisUrl);
      }
      
      this.isConnected = true;
      console.log('Redis: Connection established successfully');
    } catch (error) {
      console.error('Redis: Connection failed, using memory fallback:', error.message);
      this.isConnected = false;
    }
    
    this.isInitialized = true;
  }

  /**
   * Initialize standard Redis connection
   */
  async initStandardRedis(redisUrl) {
    const retryStrategy = (times) => {
      if (times > this.options.retryAttempts) {
        return null; // Stop retrying
      }
      return Math.min(times * this.options.retryDelay, 3000);
    };

    this.redisClient = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
      retryDelayOnClusterDown: 300,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy
    });

    // Set up error handlers
    this.redisClient.on('error', (error) => {
      console.error('Redis: Connection error:', error.message);
      this.isConnected = false;
    });

    this.redisClient.on('connect', () => {
      console.log('Redis: Connected to server');
      this.isConnected = true;
    });

    this.redisClient.on('ready', () => {
      console.log('Redis: Ready to receive commands');
      this.isConnected = true;
    });

    this.redisClient.on('close', () => {
      console.log('Redis: Connection closed');
      this.isConnected = false;
    });

    // Test connection
    await this.redisClient.connect();
    await this.redisClient.ping();
  }

  /**
   * Test Upstash connection
   */
  async testUpstashConnection() {
    return this.makeUpstashRequest('PING');
  }

  /**
   * Make HTTP request to Upstash REST API
   */
  async makeUpstashRequest(command, ...args) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.upstashUrl);
      const postData = JSON.stringify([command, ...args]);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.upstashToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: this.options.operationTimeout
      };

      const request = https.request(options, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.error) {
              reject(new Error(result.error));
            } else {
              resolve(result.result);
            }
          } catch (error) {
            reject(new Error('Invalid JSON response from Upstash'));
          }
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });

      request.write(postData);
      request.end();
    });
  }

  /**
   * Execute Redis command with fallback
   */
  async executeCommand(operation, ...args) {
    if (!this.isInitialized) {
      await this.init();
    }

    if (!this.isConnected) {
      return this.executeMemoryFallback(operation, ...args);
    }

    try {
      if (this.isUpstash) {
        return await this.makeUpstashRequest(operation, ...args);
      } else {
        return await this.redisClient[operation.toLowerCase()](...args);
      }
    } catch (error) {
      console.error(`Redis: ${operation} failed, using memory fallback:`, error.message);
      this.isConnected = false;
      return this.executeMemoryFallback(operation, ...args);
    }
  }

  /**
   * Memory fallback for Redis operations
   */
  executeMemoryFallback(operation, ...args) {
    const op = operation.toLowerCase();
    
    switch (op) {
      case 'get':
        return this.memoryFallback.get(args[0]) || null;
        
      case 'set':
        this.memoryFallback.set(args[0], args[1]);
        // Auto-expire after default TTL
        setTimeout(() => {
          this.memoryFallback.delete(args[0]);
        }, this.options.defaultTTL * 1000);
        return 'OK';
        
      case 'setex':
        const setexKey = args[0];
        const setexTTL = args[1];
        const setexValue = args[2];
        this.memoryFallback.set(setexKey, setexValue);
        // Auto-expire after specified TTL
        setTimeout(() => {
          this.memoryFallback.delete(setexKey);
        }, setexTTL * 1000);
        return 'OK';
        
      case 'hget':
        const hashKey = args[0];
        const field = args[1];
        const hash = this.memoryFallback.get(hashKey);
        if (hash && typeof hash === 'object') {
          return hash[field] || null;
        }
        return null;
        
      case 'hset':
        const hsetKey = args[0];
        const hsetField = args[1];
        const hsetValue = args[2];
        let hsetHash = this.memoryFallback.get(hsetKey);
        if (!hsetHash || typeof hsetHash !== 'object') {
          hsetHash = {};
        }
        hsetHash[hsetField] = hsetValue;
        this.memoryFallback.set(hsetKey, hsetHash);
        // Auto-expire after default TTL
        setTimeout(() => {
          this.memoryFallback.delete(hsetKey);
        }, this.options.defaultTTL * 1000);
        return 1;
        
      case 'hmget':
        const hmgetKey = args[0];
        const fields = args[1];
        const hmgetHash = this.memoryFallback.get(hmgetKey);
        if (hmgetHash && typeof hmgetHash === 'object') {
          return fields.map(field => hmgetHash[field] || null);
        }
        return fields.map(() => null);
        
      case 'hmset':
        const hmsetKey = args[0];
        const hmsetFieldValues = args.slice(1);
        let hmsetHash = this.memoryFallback.get(hmsetKey);
        if (!hmsetHash || typeof hmsetHash !== 'object') {
          hmsetHash = {};
        }
        
        // Process field-value pairs
        for (let i = 0; i < hmsetFieldValues.length; i += 2) {
          const field = hmsetFieldValues[i];
          const value = hmsetFieldValues[i + 1];
          if (field !== undefined && value !== undefined) {
            hmsetHash[field] = value;
          }
        }
        
        this.memoryFallback.set(hmsetKey, hmsetHash);
        // Auto-expire after default TTL
        setTimeout(() => {
          this.memoryFallback.delete(hmsetKey);
        }, this.options.defaultTTL * 1000);
        return 'OK';
        
      case 'del':
        const deleted = this.memoryFallback.has(args[0]) ? 1 : 0;
        this.memoryFallback.delete(args[0]);
        return deleted;
        
      case 'expire':
        const expireKey = args[0];
        const expireSeconds = args[1];
        if (this.memoryFallback.has(expireKey)) {
          setTimeout(() => {
            this.memoryFallback.delete(expireKey);
          }, expireSeconds * 1000);
          return 1;
        }
        return 0;
        
      case 'ping':
        return 'PONG';
        
      default:
        console.warn(`Redis: Memory fallback does not support operation: ${operation}`);
        return null;
    }
  }

  /**
   * Get value from Redis
   */
  async get(key) {
    return this.executeCommand('GET', key);
  }

  /**
   * Set value in Redis with optional TTL
   */
  async set(key, value, ttl = null) {
    const actualTTL = ttl || this.options.defaultTTL;
    if (this.isConnected) {
      if (this.isUpstash) {
        return this.executeCommand('SET', key, value, 'EX', actualTTL);
      } else {
        return this.executeCommand('SETEX', key, actualTTL, value);
      }
    } else {
      // Use memory fallback with SET + EXPIRE
      await this.executeCommand('SET', key, value);
      await this.executeCommand('EXPIRE', key, actualTTL);
      return 'OK';
    }
  }

  /**
   * Get hash field value
   */
  async hget(key, field) {
    return this.executeCommand('HGET', key, field);
  }

  /**
   * Set hash field value
   */
  async hset(key, field, value) {
    const result = await this.executeCommand('HSET', key, field, value);
    // Set expiration for the hash key
    await this.expire(key, this.options.defaultTTL);
    return result;
  }

  /**
   * Get multiple hash fields
   */
  async hmget(key, fields) {
    return this.executeCommand('HMGET', key, fields);
  }

  /**
   * Set multiple hash fields
   */
  async hmset(key, ...fieldValues) {
    const result = await this.executeCommand('HMSET', key, ...fieldValues);
    // Set expiration for the hash key
    await this.expire(key, this.options.defaultTTL);
    return result;
  }

  /**
   * Batch set multiple hash fields from object
   * Optimized for the chess clock use case
   */
  async hsetBatch(key, fieldsObject) {
    const fieldValues = [];
    for (const [field, value] of Object.entries(fieldsObject)) {
      fieldValues.push(field, value);
    }
    
    if (fieldValues.length === 0) {
      return 0;
    }
    
    if (fieldValues.length === 2) {
      // Single field, use HSET
      return this.hset(key, fieldValues[0], fieldValues[1]);
    } else {
      // Multiple fields, use HMSET
      return this.hmset(key, ...fieldValues);
    }
  }

  /**
   * Delete key
   */
  async del(key) {
    return this.executeCommand('DEL', key);
  }

  /**
   * Set key expiration
   */
  async expire(key, seconds) {
    return this.executeCommand('EXPIRE', key, seconds);
  }

  /**
   * Ping Redis server
   */
  async ping() {
    return this.executeCommand('PING');
  }

  /**
   * Check if Redis is connected
   */
  isRedisConnected() {
    return this.isConnected;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      isUpstash: this.isUpstash,
      usingMemoryFallback: !this.isConnected,
      memoryKeys: this.memoryFallback.size
    };
  }

  /**
   * Gracefully disconnect
   */
  async disconnect() {
    if (this.redisClient && !this.isUpstash) {
      await this.redisClient.disconnect();
    }
    this.isConnected = false;
    console.log('Redis: Disconnected');
  }

  /**
   * Clean up memory fallback (remove expired entries)
   */
  cleanupMemory() {
    // This would be called periodically to clean up memory
    // For now, we rely on setTimeout for auto-expiration
    console.log(`Redis: Memory fallback contains ${this.memoryFallback.size} keys`);
  }
}

module.exports = RedisClient;