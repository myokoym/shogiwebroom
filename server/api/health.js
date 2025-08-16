const express = require('express')
const router = express.Router()

// Track server start time for uptime calculation
const startTime = new Date()

// Health check endpoint
router.get('/health', async (req, res) => {
  const startCheck = process.hrtime()
  
  try {
    // Get Redis instance from the parent scope (will be passed in)
    const redis = req.app.locals.redis
    
    // Basic system information
    const memUsage = process.memoryUsage()
    const uptime = new Date() - startTime
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime / 1000), // uptime in seconds
      version: require('../../package.json').version,
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024) // MB
      },
      services: {}
    }

    // Test Redis connection
    let redisStatus = 'unknown'
    let redisError = null
    
    if (redis) {
      try {
        // Use ping with timeout
        const pingResult = await Promise.race([
          redis.ping(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Redis ping timeout')), 2000)
          )
        ])
        
        if (pingResult === 'PONG') {
          redisStatus = 'healthy'
        } else {
          redisStatus = 'unhealthy'
          redisError = 'Unexpected ping response'
        }
        
        // Add connection status info
        const status = redis.getStatus()
        healthData.services.redis = {
          status: redisStatus,
          connected: status.connected,
          isUpstash: status.isUpstash,
          usingMemoryFallback: status.usingMemoryFallback,
          memoryKeys: status.memoryKeys,
          ...(redisError && { error: redisError })
        }
      } catch (error) {
        redisStatus = 'unhealthy'
        redisError = error.message
        const status = redis.getStatus()
        healthData.services.redis = {
          status: redisStatus,
          connected: status.connected,
          isUpstash: status.isUpstash,
          usingMemoryFallback: status.usingMemoryFallback,
          memoryKeys: status.memoryKeys,
          error: redisError
        }
      }
    } else {
      redisStatus = 'not_configured'
      healthData.services.redis = {
        status: redisStatus
      }
    }


    // Calculate response time
    const [seconds, nanoseconds] = process.hrtime(startCheck)
    healthData.responseTime = Math.round((seconds * 1000) + (nanoseconds / 1000000)) // ms

    // Determine overall health status
    const isHealthy = redisStatus === 'healthy' || redisStatus === 'not_configured'
    
    if (!isHealthy) {
      healthData.status = 'degraded'
      return res.status(503).json(healthData)
    }

    res.status(200).json(healthData)

  } catch (error) {
    // Calculate response time even for errors
    const [seconds, nanoseconds] = process.hrtime(startCheck)
    const responseTime = Math.round((seconds * 1000) + (nanoseconds / 1000000))

    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime
    })
  }
})

// Simple liveness probe (for Kubernetes/Docker health checks)
router.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  })
})

// Readiness probe (checks if app is ready to serve traffic)
router.get('/health/ready', async (req, res) => {
  try {
    const redis = req.app.locals.redis
    
    // Check if Redis is available (if configured)
    if (redis) {
      await Promise.race([
        redis.ping(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Redis timeout')), 1000)
        )
      ])
    }
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
})

module.exports = router