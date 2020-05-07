const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

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

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  let server = app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })

  socketStart(server)
  console.log("Socket.IO starts")
}

const Redis = require('ioredis');
//console.log(Redis)
let redis = undefined
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
} else {
  redis = new Redis();
}
//console.log(redis)

function socketStart(server) {
  const io = require("socket.io").listen(server)
  io.on("connection", (socket) => {
    let roomId = ""
    socket.on("enterRoom", (id) => {
      console.log("enterRoom id: " + id)
      roomId = id
      socket.join(roomId)
      redis.get(roomId, function(err, result) {
        if (err) {
          console.log(err)
        }
        if (result) {
          io.to(socket.id).emit("update", result)
        }
      })
    })
    socket.on("send", (params) => {
      console.log("on send")
      console.log(params)
      let id = params.id
      console.log("id: " + id)
      let text = params.text
      console.log("text: " + text)
      if (!text) {
        return
      }
      console.log("roomId: " + roomId)
      if (!roomId) {
        roomId = id
        socket.join(roomId)
      }
      if (!text) {
        return
      }
      redis.set(roomId, text)
      socket.broadcast.to(roomId).emit("update", text)
    })
  })
}

start()
