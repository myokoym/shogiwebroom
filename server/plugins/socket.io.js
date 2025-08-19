const { Server } = require('socket.io')
const { setupSocketEvents } = require('./socket-events')
const { setupFallbackHandlers, setupProductionSimulation } = require('./socket-fallback')

// Socket.IO v4をNitroプラグインとして実装（JavaScript版）
module.exports = function socketIOPlugin(nitroApp) {
  // 開発環境と本番環境の両方で動作するようにrender:responseイベントを使用
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    // Socket.IOサーバーが既に初期化されている場合はスキップ
    if (nitroApp.io) return
    
    // HTTPサーバーの取得
    const server = event.node?.res?.socket?.server || event.res?.socket?.server
    if (!server) return
    
    // Socket.IOサーバーの初期化
    const io = new Server(server, {
      cors: {
        origin: true, // 開発環境のため全てのオリジンを許可
        credentials: true,
        methods: ['GET', 'POST']
      },
      // Socket.IO v2クライアントとの後方互換性
      allowEIO3: true,
      // トランスポート設定
      transports: ['polling', 'websocket'],
      // パス設定
      path: '/socket.io/',
      // タイムアウト設定
      pingTimeout: 60000,
      pingInterval: 25000
    })
    
    // Nitroアプリにアタッチ
    nitroApp.io = io
    
    // イベントハンドラーの設定
    setupSocketEvents(io)
    
    // v2クライアント用フォールバック処理
    setupFallbackHandlers(io)
    
    // 本番環境シミュレーション（必要に応じて）
    setupProductionSimulation(io)
    
    console.log('Socket.IO v4 server initialized with event handlers and v2 compatibility')
  })
}