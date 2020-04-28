<template>
  <div>
    <table>
      <tr v-for="row in rows">
        <td v-for="cell in row">{{cell}}</td>
      </tr>
    </table>
    <input
      type="text"
      size="70"
      v-bind:value="value"
      v-on:input="$emit('input', $event.target.value)"
    >
    <button v-on:click="onSend()">送信</button>
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
      hand_b: [],
      hand_w: [],
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
    parseSfen() {
      console.log("parseSfen")
      let board, hand
      [board, hand] = this.value.split(" ")
      let rows = board.split("/")
      this.rows = rows.map((row) => {
        let cells = []
        let chars = row.split("")
        for (let i = 0, len = chars.length; i < len; i++) {
          let char = chars[i]
          if (char.match(/\d/)) {
            for (let j = 0; j < Number(char); j++) {
              cells.push(".")
            }
          } else {
            cells.push(char)
          }
        }
        return cells
      })

      if (hand) {
        let chars = hand.split("")
        for (let i = 0, len = chars.length; i < len; i++) {

        }
      }
    },
    move(from, to) {
      let cells = parseSfen(this.value)
    }
  }
})
</script>
<style>
</style>
