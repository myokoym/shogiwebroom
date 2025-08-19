// Socket.IO v2クライアントのフォールバック処理
function setupFallbackHandlers(io) {
  // v2クライアントの検出とログ
  io.on('connection', (socket) => {
    const clientVersion = socket.request._query?.EIO || 'unknown'
    const transport = socket.conn.transport.name
    
    // Engine.IO v3（Socket.IO v2）クライアントの検出
    if (clientVersion === '3') {
      console.log(`Socket.IO v2 client connected: ${socket.id} via ${transport}`)
      
      // v2クライアント用の追加設定
      socket._isV2Client = true
      
      // v2クライアント用のエラーハンドリング
      socket.on('error', (error) => {
        console.log(`v2 client error (${socket.id}):`, error)
        // v2形式のエラーレスポンス
        socket.emit('error', {
          code: 'SERVER_ERROR',
          message: error.message || 'An error occurred'
        })
      })
    } else {
      console.log(`Socket.IO v4 client connected: ${socket.id} via ${transport}`)
    }
    
    // トランスポートのアップグレード監視
    socket.conn.on('upgrade', (transport) => {
      console.log(`Transport upgraded for ${socket.id}: ${transport.name}`)
    })
    
    // パケットドロップの監視（v2クライアントで発生しやすい）
    socket.conn.on('packetCreate', (packet) => {
      if (packet.type === 'error') {
        console.warn(`Packet error for ${socket.id}:`, packet.data)
      }
    })
  })
  
  // v2クライアントのための追加ミドルウェア
  io.use((socket, next) => {
    // v2クライアントの認証互換性
    const token = socket.handshake.auth?.token || socket.handshake.query?.token
    
    // v2形式のハンドシェイクデータ変換
    if (socket.handshake.query && !socket.handshake.auth) {
      socket.handshake.auth = socket.handshake.query
    }
    
    next()
  })
}

// v2クライアント用のイベント名マッピング
const eventNameMapping = {
  // v2からv4へのマッピング（必要に応じて）
  'send': 'send',
  'enterRoom': 'enterRoom',
  'sendMove': 'sendMove',
  'sendComment': 'sendComment',
  // v4からv2へのマッピング
  'update': 'update',
  'receiveMove': 'receiveMove',
  'receiveComment': 'receiveComment',
  'error': 'error'
}

// イベントデータの変換（v2とv4の差異を吸収）
function transformEventData(eventName, data, isV2Client) {
  // v2クライアントの場合、データ形式を調整
  if (isV2Client) {
    switch (eventName) {
      case 'error':
        // v2形式のエラーに変換
        if (typeof data === 'string') {
          return { message: data }
        }
        break
      // 他のイベントは現状そのまま
    }
  }
  
  return data
}

// 本番環境シミュレーション用の設定
function setupProductionSimulation(io) {
  // 本番環境の条件をシミュレート
  if (process.env.NODE_ENV === 'production' || process.env.SIMULATE_PRODUCTION) {
    console.log('Running in production mode - applying production configurations')
    
    // より厳格なCORS設定
    io.engine.on('headers', (headers, req) => {
      headers['X-Socket-Version'] = 'v4-compatible'
      headers['X-Supports-V2'] = 'true'
    })
    
    // 接続数の監視
    let connectionCount = 0
    let v2ClientCount = 0
    
    io.on('connection', (socket) => {
      connectionCount++
      if (socket._isV2Client) {
        v2ClientCount++
      }
      
      socket.on('disconnect', () => {
        connectionCount--
        if (socket._isV2Client) {
          v2ClientCount--
        }
      })
    })
    
    // 定期的な統計ログ
    setInterval(() => {
      console.log(`Connection stats - Total: ${connectionCount}, v2 clients: ${v2ClientCount}`)
    }, 60000) // 1分ごと
  }
}

module.exports = {
  setupFallbackHandlers,
  eventNameMapping,
  transformEventData,
  setupProductionSimulation
}