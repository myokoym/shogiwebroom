import { io } from 'socket.io-client'

// Socket.IO v4対応のVuexプラグイン
const webSocketPlugin = (store) => {
  // Socket.IO v4クライアントの初期化
  const socket = io({
    // 初期接続は自動で行う
    autoConnect: true,
    // トランスポート設定（WebSocket優先）
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
    // アップグレード設定
    upgrade: true
  })
  
  // 接続成功時のログ
  socket.on('connect', () => {
    console.log('Socket.IO v4 connected:', socket.id)
  })
  
  // 接続エラーハンドリング
  socket.on('connect_error', (error) => {
    console.error('Socket.IO v4 connection error:', error.message)
  })
  
  // Vuex mutationの監視
  store.subscribe((mutation, state) => {
    // 盤面データの送信
    if (mutation.type === 'sfen/setText' ||
        mutation.type === 'sfen/prevHistory' ||
        mutation.type === 'sfen/nextHistory' ||
        mutation.type === 'sfen/buildSfen') {
      socket.emit('send', {
        id: state.sfen.roomId,
        text: state.sfen.text,
      })
    } 
    // 部屋への参加とイベントリスナーの設定
    else if (mutation.type === 'sfen/setRoomId') {
      const id = mutation.payload.roomId
      
      // 既存のリスナーを削除（重複防止）
      socket.off('update')
      socket.off('receiveComment')
      socket.off('receiveMove')
      
      // 盤面更新イベント
      socket.on('update', (text) => {
        if (!text) {
          return
        }
        store.commit('sfen/receiveText', { text: text })
      })
      
      // コメント受信イベント
      socket.on('receiveComment', (params) => {
        store.commit('chat/receiveComment', {
          time: params.time,
          name: params.name,
          comment: params.comment,
        })
      })
      
      // 駒移動受信イベント
      socket.on('receiveMove', (params) => {
        store.commit('kif/receiveMove', {
          time: params.time,
          beforeX: params.beforeX,
          beforeY: params.beforeY,
          afterX: params.afterX,
          afterY: params.afterY,
          piece: params.piece,
        })
      })
      
      // 部屋に参加
      socket.emit('enterRoom', id)
    } 
    // コメント送信
    else if (mutation.type === 'chat/sendComment') {
      socket.emit('sendComment', {
        id: state.sfen.roomId,
        name: state.chat.name,
        comment: state.chat.comment,
      })
    } 
    // 駒移動送信
    else if (mutation.type === 'kif/sendMove') {
      socket.emit('sendMove', {
        id: state.sfen.roomId,
        beforeX: state.kif.beforeX,
        beforeY: state.kif.beforeY,
        afterX: state.kif.afterX,
        afterY: state.kif.afterY,
        piece: state.kif.piece,
      })
    }
    
    // 盤面の解析と手駒・持ち駒の更新
    if (mutation.type === 'sfen/setText' ||
        mutation.type === 'sfen/receiveText' ||
        mutation.type === 'sfen/reverse' ||
        mutation.type === 'sfen/prevHistory' ||
        mutation.type === 'sfen/nextHistory' ||
        mutation.type === 'sfen/init') {
      store.commit('sfen/parseSfen')
      store.commit('sfen/fillHands')
      store.commit('sfen/fillStock')
    } else if (mutation.type === 'sfen/moveBoardToBoard' ||
               mutation.type === 'sfen/moveBoardToHand' ||
               mutation.type === 'sfen/moveHandToBoard' ||
               mutation.type === 'sfen/moveHandToHand' ||
               mutation.type === 'sfen/moveBoardToStock' ||
               mutation.type === 'sfen/moveStockToBoard' ||
               mutation.type === 'sfen/togglePromotedAndTurn') {
      store.commit('sfen/fillHands')
      store.commit('sfen/fillStock')
      store.commit('sfen/buildSfen')
    }
    
    // 履歴の追加
    if (mutation.type === 'sfen/setText' ||
        mutation.type === 'sfen/receiveText' ||
        mutation.type === 'sfen/reverse' ||
        mutation.type === 'sfen/buildSfen' ||
        mutation.type === 'sfen/init') {
      store.commit('sfen/addHistory')
    }
  })
  
  // Socket.IOインスタンスをstoreに保存（デバッグ用）
  store.$socket = socket
}

export default webSocketPlugin