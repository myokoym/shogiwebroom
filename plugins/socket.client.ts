import { io, Socket } from 'socket.io-client'
import type { Store } from 'vuex'

// Socket.IO Client v4の設定とイベントハンドリング
export class SocketClient {
  private socket: Socket | null = null
  private store: Store<any> | null = null
  
  constructor() {
    // 初期化はconnectメソッドで行う
  }
  
  // Socket.IO接続の初期化
  connect(store: Store<any>): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket
    }
    
    this.store = store
    
    // Socket.IO Client v4の接続設定
    this.socket = io({
      // 自動接続を無効化（部屋ID設定後に接続）
      autoConnect: false,
      // トランスポート設定
      transports: ['websocket', 'polling'],
      // 再接続設定
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      // タイムアウト設定
      timeout: 20000,
      // パス設定
      path: '/socket.io/',
      // Socket.IO v2との互換性フラグ（v4クライアントなので不要だが念のため）
      upgrade: true
    })
    
    // 接続エラーハンドリング
    this.setupErrorHandlers()
    
    // 再接続ハンドリング
    this.setupReconnectionHandlers()
    
    return this.socket
  }
  
  // エラーハンドリングの設定
  private setupErrorHandlers(): void {
    if (!this.socket) return
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message)
      // Storeにエラー通知を送る場合
      if (this.store) {
        this.store.commit('socket/setConnectionError', {
          error: error.message
        })
      }
    })
    
    this.socket.on('error', (error) => {
      console.error('Socket.IO error:', error)
      if (this.store) {
        this.store.commit('socket/setError', {
          error: error
        })
      }
    })
  }
  
  // 再接続ハンドリングの設定
  private setupReconnectionHandlers(): void {
    if (!this.socket) return
    
    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket.IO reconnected after', attemptNumber, 'attempts')
      // 部屋に再参加
      if (this.store) {
        const roomId = this.store.state.sfen?.roomId
        if (roomId) {
          this.socket?.emit('enterRoom', roomId)
        }
      }
    })
    
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket.IO reconnection attempt', attemptNumber)
    })
    
    this.socket.on('reconnect_error', (error) => {
      console.error('Socket.IO reconnection error:', error)
    })
    
    this.socket.on('reconnect_failed', () => {
      console.error('Socket.IO reconnection failed')
      if (this.store) {
        this.store.commit('socket/setConnectionFailed', true)
      }
    })
  }
  
  // Socket.IOインスタンスを取得
  getSocket(): Socket | null {
    return this.socket
  }
  
  // 接続状態を確認
  isConnected(): boolean {
    return this.socket?.connected || false
  }
  
  // 手動で接続
  manualConnect(): void {
    if (this.socket && !this.socket.connected) {
      this.socket.connect()
    }
  }
  
  // 手動で切断
  disconnect(): void {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect()
    }
  }
}

// シングルトンインスタンス
let socketClientInstance: SocketClient | null = null

// Socket.IOクライアントプラグイン（Nuxt 2/Bridge互換）
export default ({ store }: { store: Store<any> }, inject: Function) => {
  // シングルトンインスタンスを作成
  if (!socketClientInstance) {
    socketClientInstance = new SocketClient()
  }
  
  // Storeに接続
  const socket = socketClientInstance.connect(store)
  
  // Nuxtコンテキストに注入
  inject('socket', socket)
  inject('socketClient', socketClientInstance)
  
  // 開発環境でのデバッグ用
  if (process.env.NODE_ENV === 'development') {
    console.log('Socket.IO Client v4 initialized')
  }
}