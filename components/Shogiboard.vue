<template>
  <div>
    <Hand
      turn="w"
      v-bind:hands="hands"
      v-bind:move-from-hand="moveFromHand"
      v-bind:move-to-hand="moveToHand"
      v-bind:is-before-hand="isBeforeHand"
      v-bind:is-selected-piece="isSelectedPiece"
    ></Hand>
    <table
      class="board"
      border="1"
      style="border-collapse: collapse;"
    >
      <tr v-for="(row, y) in rows">
        <td
          v-for="(cell, x) in row"
          v-on:click="moveCell(x, y)"
          v-on:click.right.prevent="togglePromotedAndTurn(x, y)"
          v-bind:class="{beforeCell: isBeforeCell(x, y)}"
          draggable
          v-on:dragstart="moveCell(x, y)"
          v-on:drop.prevent="moveCell(x, y)"
          v-on:dragover.prevent
        >
          <Piece
            type="board"
            v-bind:piece="cell"
          ></Piece>
        </td>
      </tr>
    </table>
    <Hand
      turn="b"
      v-bind:hands="hands"
      v-bind:move-from-hand="moveFromHand"
      v-bind:move-to-hand="moveToHand"
      v-bind:is-before-hand="isBeforeHand"
      v-bind:is-selected-piece="isSelectedPiece"
    ></Hand>
    <div>
      <p>
        <button
          type="button"
          v-on:click="reverseBoard()"
          v-bind:class="{toggleButtonOn: reversed}"
        >反転: {{reversed ? "ON" : "OFF"}}</button>
        <button
          type="button"
          v-on:click="togglePromotedAndTurnOnButton()"
          v-bind:disabled="beforeX === undefined"
        >成る</button>
      </p>
      <p>SFEN: <input
        type="text"
        size="66"
        v-bind:value="value"
        v-on:input="$emit('input', $event.target.value)"
      ></p>
    </div>
  </div>
</template>
<script>
import Vue from "vue"
import Piece from '~/components/Piece.vue'
import Hand from '~/components/Hand.vue'

export default Vue.extend({
  components: {
    Piece,
    Hand,
  },
  props: {
    value: String,
    send: Function,
    updateText: Function,
  },
  mounted() {
    this.init()
    this.parseSfen()
  },
  data() {
    return {
      rows: [],
      hands: {},
      filledBHands: [],
      filledWHands: [],
      beforeX: undefined,
      beforeY: undefined,
      beforeHand: undefined,
      localSfen: "",
      reversed: false,
    }
  },
  watch: {
    "value": function() {
      this.update()
    },
  },
  computed: {
  },
  methods: {
    onSend() {
      this.$emit('send')
    },
    init() {
      this.$emit('updateText', "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b -")
    },
    update() {
      this.localSfen = this.value
      if (this.reversed) {
        this.localSfen = this.reverseSfen(this.localSfen)
      }
      console.log("localSfen: " + this.localSfen)
      this.parseSfen()
    },
    isBeforeCell(x, y) {
      return this.beforeX === x && this.beforeY === y
    },
    isBeforeHand(piece) {
      return this.beforeHand === piece
    },
    isSelectedPiece() {
      return this.beforeX !== undefined ||
             this.beforeHand !== undefined
    },
    reverseBoard() {
      this.reversed = !this.reversed
      this.update()
    },
    reverseSfen(sfen) {
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
    parseSfen() {
      console.log("parseSfen")
      const values = this.localSfen.split(" ")
      const board = values[0]
      const hand = values[2]
      this.rows = board.split("/").map((row) => {
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

      this.hands = {}
      if (hand !== undefined &&
          hand !== "-") {
        const chars = hand.split("")
        for (let i = 0, len = chars.length; i < len; i++) {
          const char = chars[i]
          if (char.match(/\d/)) {
            i++
            this.hands[chars[i]] = Number(char)
          } else {
            this.hands[char] = 1
          }
        }
      }
    },
    buildSfen() {
      let sfen = ""
      let nSpaces = 0
      this.rows.forEach((row, index) => {
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
      if (Object.keys(this.hands).length > 0) {
        for (let [key, value] of Object.entries(this.hands)) {
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
      if (this.reversed) {
        sfen = this.reverseSfen(sfen)
      }
      console.log("reversed sfen: " + sfen)
      return sfen
    },
    moveFromHand(piece) {
      console.log("moveFromHand: " + piece)
      if (piece === ".") {
        return
      }
      this.beforeX = undefined
      this.beforeY = undefined
      if (this.beforeHand === piece) {
        this.beforeHand = undefined
      } else {
        this.beforeHand = piece
      }
    },
    moveToHand(turn) {
      console.log("moveToHand: " + turn)
      if (this.beforeX === undefined &&
          this.beforeHand === undefined) {
        return
      }
      if (this.beforeX !== undefined) {
        const beforeCell = this.rows[this.beforeY][this.beforeX]
        let newHand = beforeCell
        if (newHand.match(/\+/)) {
          newHand = newHand.charAt(1)
        }
        if (turn === "b") {
          newHand = newHand.toUpperCase()
        } else {
          newHand = newHand.toLowerCase()
        }
        this.hands[newHand] = this.hands[newHand] || 0
        this.hands[newHand] += 1
        this.rows[this.beforeY][this.beforeX] = "."
        this.beforeX = undefined
        this.beforeY = undefined
      } else if (this.beforeHand) {
        let newHand = this.beforeHand
        if (turn === "b") {
          newHand = newHand.toUpperCase()
        } else {
          newHand = newHand.toLowerCase()
        }
        this.hands[newHand] = this.hands[newHand] || 0
        this.hands[newHand] += 1
        this.hands[this.beforeHand] -= 1
        if (this.hands[this.beforeHand] === 0) {
          delete this.hands[this.beforeHand]
        }
        this.beforeHand = undefined
      }
      this.$emit('updateText', this.buildSfen())
      this.$emit('send')
    },
    togglePromotedAndTurn(x, y) {
      const cell = this.rows[y][x]
      console.log("togglePromoted: cell: " + cell + ", x: " + x + ", y: " + y)
      if (cell.match(/[.]/)) {
        return
      }
      if (cell.match(/[GK]/)) {
        this.rows[y][x] = cell.toLowerCase()
      } else if (cell.match(/[gk]/)) {
        this.rows[y][x] = cell.toUpperCase()
      } else if (cell.match(/\+[A-Z]/)) {
        this.rows[y][x] = cell.charAt(1).toLowerCase()
      } else if (cell.match(/\+[a-z]/)) {
        this.rows[y][x] = cell.charAt(1).toUpperCase()
      } else {
        console.log("promote")
        this.rows[y][x] = "+" + cell
      }
      this.$emit('updateText', this.buildSfen())
      this.$emit('send')
    },
    togglePromotedAndTurnOnButton() {
      if (this.beforeX === undefined) {
        return
      }
      this.togglePromotedAndTurn(this.beforeX, this.beforeY)
    },
    moveCell(x, y) {
      if (this.beforeX === undefined && this.rows[y][x] !== ".") {
        this.beforeX = x
        this.beforeY = y
        this.beforeHand = undefined
      } else if (this.beforeX === x && this.beforeY === y) {
        this.beforeX = undefined
        this.beforeY = undefined
      } else {
        const afterCell = this.rows[y][x]
        if (this.beforeX !== undefined) {
          const beforeCell = this.rows[this.beforeY][this.beforeX]
          if (beforeCell.match(/[A-Z]/) && afterCell.match(/[A-Z]/) ||
              beforeCell.match(/[a-z]/) && afterCell.match(/[a-z]/)) {
            this.beforeX = x
            this.beforeY = y
            return
          } else if (beforeCell.match(/[a-z]/) && afterCell.match(/[A-Z]/)) {
            let newHand = afterCell.toLowerCase()
            if (newHand.match(/\+/)) {
              newHand = newHand.charAt(1)
            }
            this.hands[newHand] = this.hands[newHand] || 0
            this.hands[newHand] += 1
          } else if (beforeCell.match(/[A-Z]/) && afterCell.match(/[a-z]/)) {
            let newHand = afterCell.toUpperCase()
            if (newHand.match(/\+/)) {
              newHand = newHand.charAt(1)
            }
            this.hands[newHand] = this.hands[newHand] || 0
            this.hands[newHand] += 1
          }
          this.rows[y][x] = this.rows[this.beforeY][this.beforeX]
          this.rows[this.beforeY][this.beforeX] = "."
        } else if (this.beforeHand) {
          if (afterCell !== ".") {
            return
          } else {
            this.rows[y][x] = this.beforeHand
            this.hands[this.beforeHand] -= 1
            if (this.hands[this.beforeHand] === 0) {
              delete this.hands[this.beforeHand]
            }
          }
        }
        this.beforeX = undefined
        this.beforeY = undefined
        this.beforeHand = undefined
        this.$emit('updateText', this.buildSfen())
        this.$emit('send')
      }
    }
  }
})
</script>
<style>
.beforeCell {
  background-color: yellow;
}
.board {
  margin: auto;
  outline: solid 1px;
  background-color: #d6c6af;
}
.toggleButtonOn {
  color: white;
  background-color: #696969;
}
</style>
