<template>
  <div class="d-flex flex-row board">
    <div
      v-for="piece in filledHands"
      v-bind:class="{beforeCell: isBeforeHand(piece)}"
      v-on:click="moveFromHand(piece)"
    >
      <Piece
        v-bind:piece="piece"
      ></Piece>
      {{(hands[piece] || "") + "　"}}</div>
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
    hands: Object,
    pieces: Array,
    moveFromHand: Function,
    isBeforeHand: Function,
  },
  mounted() {
    this.updateFilledHands()
  },
  data() {
    return {
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
      this.pieces.forEach((piece) => {
        if (this.hands[piece]) {
          filledHands.push(piece)
        }
      })
      for (let i = 0, len = (this.pieces.length - filledHands.length); i < len; i++) {
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
.board {
  margin: 1rem;
  background-color: #d6c6af;
  outline: solid 1px;
}
</style>
