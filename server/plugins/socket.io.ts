import type { NitroApp } from 'nitropack'
import { Server } from 'socket.io'
import { Engine } from 'engine.io'
import type { Socket } from 'socket.io'

// Socket.IO v4をNitroプラグインとして実装
export default defineNitroPlugin((nitroApp: NitroApp) => {
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
    
    // 接続イベントハンドラー（基本構造のみ）
    io.on('connection', (socket: Socket) => {
      console.log('Socket.IO v4: New client connected', socket.id)
      
      // 切断イベント
      socket.on('disconnect', (reason) => {
        console.log('Socket.IO v4: Client disconnected', socket.id, reason)
      })
      
      // エラーハンドリング
      socket.on('error', (error) => {
        console.error('Socket.IO v4: Socket error', socket.id, error)
      })
    })
    
    console.log('Socket.IO v4 server initialized')
  })
})

// TypeScript型定義の拡張
declare module 'nitropack' {
  interface NitroApp {
    io?: Server
  }
}