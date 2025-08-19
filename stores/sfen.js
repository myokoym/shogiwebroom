// SFEN (Shogi Forsyth-Edwards Notation) store for Pinia
import { defineStore } from 'pinia'

export const useSfenStore = defineStore('sfen', {
  state: () => ({
    text: 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1',
    rows: Array(9).fill(null).map(() => Array(9).fill(null)),
    blackHands: {},
    whiteHands: {},
    stock: [],
    latestX: -1,
    latestY: -1,
    roomId: '',
    history: [],
    historyIndex: -1
  }),

  getters: {
    currentBoard: (state) => state.rows,
    hasHistory: (state) => state.history.length > 0,
    canUndo: (state) => state.historyIndex > 0,
    canRedo: (state) => state.historyIndex < state.history.length - 1
  },

  actions: {
    setText(payload) {
      this.text = payload.text
    },

    receiveText(payload) {
      this.text = payload.text
    },

    setRoomId(payload) {
      this.roomId = payload.roomId
    },

    parseSfen() {
      const parts = this.text.split(' ')
      if (parts.length < 3) return

      // 盤面の解析
      const boardStr = parts[0]
      const rows = boardStr.split('/')
      
      for (let y = 0; y < 9; y++) {
        let x = 0
        const row = rows[y] || ''
        
        for (let i = 0; i < row.length; i++) {
          const char = row[i]
          
          if (/[1-9]/.test(char)) {
            // 空マスの数
            const emptyCount = parseInt(char)
            for (let j = 0; j < emptyCount; j++) {
              if (x < 9) {
                this.rows[y][x] = null
                x++
              }
            }
          } else if (char === '+') {
            // 成駒
            if (i + 1 < row.length) {
              const piece = char + row[i + 1]
              if (x < 9) {
                this.rows[y][x] = piece
                x++
              }
              i++ // Skip next character
            }
          } else {
            // 通常の駒
            if (x < 9) {
              this.rows[y][x] = char
              x++
            }
          }
        }
        
        // 残りを空マスで埋める
        while (x < 9) {
          this.rows[y][x] = null
          x++
        }
      }
    },

    buildSfen() {
      let sfen = ''
      
      // 盤面を SFEN 形式に変換
      for (let y = 0; y < 9; y++) {
        let emptyCount = 0
        
        for (let x = 0; x < 9; x++) {
          const piece = this.rows[y][x]
          
          if (piece === null) {
            emptyCount++
          } else {
            if (emptyCount > 0) {
              sfen += emptyCount
              emptyCount = 0
            }
            sfen += piece
          }
        }
        
        if (emptyCount > 0) {
          sfen += emptyCount
        }
        
        if (y < 8) {
          sfen += '/'
        }
      }
      
      // 手番と手駒を追加
      sfen += ' b - 1'
      
      this.text = sfen
    },

    fillHands() {
      // 手駒の解析（簡易版）
      this.blackHands = {}
      this.whiteHands = {}
    },

    fillStock() {
      // 駒台の駒リスト
      this.stock = ['K', 'R', 'B', 'G', 'S', 'N', 'L', 'P',
                    'k', 'r', 'b', 'g', 's', 'n', 'l', 'p']
    },

    addHistory() {
      // 現在の位置より後の履歴を削除
      this.history = this.history.slice(0, this.historyIndex + 1)
      
      // 新しい状態を追加
      this.history.push(this.text)
      this.historyIndex = this.history.length - 1
      
      // 履歴の上限を設定（100手まで）
      if (this.history.length > 100) {
        this.history.shift()
        this.historyIndex--
      }
    },

    prevHistory() {
      if (this.historyIndex > 0) {
        this.historyIndex--
        this.text = this.history[this.historyIndex]
      }
    },

    nextHistory() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++
        this.text = this.history[this.historyIndex]
      }
    },

    init() {
      this.text = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1'
      this.parseSfen()
      this.fillHands()
      this.fillStock()
      this.addHistory()
    },

    reverse() {
      // 盤面を180度回転
      const newRows = Array(9).fill(null).map(() => Array(9).fill(null))
      
      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
          const piece = this.rows[8 - y][8 - x]
          if (piece) {
            // 大文字小文字を反転
            if (piece === piece.toUpperCase()) {
              newRows[y][x] = piece.toLowerCase()
            } else {
              newRows[y][x] = piece.toUpperCase()
            }
          } else {
            newRows[y][x] = null
          }
        }
      }
      
      this.rows = newRows
      this.buildSfen()
    },

    moveBoardToBoard(payload) {
      const piece = this.rows[payload.beforeY][payload.beforeX]
      this.rows[payload.beforeY][payload.beforeX] = null
      this.rows[payload.afterY][payload.afterX] = piece
      this.latestX = payload.afterX
      this.latestY = payload.afterY
    },

    moveBoardToHand(payload) {
      this.rows[payload.beforeY][payload.beforeX] = null
    },

    moveHandToBoard(payload) {
      this.rows[payload.afterY][payload.afterX] = payload.beforeY
      this.latestX = payload.afterX
      this.latestY = payload.afterY
    },

    moveHandToHand(payload) {
      // 手駒から手駒への移動（実装省略）
    },

    moveBoardToStock(payload) {
      this.rows[payload.beforeY][payload.beforeX] = null
    },

    moveStockToBoard(payload) {
      this.rows[payload.afterY][payload.afterX] = payload.piece
      this.latestX = payload.afterX
      this.latestY = payload.afterY
    },

    togglePromotedAndTurn(payload) {
      const piece = this.rows[payload.y][payload.x]
      if (!piece) return
      
      // 成駒の切り替え
      if (piece.startsWith('+')) {
        // 成駒を元に戻す
        this.rows[payload.y][payload.x] = piece.substring(1)
      } else {
        // 成駒にする（成れる駒のみ）
        const promotable = ['R', 'B', 'S', 'N', 'L', 'P', 'r', 'b', 's', 'n', 'l', 'p']
        if (promotable.includes(piece)) {
          this.rows[payload.y][payload.x] = '+' + piece
        }
      }
      
      // 手番の切り替え（大文字小文字）
      const currentPiece = this.rows[payload.y][payload.x]
      if (currentPiece) {
        if (currentPiece === currentPiece.toUpperCase()) {
          this.rows[payload.y][payload.x] = currentPiece.toLowerCase()
        } else {
          this.rows[payload.y][payload.x] = currentPiece.toUpperCase()
        }
      }
    }
  }
})