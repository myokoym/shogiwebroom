export const state = () => ({
  roomId: undefined,
  text: "",
  rows: [],
  hands: {},
  capturablePieces: {
    b: ["P", "L", "N", "S", "G", "B", "R", "K"],
    w: ["p", "l", "n", "s", "g", "b", "r", "k"],
  },
  filledHands: {
    b: undefined,
    w: undefined,
  },
  reversed: false,
  history: [],
  historyCursor: -1,
})

export const mutations = {
  setRoomId(state, payload) {
    console.log("setRoomId: " + payload.roomId)
    state.roomId = payload.roomId
  },
  init(state) {
    console.log("init")
    state.text = "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b -"
    state.history = [state.text]
    state.historyCursor = 0
  },
  setText(state, payload) {
    console.log("setText: " + payload.text)
    state.text = payload.text
  },
  receiveText(state, payload) {
    console.log("receiveText: " + payload.text)
    state.text = payload.text
  },
  reverse(state) {
    state.reversed = !state.reversed
  },
  moveBoardToBoard(state, payload) {
    console.log("moveBoardToBoard")
    const beforeCell = state.rows[payload.beforeY][payload.beforeX]
    const afterCell = state.rows[payload.afterY][payload.afterX]
    if (beforeCell.match(/[A-Z]/) && afterCell.match(/[A-Z]/) ||
        beforeCell.match(/[a-z]/) && afterCell.match(/[a-z]/)) {
      return
    }
    if (beforeCell.match(/[a-z]/) && afterCell.match(/[A-Z]/) ||
        beforeCell.match(/[A-Z]/) && afterCell.match(/[a-z]/)) {
      let newHand;
      if (afterCell.match(/[A-Z]/)) {
        newHand = afterCell.toLowerCase()
      } else {
        newHand = afterCell.toUpperCase()
      }
      if (newHand.match(/\+/)) {
        newHand = newHand.charAt(1)
      }
      state.hands[newHand] = state.hands[newHand] || 0
      state.hands[newHand] += 1
    }
    state.rows[payload.afterY][payload.afterX] = beforeCell
    state.rows[payload.beforeY][payload.beforeX] = "."
  },
  moveHandToBoard(state, payload) {
    console.log("moveHandToBoard")
    const beforeHand = payload.beforeHand
    const afterCell = state.rows[payload.afterY][payload.afterX]
    if (afterCell !== ".") {
      return
    } else {
      state.rows[payload.afterY][payload.afterX] = beforeHand
      state.hands[beforeHand] -= 1
      if (state.hands[beforeHand] === 0) {
        delete state.hands[beforeHand]
      }
    }
  },
  moveBoardToHand(state, payload) {
    console.log("moveBoardToHand")
    console.log(payload)
    const beforeCell = state.rows[payload.beforeY][payload.beforeX]
    let newHand = beforeCell
    console.log("newHand: " + newHand)
    if (newHand.match(/\+/)) {
      newHand = newHand.charAt(1)
    }
    if (payload.turn === "b") {
      newHand = newHand.toUpperCase()
    } else {
      newHand = newHand.toLowerCase()
    }
    state.hands[newHand] = state.hands[newHand]  || 0
    state.hands[newHand] += 1
    state.rows[payload.beforeY][payload.beforeX] = "."
  },
  moveHandToHand(state, payload) {
    console.log("moveHandToHand")
    let newHand = payload.beforeHand
    if (payload.turn === "b") {
      newHand = newHand.toUpperCase()
    } else {
      newHand = newHand.toLowerCase()
    }
    state.hands[newHand] = state.hands[newHand] || 0
    state.hands[newHand] += 1
    state.hands[payload.beforeHand] -= 1
    if (state.hands[payload.beforeHand] === 0) {
      delete state.hands[payload.beforeHand]
    }
  },
  togglePromotedAndTurn(state, payload) {
    const x = payload.x
    const y = payload.y
    const cell = state.rows[y][x]
    console.log("togglePromoted: cell: " + cell + ", x: " + x + ", y: " + y)
    if (cell.match(/[.]/)) {
      return
    }
    if (cell.match(/[GK]/)) {
      state.rows[y][x] = cell.toLowerCase()
    } else if (cell.match(/[gk]/)) {
      state.rows[y][x] = cell.toUpperCase()
    } else if (cell.match(/\+[A-Z]/)) {
      state.rows[y][x] = cell.charAt(1).toLowerCase()
    } else if (cell.match(/\+[a-z]/)) {
      state.rows[y][x] = cell.charAt(1).toUpperCase()
    } else {
      console.log("promote")
      state.rows[y][x] = "+" + cell
    }
  },
  parseSfen(state, payload) {
    console.log("parseSfen: " + state.text)
    let sfen = state.text
    if (!sfen) {
      return
    }
    if (state.reversed) {
      const values = state.text.split(" ")
      const board = values[0]
      const turn = values[1]
      const hand = values[2]
      const reversedCells = []
      for (const match of Array.from(board.matchAll(/\+?./g)).reverse()) {
        const cell = match[0]
        let reversedCell = undefined
        if (cell.match(/[a-z]/)) {
          reversedCell = cell.toUpperCase()
        } else if (cell.match(/[A-Z]/)) {
          reversedCell = cell.toLowerCase()
        } else {
          reversedCell = cell
        }
        reversedCells.push(reversedCell)
      }
      const reversedHands = []
      for (const cell of hand.split("")) {
        let reversedCell = undefined
        if (cell.match(/[a-z]/)) {
          reversedCell = cell.toUpperCase()
        } else if (cell.match(/[A-Z]/)) {
          reversedCell = cell.toLowerCase()
        } else {
          reversedCell = cell
        }
        reversedHands.push(reversedCell)
      }
      sfen = reversedCells.join("") +
              " " +
              turn +
              " " +
              reversedHands.join("")
    }
    console.log(state.text)
    console.log(sfen)
    const values = sfen.split(" ")
    const board = values[0]
    const hand = values[2]
    const rows = board.split("/").map((row) => {
      const cells = []
      const chars = row.split("")
      for (let i = 0; i < chars.length; i++) {
        const char = chars[i]
        if (char.match(/\d/)) {
          for (let j = 0; j < Number(char); j++) {
            cells.push(".")
          }
        } else if (char.match(/\+/)) {
          cells.push(char + chars[i + 1])
          i++
        } else {
          cells.push(char)
        }
      }
      return cells
    })

    const hands = {}
    if (hand !== undefined &&
        hand !== "-") {
      const chars = hand.split("")
      for (let i = 0, len = chars.length; i < len; i++) {
        const char = chars[i]
        if (char.match(/\d/)) {
          i++
          hands[chars[i]] = Number(char)
        } else {
          hands[char] = 1
        }
      }
    }

    state.rows = rows
    state.hands = hands
    console.log(rows)
    console.log(hands)
  },
  fillHands(state) {
    ["b", "w"].forEach(function(turn) {
      const filledHands = []
      const pieces = state.capturablePieces[turn]
      pieces.forEach((piece) => {
        if (state.hands[piece]) {
          filledHands.push(piece)
        }
      })
      for (let i = 0, len = (pieces.length - filledHands.length); i < len; i++) {
        filledHands.push(".")
      }
      state.filledHands[turn] = filledHands
    })
  },
  buildSfen(state, payload) {
    console.log("buildSfen")
    let sfen = ""
    let nSpaces = 0
    const rows = state.rows
    const hands = state.hands
    console.log(hands)
    rows.forEach((row, index) => {
      if (index !== 0) {
        sfen += "/"
      }
      for (const char of row) {
        if (char === ".") {
          nSpaces++
        } else {
          if (nSpaces) {
            sfen += nSpaces
            nSpaces = 0
          }
          sfen += char
        }
      }
      if (nSpaces) {
        sfen += nSpaces
        nSpaces = 0
      }
    })
    sfen += " b "
    if (Object.keys(hands).length > 0) {
      for (let [key, value] of Object.entries(hands)) {
        if (value > 1) {
          sfen += value + key
        } else {
          sfen += key
        }
      }
    } else {
      sfen += "-"
    }
    console.log("built sfen: " + sfen)
    if (state.reversed) {
      const values = sfen.split(" ")
      const board = values[0]
      const turn = values[1]
      const hand = values[2]
      const reversedCells = []
      for (const match of Array.from(board.matchAll(/\+?./g)).reverse()) {
        const cell = match[0]
        let reversedCell = undefined
        if (cell.match(/[a-z]/)) {
          reversedCell = cell.toUpperCase()
        } else if (cell.match(/[A-Z]/)) {
          reversedCell = cell.toLowerCase()
        } else {
          reversedCell = cell
        }
        reversedCells.push(reversedCell)
      }
      const reversedHands = []
      for (const cell of hand.split("")) {
        console.log(cell)
        let reversedCell = undefined
        if (cell.match(/[a-z]/)) {
          reversedCell = cell.toUpperCase()
        } else if (cell.match(/[A-Z]/)) {
          reversedCell = cell.toLowerCase()
        } else {
          reversedCell = cell
        }
        reversedHands.push(reversedCell)
      }
      sfen = reversedCells.join("") +
              " " +
              turn +
              " " +
              reversedHands.join("")
      console.log("reversed sfen: " + sfen)
    }
    state.text = sfen
  },
  addHistory(state) {
    if (state.text === state.history[0] ||
        state.text === state.history[state.historyCursor]) {
      return
    }
    for (let i = 0, len = state.historyCursor; i < len; i++) {
      state.history.shift()
      state.historyCursor--
    }
    state.history.unshift(state.text)
  },
  prevHistory(state) {
    if (state.historyCursor >= state.history.length - 1) {
      return
    }
    state.historyCursor++
    state.text = state.history[state.historyCursor]
  },
  nextHistory(state) {
    if (state.historyCursor <= 0) {
      return
    }
    state.historyCursor--
    state.text = state.history[state.historyCursor]
  },
}
