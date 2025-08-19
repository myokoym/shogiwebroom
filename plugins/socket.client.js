import io from 'socket.io-client'

export default defineNuxtPlugin((nuxtApp) => {
  // Socket.IO v4クライアントの接続
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
    // TODO: 再接続時の部屋への再参加はコンポーネント側で処理
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

  // Nuxt 3のプラグインインジェクション
  return {
    provide: {
      socket
    }
  }
})