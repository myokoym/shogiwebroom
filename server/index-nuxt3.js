// Nuxt 3 server with Socket.IO integration
const express = require('express')
const consola = require('consola')
const moment = require('moment')
const { createServer } = require('http')
const { Server } = require("socket.io")

// Import health check routes
const healthRoutes = require('./api/health')

// Redis client
const RedisClient = require('./lib/redis-client');
const redis = new RedisClient();

// Create Express app
const app = express()

// Make Redis instance available to health check routes
app.locals.redis = redis

// Input validation helpers
function validateRoomId(roomId) {
  // Allow only alphanumeric, hyphen, and underscore, 1-50 characters
  if (!roomId || typeof roomId !== 'string') {
    return false;
  }
  return /^[a-zA-Z0-9_-]{1,50}$/.test(roomId);
}

function validateFieldValue(value) {
  // Prevent excessively large values
  if (typeof value === 'string' && value.length > 10000) {
    return false;
  }
  if (typeof value === 'object' && JSON.stringify(value).length > 10000) {
    return false;
  }
  return true;
}

function getRoomKey(roomId) {
  // Add consistent prefix to prevent key collision
  return `room:${roomId}`;
}

// Socket.IO setup
function socketStart(server) {
  const io = new Server(server, {
    cors: {
      origin: true,
      credentials: true
    },
    allowEIO3: true, // Allow Engine.IO v3 clients (backward compatibility)
    transports: ['polling', 'websocket']
  })
  
  io.on("connection", (socket) => {
    let roomId = ""
    
    socket.on("enterRoom", (id) => {
      // Validate room ID
      if (!validateRoomId(id)) {
        socket.emit("error", { message: "Invalid room ID format" });
        return;
      }
      roomId = id
      socket.join(roomId)
      redis.get(getRoomKey(roomId), function(err, result) {
        if (err) {
          console.error('Redis get error:', err)
          socket.emit("error", { message: "Failed to load room data" });
          return
        }
        
        if (result) {
          const room = JSON.parse(result)
          socket.emit("changeBoard", room.board || {})
          socket.emit("changeSetting", room.setting || {})
          socket.emit("changeGafu", room.gafu || {})
          socket.emit("changeColor", room.color || {})
          socket.emit("changeMessages", room.messages || [])
        }
      })
    })
    
    socket.on("exitRoom", () => {
      socket.leave(roomId)
      roomId = ""
    })
    
    socket.on("changeBoard", (data) => {
      if (!roomId || !validateRoomId(roomId)) return;
      if (!validateFieldValue(data)) {
        socket.emit("error", { message: "Invalid board data" });
        return;
      }
      
      socket.to(roomId).emit("changeBoard", data)
      
      redis.get(getRoomKey(roomId), function(err, result) {
        if (err) {
          console.error('Redis get error:', err)
          return
        }
        
        let room = result ? JSON.parse(result) : {}
        room.board = data
        redis.set(getRoomKey(roomId), JSON.stringify(room))
      })
    })
    
    socket.on("changeSetting", (data) => {
      if (!roomId || !validateRoomId(roomId)) return;
      if (!validateFieldValue(data)) {
        socket.emit("error", { message: "Invalid setting data" });
        return;
      }
      
      socket.to(roomId).emit("changeSetting", data)
      
      redis.get(getRoomKey(roomId), function(err, result) {
        if (err) {
          console.error('Redis get error:', err)
          return
        }
        
        let room = result ? JSON.parse(result) : {}
        room.setting = data
        redis.set(getRoomKey(roomId), JSON.stringify(room))
      })
    })
    
    socket.on("changeGafu", (data) => {
      if (!roomId || !validateRoomId(roomId)) return;
      if (!validateFieldValue(data)) {
        socket.emit("error", { message: "Invalid gafu data" });
        return;
      }
      
      socket.to(roomId).emit("changeGafu", data)
      
      redis.get(getRoomKey(roomId), function(err, result) {
        if (err) {
          console.error('Redis get error:', err)
          return
        }
        
        let room = result ? JSON.parse(result) : {}
        room.gafu = data
        redis.set(getRoomKey(roomId), JSON.stringify(room))
      })
    })
    
    socket.on("changeColor", (data) => {
      if (!roomId || !validateRoomId(roomId)) return;
      if (!validateFieldValue(data)) {
        socket.emit("error", { message: "Invalid color data" });
        return;
      }
      
      socket.to(roomId).emit("changeColor", data)
      
      redis.get(getRoomKey(roomId), function(err, result) {
        if (err) {
          console.error('Redis get error:', err)
          return
        }
        
        let room = result ? JSON.parse(result) : {}
        room.color = data
        redis.set(getRoomKey(roomId), JSON.stringify(room))
      })
    })
    
    socket.on("addMessage", (message) => {
      if (!roomId || !validateRoomId(roomId)) return;
      if (!validateFieldValue(message)) {
        socket.emit("error", { message: "Invalid message data" });
        return;
      }
      
      const now = moment().format("HH:mm:ss")
      const data = {
        time: now,
        text: message
      }
      io.to(roomId).emit("addMessage", data)
      
      redis.get(getRoomKey(roomId), function(err, result) {
        if (err) {
          console.error('Redis get error:', err)
          return
        }
        
        let room = result ? JSON.parse(result) : {}
        if (!room.messages) room.messages = []
        room.messages.push(data)
        if (room.messages.length > 100) {
          room.messages.shift()
        }
        redis.set(getRoomKey(roomId), JSON.stringify(room))
      })
    })
  })
  
  return io
}

// Start function for Nuxt 3
async function start() {
  const port = process.env.PORT || 3000
  const host = process.env.HOST || 'localhost'
  
  // Mount health check routes
  app.use('/api', healthRoutes)
  
  // Create HTTP server
  const server = createServer(app)
  
  // Start Socket.IO
  socketStart(server)
  
  // For production, Nuxt 3 will handle the rest through Nitro
  // For development, use nuxt dev command instead
  if (process.env.NODE_ENV === 'production') {
    // In production, import the built Nuxt app
    const { listener } = await import('../.output/server/index.mjs')
    app.use(listener)
  }
  
  // Start server
  server.listen(port, host, () => {
    consola.ready({
      message: `Server listening on http://${host}:${port}`,
      badge: true
    })
  })
}

// Export for testing
module.exports = { app, redis }

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  start().catch(err => {
    consola.error('Failed to start server:', err)
    process.exit(1)
  })
}