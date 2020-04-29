<template>
  <div>
    <table>
      <tr>
        <td
          v-for="piece in wPieces"
          v-if="hands[piece]"
          v-on:click="moveFromHand(piece)"
          v-bind:class="{beforeCell: isBeforeHand(piece)}"
        >{{piece}}{{hands[piece]}}</td>
      </tr>
    </table>
    <table>
      <tr v-for="(row, y) in rows">
        <td
          v-for="(cell, x) in row"
          v-on:click="moveCell(x, y)"
          v-bind:class="{beforeCell: isBeforeCell(x, y)}"
        >{{cell}}</td>
      </tr>
    </table>
    <table>
      <tr>
        <td
          v-for="piece in bPieces"
          v-if="hands[piece]"
          v-on:click="moveFromHand(piece)"
          v-bind:class="{beforeCell: isBeforeHand(piece)}"
        >{{piece}}{{hands[piece]}}</td>
      </tr>
    </table>
    <input
      type="text"
      size="70"
      v-bind:value="value"
      v-on:input="   $emit('input', $event.target.value)"
    >
    <button v-on:click="onSend()">送信</button>
    <button v-on:click="init()">初期化</button>
    <button v-on:click="buildSfen()">buildSfen</button>
  </div>
</template>
<script>
import Vue from "vue"

export default Vue.extend({
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
    }
  },
  methods: {
    onSend() {
      this.$emit('send')
    },
    init() {
      this.$emit('updateText', "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL S2Pb3p")
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
        for (const char of chars) {
          if (char.match(/\d/)) {
            for (let i = 0; i < Number(char); i++) {
              cells.push(".")
            }
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
      this.beforeX = undefined
      this.beforeY = undefined
      this.beforeHand = piece
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
        if (this.beforeX) {
          const beforeCell = this.rows[this.beforeY][this.beforeX]
          if (beforeCell.match(/[A-Z]/) && afterCell.match(/[A-Z]/) ||
              beforeCell.match(/[a-z]/) && afterCell.match(/[a-z]/)) {
            this.beforeX = x
            this.beforeY = y
            return
          } else if (beforeCell.match(/[a-z]/) && afterCell.match(/[A-Z]/)) {
            const newHand = afterCell.toLowerCase()
            this.hands[newHand] = this.hands[newHand] || 0
            this.hands[newHand] += 1
          } else if (beforeCell.match(/[A-Z]/) && afterCell.match(/[a-z]/)) {
            const newHand = afterCell.toUpperCase()
            this.hands[newHand] = this.hands[newHand] || 0
            this.hands[newHand] += 1
          }
          this.rows[y][x] = this.rows[this.beforeY][this.beforeX]
          this.rows[this.beforeY][this.beforeX] = "."
        } else if (this.beforeHand) {
          console.log("beforeeeeeeeeeeeeeeeeeeeeeeeee")
          if (afterCell !== ".") {
            return
          } else {
            console.log("hhhhhhhhhhhhhhhhhh")
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
</style>
