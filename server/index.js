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

function socketStart(server) {
  const io = require("socket.io").listen(server)
  io.on("connection", socket => {
    console.log("id: ", + socket.id + " is connected")

    if (usiQueue.length > 0) {
      usiQueue.forEach(usi => {
        socket.emit("new-usi", message)
      })
    }

    socket.on("send-usi", usi => {
      console.log(usi)

      usiQueue.push(usi)

      socket.broadcast.emit("new-usi", usi)

      if (usiQueue.length > 10) {
        usiQueue = usiQueue.slice(-10)
      }
    })
  })
}

start()
