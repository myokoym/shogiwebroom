// Kif (棋譜) store for Pinia
import { defineStore } from 'pinia'

interface Move {
  time: string
  beforeX: number | string
  beforeY: number | string
  afterX: number
  afterY: number
  piece: string
}

interface KifState {
  moves: Move[]
  beforeX: number | string
  beforeY: number | string
  afterX: number
  afterY: number
  piece: string
  kifs: string[]
  ki2s: string[]
  pause: boolean
  xChars: Record<string, string>
  yChars: Record<string, string>
  komaChars: Record<string, string>
}

// Vuex-compatible exports for testing
export const state = (): KifState => ({
  moves: [],
  beforeX: -1,
  beforeY: -1,
  afterX: -1,
  afterY: -1,
  piece: '',
  kifs: [],
  ki2s: [],
  pause: false,
  xChars: {
    '1': '１', '2': '２', '3': '３', '4': '４', '5': '５',
    '6': '６', '7': '７', '8': '８', '9': '９'
  },
  yChars: {
    '1': '一', '2': '二', '3': '三', '4': '四', '5': '五',
    '6': '六', '7': '七', '8': '八', '9': '九'
  },
  komaChars: {
    'K': '玉', 'G': '金', 'S': '銀', 'N': '桂', 'L': '香',
    'R': '飛', 'B': '角', 'P': '歩',
    '+R': '竜', '+B': '馬', '+S': '成銀', '+N': '成桂', '+L': '成香', '+P': 'と'
  }
})

export const useKifStore = defineStore('kif', {
  state,

  getters: {
    hasMoves: (state) => state.moves.length > 0,
    latestMove: (state) => state.moves[state.moves.length - 1] || null,
    moveCount: (state) => state.moves.length
  },

  actions: {
    sendMove(payload: {
      beforeX: number | string
      beforeY: number | string
      afterX: number
      afterY: number
      piece: string
    }) {
      this.beforeX = payload.beforeX
      this.beforeY = payload.beforeY
      this.afterX = payload.afterX
      this.afterY = payload.afterY
      this.piece = payload.piece
      // Socket.IOへの送信はVuexプラグインで処理
    },

    receiveMove(payload: {
      time: string
      beforeX: number | string
      beforeY: number | string
      afterX: number
      afterY: number
      piece: string
    }) {
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

// Vuex-compatible mutations for testing
export const mutations = {
  reset(state: KifState) {
    state.moves = []
    state.beforeX = -1
    state.beforeY = -1
    state.afterX = -1
    state.afterY = -1
    state.piece = ''
    state.kifs = []
    state.ki2s = []
  },
  
  sendMove(state: KifState, payload: any) {
    if (state.pause) return
    
    let beforeX = payload.beforeX
    let beforeY = payload.beforeY
    let afterX = payload.afterX
    let afterY = payload.afterY
    let piece = payload.piece
    
    // Handle reversal
    if (payload.reversed) {
      if (beforeX !== undefined) beforeX = 8 - beforeX
      if (beforeY !== undefined) beforeY = 8 - beforeY
      afterX = 8 - afterX
      afterY = 8 - afterY
      // Change piece case for white
      piece = piece.toLowerCase()
    }
    
    // Convert to SFEN format (for compatibility with existing tests)
    if (beforeX !== undefined) {
      state.beforeX = String(9 - beforeX)
    } else {
      state.beforeX = undefined
    }
    
    if (beforeY !== undefined) {
      state.beforeY = String(1 + beforeY)
    } else {
      state.beforeY = undefined
    }
    
    state.afterX = String(9 - afterX)
    state.afterY = String(1 + afterY)
    state.piece = piece
  },
  
  receiveMove(state: KifState, payload: any) {
    if (state.pause) return
    
    state.moves.push({
      time: payload.time || new Date().toISOString(),
      beforeX: payload.beforeX,
      beforeY: payload.beforeY,
      afterX: payload.afterX,
      afterY: payload.afterY,
      piece: payload.piece
    })
    
    // Create KIF notation
    const afterXChar = state.xChars[payload.afterX]
    const afterYChar = state.yChars[payload.afterY]
    const pieceName = state.komaChars[payload.piece.toUpperCase()] || payload.piece
    
    if (payload.beforeX === undefined || payload.beforeY === undefined) {
      // Drop move
      state.kifs.push(`${afterXChar}${afterYChar}${pieceName}打`)
    } else {
      // Regular move
      state.kifs.push(`${afterXChar}${afterYChar}${pieceName}(${payload.beforeX}${payload.beforeY})`)
    }
    
    // Create KI2 notation
    const turnSymbol = payload.piece === payload.piece.toUpperCase() ? '▲' : '△'
    if (payload.beforeX === undefined || payload.beforeY === undefined) {
      state.ki2s.push(`${turnSymbol}${afterXChar}${afterYChar}${pieceName}打`)
    } else {
      state.ki2s.push(`${turnSymbol}${afterXChar}${afterYChar}${pieceName}`)
    }
  },
  
  togglePause(state: KifState) {
    state.pause = !state.pause
  }
}