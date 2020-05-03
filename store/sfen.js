export const state = () => ({
  roomId: undefined,
  text: "",
  rows: [],
  hands: {},
  reversed: false,
})

export const getters = {
  reversedSfen: (state) => {
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
    return reversedCells.join("") +
            " " +
            turn +
            " " +
            reversedHands.join("")
  },
}

export const mutations = {
  setRoomId(state, payload) {
    console.log("setRoomId: " + payload.roomId)
    state.roomId = payload.roomId
  },
  init(state) {
    console.log("init")
    state.text = "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b -"
  },
  setText(state, payload) {
    console.log("setText: " + payload.text)
    state.text = payload.text
  },
  reverse(state) {
    state.reversed = !state.reversed
  },
  increaseHand(state, payload) {
    console.log("increaseHand: " + payload.hand)
    state.hands[payload.hand] = state.hands[payload.hand]  || 0
    state.hands[payload.hand] += 1
  },
  decreaseHand(state, payload) {
    console.log("decreaseHand: " + payload.hand)
    state.hands[payload.hand] -= 1
    if (state.hands[payload.hand] === 0) {
      delete state.hands[payload.hand]
    }
  },
  parseSfen(state, payload) {
    console.log("parseSfen: " + state.text)
    let sfen = state.text
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
}

export const actions = {
}