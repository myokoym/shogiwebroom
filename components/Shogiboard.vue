<template>
  <div class="row">
    <Hand
      v-bind:hands="hands"
      v-bind:pieces="wPieces"
      v-bind:move-from-hand="moveFromHand"
      v-bind:is-before-hand="isBeforeHand"
    ></Hand>
    <table
      class="col-xs-8 board"
      border="1"
      style="border-collapse: collapse;"
    >
      <tr v-for="(row, y) in rows">
        <td
          v-for="(cell, x) in row"
          v-on:click="moveCell(x, y)"
          v-on:click.right.prevent="togglePromoted(x, y)"
          v-bind:class="{beforeCell: isBeforeCell(x, y)}"
        >
          <Piece
            v-bind:piece="cell"
          ></Piece>
        </td>
      </tr>
    </table>
    <Hand
      v-bind:hands="hands"
      v-bind:pieces="bPieces"
      v-bind:move-from-hand="moveFromHand"
      v-bind:is-before-hand="isBeforeHand"
    ></Hand>
    <input
      type="text"
      size="70"
      v-bind:value="value"
      v-on:input="$emit('input', $event.target.value)"
    >
    <button v-on:click="onSend()">送信</button>
    <button v-on:click="init()">初期化</button>
    <button v-on:click="buildSfen()">buildSfen</button>
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
    this.parseSfen()
  },
  data() {
    return {
      rows: [],
      hands: {},
      filledBHands: [],
      filledWHands: [],
      bPieces: ["P", "L", "N", "S", "G", "B", "R", "K"],
      wPieces: ["p", "l", "n", "s", "g", "b", "r", "k"],
      beforeX: undefined,
      beforeY: undefined,
      beforeHand: undefined,
    }
  },
  watch: {
    "value": function() {
      this.parseSfen()
    },
  },
  computed: {
  },
  methods: {
    onSend() {
      this.$emit('send')
    },
    init() {
      this.$emit('updateText', "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL")
    },
    isBeforeCell(x, y) {
      return this.beforeX === x && this.beforeY === y
    },
    isBeforeHand(piece) {
      return this.beforeHand === piece
    },
    parseSfen() {
      console.log("parseSfen")
      const values = this.value.split(" ")
      const board = values[0]
      const hand = values[1]
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
      if (hand) {
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
      if (this.hands) {
        sfen += " "
        for (let [key, value] of Object.entries(this.hands)) {
          if (value > 1) {
            sfen += value + key
          } else {
            sfen += key
          }
        }
      }
      console.log(sfen)
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
    togglePromoted(x, y) {
      const cell = this.rows[y][x]
      console.log("togglePromoted: cell: " + cell + ", x: " + x + ", y: " + y)
      if (cell.match(/[.GKgk]/)) {
        return
      }
      if (cell.match(/\+/)) {
        console.log("cancel")
        this.rows[y][x] = cell.charAt(1)
      } else {
        console.log("promote")
        this.rows[y][x] = "+" + cell
      }
      this.$emit('updateText', this.buildSfen())
      this.$emit('send')
    },
    moveCell(x, y) {
      if (!this.beforeX && this.rows[y][x] !== ".") {
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
  margin: 1rem;
  background-color: #d6c6af;
}
</style>
