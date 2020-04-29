<template>
  <div>
    <table>
      <tr>
        <td
          v-for="piece in wPieces"
          v-if="hands[piece]"
        >{{piece}}{{hands[piece]}}</td>
      </tr>
    </table>
    <table>
      <tr v-for="row in rows">
        <td v-for="cell in row">{{cell}}</td>
      </tr>
    </table>
    <table>
      <tr>
        <td
          v-for="piece in bPieces"
          v-if="hands[piece]"
        >{{piece}}{{hands[piece]}}</td>
      </tr>
    </table>
    <input
      type="text"
      size="70"
      v-bind:value="value"
      v-on:input="$emit('input', $event.target.value)"
    >
    <button v-on:click="onSend()">送信</button>
    <button v-on:click="init()">初期化</button>
  </div>
</template>
<script>
import Vue from "vue"

export default Vue.extend({
  props: {
    value: String,
    send: Function,
  },
  mounted() {
    this.parseSfen()
  },
  data() {
    return {
      rows: [],
      hands: {},
      bPieces: ["P", "L", "N", "S", "G", "B", "R"],
      wPieces: ["p", "l", "n", "s", "g", "b", "r"],
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
      this.value = "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL S2Pb3p"
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
    move(from, to) {
    }
  }
})
</script>
<style>
</style>
