const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()

const moment = require('moment')

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

// ヘルスチェックAPIをインポート
const healthRouter = require('./api/health');

async function start () {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  await nuxt.ready()
  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // ヘルスチェックAPIを登録（Nuxtミドルウェアの前に）
  app.use('/api/health', healthRouter);

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  let server = app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })

  // Test Redis connection
  const isRedisConnected = await redis.ping();
  console.log('Redis connection status:', isRedisConnected ? 'Connected' : 'Fallback to in-memory');

  socketStart(server)
  console.log("Socket.IO starts")
}

const redis = require('./lib/redis-client');

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

function socketStart(server) {
  const io = require("socket.io").listen(server)
  io.on("connection", (socket) => {
    let roomId = ""
    socket.on("enterRoom", (id) => {
      // debug: console.log("enterRoom id: " + id)
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
        }
        if (result) {
          io.to(socket.id).emit("update", result)
        }
      })
    })
    socket.on("send", (params) => {
      // debug: console.log("on send")
      // debug: console.log(params)
      
      // Validate params object
      if (!params || typeof params !== 'object') {
        socket.emit("error", { message: "Invalid parameters" });
        return;
      }
      
      let id = params.id
      // debug: console.log("id: " + id)
      let text = params.text
      // debug: console.log("text: " + text)
      
      // Validate text value
      if (!text || !validateFieldValue(text)) {
        socket.emit("error", { message: "Invalid or too large board data" });
        return;
      }
      
      // debug: console.log("roomId: " + roomId)
      if (!roomId) {
        // Validate room ID from params
        if (!validateRoomId(id)) {
          socket.emit("error", { message: "Invalid room ID format" });
          return;
        }
        roomId = id
        socket.join(roomId)
      }
      
      redis.set(getRoomKey(roomId), text)
      socket.broadcast.to(roomId).emit("update", text)
    })

    socket.on("sendComment", (params) => {
      // Validate params
      if (!params || typeof params !== 'object') {
        socket.emit("error", { message: "Invalid comment parameters" });
        return;
      }
      
      // Validate room ID is set
      if (!roomId) {
        socket.emit("error", { message: "Room not joined" });
        return;
      }
      
      // Validate comment fields
      if (!validateFieldValue(params.name) || !validateFieldValue(params.comment)) {
        socket.emit("error", { message: "Invalid or too large comment data" });
        return;
      }
      
      const time = moment(new Date()).utcOffset('+09:00').format('H:mm:ss')
      io.to(roomId).emit("receiveComment", {
        time: time,
        name: params.name,
        comment: params.comment,
      })
    })

    socket.on("sendMove", (params) => {
      // Validate params
      if (!params || typeof params !== 'object') {
        socket.emit("error", { message: "Invalid move parameters" });
        return;
      }
      
      // Validate room ID is set
      if (!roomId) {
        socket.emit("error", { message: "Room not joined" });
        return;
      }
      
      // Validate move fields
      if (!validateFieldValue(params.piece)) {
        socket.emit("error", { message: "Invalid move data" });
        return;
      }
      
      const time = moment(new Date()).utcOffset('+09:00').format('H:mm:ss')
      io.to(roomId).emit("receiveMove", {
        time: time,
        beforeX: params.beforeX,
        beforeY: params.beforeY,
        afterX: params.afterX,
        afterY: params.afterY,
        piece: params.piece,
      })
    })
  })
}

start()
