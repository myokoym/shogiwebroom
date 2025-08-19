import io from 'socket.io-client'

export default ({ store }, inject) => {
  // Socket.IO v2クライアントの接続（後方互換性のため）
  const socket = io({
    // 手動接続制御
    autoConnect: false,
    // トランスポート設定
    transports: ['polling', 'websocket'],
    // 再接続設定
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    // タイムアウト設定
    timeout: 20000,
    // パス設定
    path: '/socket.io/'
  })

  // Nuxtアプリにインジェクト
  inject('socket', socket)
  
  // ストアにも追加
  store.$socket = socket

  // 基本的なエラーハンドリング
  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error.type)
  })
  
  socket.on('error', (error) => {
    console.error('Socket.IO error:', error)
  })
  
  // 自動再接続のイベント
  socket.on('reconnect', (attemptNumber) => {
    console.log('Socket.IO reconnected after', attemptNumber, 'attempts')
    // 再接続時に部屋に再参加
    const roomId = store.state.roomId
    if (roomId) {
      socket.emit('enterRoom', roomId)
    }
  })
  
  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('Socket.IO reconnection attempt', attemptNumber)
  })
  
  socket.on('reconnect_error', (error) => {
    console.error('Socket.IO reconnection error:', error.type)
  })
  
  socket.on('reconnect_failed', () => {
    console.error('Socket.IO reconnection failed after all attempts')
  })
}