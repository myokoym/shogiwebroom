<template>
  <div
    class="d-flex hand"
    v-bind:class="{
      'flex-row': (turn === 'w'),
      'flex-row-reverse': (turn === 'b'),
    }">
    <div
      v-for="piece in filledHands"
      v-bind:class="{beforeCell: isBeforeHand(piece)}"
      v-on:click="moveFromHand(piece)"
    >
      <Piece
        type="hand"
        v-bind:piece="piece"
      ></Piece>
      <div>{{hands[piece] || ""}}</div>
    </div>
  </div>
</template>
<script>
import Vue from "vue"
import Piece from '~/components/Piece.vue'

export default Vue.extend({
  components: {
    Piece,
  },
  props: {
    turn: String,
    hands: Object,
    moveFromHand: Function,
    isBeforeHand: Function,
  },
  mounted() {
    this.updateFilledHands()
  },
  data() {
    return {
      pieces: {
        b: ["P", "L", "N", "S", "G", "B", "R", "K"],
        w: ["p", "l", "n", "s", "g", "b", "r", "k"],
      },
      filledHands: [],
    }
  },
  watch: {
    "hands": function() {
      console.log("watch: hands")
      this.updateFilledHands()
    },
  },
  methods: {
    updateFilledHands() {
      console.log("updateFilledHands")
      const filledHands = []
      console.log(this.turn)
      const pieces = this.pieces[this.turn]
      pieces.forEach((piece) => {
        if (this.hands[piece]) {
          filledHands.push(piece)
        }
      })
      for (let i = 0, len = (pieces.length - filledHands.length); i < len; i++) {
        filledHands.push(".")
      }
      this.filledHands = filledHands
    },
  }
})
</script>
<style>
.beforeCell {
  background-color: yellow;
}
.hand {
  margin: 2%;
  background-color: #d6c6af;
  outline: solid 1px;
  text-align: center;
}
</style>
