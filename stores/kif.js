// Kif (棋譜) store for Pinia
import { defineStore } from 'pinia'

export const useKifStore = defineStore('kif', {
  state: () => ({
    moves: [],
    beforeX: -1,
    beforeY: -1,
    afterX: -1,
    afterY: -1,
    piece: ''
  }),

  getters: {
    hasMoves: (state) => state.moves.length > 0,
    latestMove: (state) => state.moves[state.moves.length - 1] || null,
    moveCount: (state) => state.moves.length
  },

  actions: {
    sendMove(payload) {
      this.beforeX = payload.beforeX
      this.beforeY = payload.beforeY
      this.afterX = payload.afterX
      this.afterY = payload.afterY
      this.piece = payload.piece
      // Socket.IOへの送信はプラグインで処理
    },

    receiveMove(payload) {
      this.moves.push({
        time: payload.time,
        beforeX: payload.beforeX,
        beforeY: payload.beforeY,
        afterX: payload.afterX,
        afterY: payload.afterY,
        piece: payload.piece
      })
      
      // 棋譜の上限を設定（500手まで）
      if (this.moves.length > 500) {
        this.moves.shift()
      }
    },

    clearMoves() {
      this.moves = []
    },

    resetCurrentMove() {
      this.beforeX = -1
      this.beforeY = -1
      this.afterX = -1
      this.afterY = -1
      this.piece = ''
    }
  }
})