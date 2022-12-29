export const state = () => ({
  beforeX: undefined,
  beforeY: undefined,
  afterX: undefined,
  afterY: undefined,
  piece: undefined,
  moves: [],
  kifs: [],
  ki2s: [],
  pause: false,
  xChars: {
    "1": "１",
    "2": "２",
    "3": "３",
    "4": "４",
    "5": "５",
    "6": "６",
    "7": "７",
    "8": "８",
    "9": "９",
  },
  yChars: {
    "1": "一",
    "2": "二",
    "3": "三",
    "4": "四",
    "5": "五",
    "6": "六",
    "7": "七",
    "8": "八",
    "9": "九",
  },
  komaChars: {
    "K": "玉",
    "G": "金",
    "S": "銀",
    "N": "桂",
    "L": "香",
    "R": "飛",
    "B": "角",
    "P": "歩",
    "+S": "成銀",
    "+N": "成桂",
    "+L": "成香",
    "+R": "竜",
    "+B": "馬",
    "+P": "と",
  },
})

export const mutations = {
  reset(state, payload) {
    state.moves = []
    state.kifs = []
    state.ki2s = []
  },
  receiveMove(state, payload) {
    if (state.pause) {
      return
    }
    state.moves.push({
      time: payload.time,
      beforeX: payload.beforeX,
      beforeY: payload.beforeY,
      afterX: payload.afterX,
      afterY: payload.afterY,
      piece: payload.piece,
    })
    const koma = state.komaChars[payload.piece.toUpperCase()]
    let turn = undefined
    if (payload.piece.match(/[A-Z]/)) {
      turn = "▲"
    } else {
      turn = "△"
    }
    const afterXChar = state.xChars[payload.afterX]
    const afterYChar = state.yChars[payload.afterY]
    let kif = afterXChar + afterYChar + koma
    let ki2 = turn + afterXChar + afterYChar + koma
    if (payload.beforeX) {
      kif += "(" + payload.beforeX + payload.beforeY + ")"
    } else {
      kif += "打"
      ki2 += "打"
    }
    state.kifs.push(kif)
    state.ki2s.push(ki2)
  },
  sendMove(state, payload) {
    if (state.pause) {
      return
    }
    state.beforeX = undefined
    state.beforeY = undefined
    state.afterX = undefined
    state.afterY = undefined
    state.piece = undefined
    if (payload.reversed) {
      if (payload.beforeX) {
        payload.beforeX = 8 - payload.beforeX
        payload.beforeY = 8 - payload.beforeY
      }
      payload.afterX = 8 - payload.afterX
      payload.afterY = 8 - payload.afterY
      if (payload.piece.match(/[A-Z]/)) {
        payload.piece = payload.piece.toLowerCase()
      } else {
        payload.piece = payload.piece.toUpperCase()
      }
    }
    if (payload.beforeX) {
      state.beforeX = String(9 - payload.beforeX)
      state.beforeY = String(1 + payload.beforeY)
    }
    state.afterX = String(9 - payload.afterX)
    state.afterY = String(1 + payload.afterY)
    state.piece = payload.piece
  },
  togglePause(state) {
    state.pause = !state.pause
  },
}