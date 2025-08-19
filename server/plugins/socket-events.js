const moment = require('moment')

// Redis client import
const RedisClient = require('../lib/redis-client')

// Input validation helpers
function validateRoomId(roomId) {
  // Allow only alphanumeric, hyphen, and underscore, 1-50 characters
  if (!roomId || typeof roomId !== 'string') {
    return false
  }
  return /^[a-zA-Z0-9_-]{1,50}$/.test(roomId)
}

function validateFieldValue(value) {
  // Prevent excessively large values
  if (typeof value === 'string' && value.length > 10000) {
    return false
  }
  if (typeof value === 'object' && JSON.stringify(value).length > 10000) {
    return false
  }
  return true
}

function getRoomKey(roomId) {
  // Add consistent prefix to prevent key collision
  return `room:${roomId}`
}

// Socket.IOイベントハンドラーの設定
function setupSocketEvents(io) {
  const redis = new RedisClient()
  
  io.on('connection', (socket) => {
    let roomId = ''
    
    // enterRoomイベント - 部屋管理機能
    socket.on('enterRoom', (id) => {
      // Validate room ID
      if (!validateRoomId(id)) {
        socket.emit('error', { message: 'Invalid room ID format' })
        return
      }
      
      roomId = id
      socket.join(roomId)
      
      // Redisから部屋のデータを取得
      redis.get(getRoomKey(roomId), function(err, result) {
        if (err) {
          console.error('Redis get error:', err)
          socket.emit('error', { message: 'Failed to load room data' })
          return
        }
        if (result) {
          // 接続したクライアントにのみ現在の盤面を送信
          socket.emit('update', result)
        }
      })
    })
    
    // sendイベント - 盤面データの同期
    socket.on('send', (params) => {
      // Validate params object
      if (!params || typeof params !== 'object') {
        socket.emit('error', { message: 'Invalid parameters' })
        return
      }
      
      const id = params.id
      const text = params.text
      
      // Validate text value
      if (!text || !validateFieldValue(text)) {
        socket.emit('error', { message: 'Invalid or too large board data' })
        return
      }
      
      // 部屋IDが設定されていない場合は設定
      if (!roomId) {
        // Validate room ID from params
        if (!validateRoomId(id)) {
          socket.emit('error', { message: 'Invalid room ID format' })
          return
        }
        roomId = id
        socket.join(roomId)
      }
      
      // Redisに盤面データを保存
      redis.set(getRoomKey(roomId), text)
      
      // 同じ部屋の他のクライアントに盤面データを送信
      socket.broadcast.to(roomId).emit('update', text)
    })
    
    // sendMoveイベント - 駒の移動を同期
    socket.on('sendMove', (params) => {
      // Validate params
      if (!params || typeof params !== 'object') {
        socket.emit('error', { message: 'Invalid move parameters' })
        return
      }
      
      // Validate room ID is set
      if (!roomId) {
        socket.emit('error', { message: 'Room not joined' })
        return
      }
      
      // Validate move fields
      if (!validateFieldValue(params.piece)) {
        socket.emit('error', { message: 'Invalid move data' })
        return
      }
      
      const time = moment(new Date()).utcOffset('+09:00').format('H:mm:ss')
      
      // 部屋の全クライアントに駒の移動を送信
      io.to(roomId).emit('receiveMove', {
        time: time,
        beforeX: params.beforeX,
        beforeY: params.beforeY,
        afterX: params.afterX,
        afterY: params.afterY,
        piece: params.piece,
      })
    })
    
    // sendCommentイベント - チャット機能
    socket.on('sendComment', (params) => {
      // Validate params
      if (!params || typeof params !== 'object') {
        socket.emit('error', { message: 'Invalid comment parameters' })
        return
      }
      
      // Validate room ID is set
      if (!roomId) {
        socket.emit('error', { message: 'Room not joined' })
        return
      }
      
      // Validate comment fields
      if (!validateFieldValue(params.name) || !validateFieldValue(params.comment)) {
        socket.emit('error', { message: 'Invalid or too large comment data' })
        return
      }
      
      const time = moment(new Date()).utcOffset('+09:00').format('H:mm:ss')
      
      // 部屋の全クライアントにコメントを送信
      io.to(roomId).emit('receiveComment', {
        time: time,
        name: params.name,
        comment: params.comment,
      })
    })
    
    // 切断イベント
    socket.on('disconnect', (reason) => {
      console.log('Client disconnected:', socket.id, 'from room:', roomId, 'reason:', reason)
      if (roomId) {
        socket.leave(roomId)
      }
    })
    
    // エラーハンドリング
    socket.on('error', (error) => {
      console.error('Socket error:', socket.id, error)
    })
  })
}

module.exports = {
  setupSocketEvents,
  validateRoomId,
  validateFieldValue,
  getRoomKey
}