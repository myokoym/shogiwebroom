<template>
  <div class="d-flex flex-row board">
    <div
      v-for="piece in filledHands"
      v-bind:class="{beforeCell: isBeforeHand(piece)}"
      v-on:click="moveFromHand(piece)"
    >
      <img
        v-bind:src="imagePath(piece)"
        style="width: 100%; height: auto;"
      >{{(hands[piece] || "") + "　"}}</div>
  </div>
</template>
<script>
import Vue from "vue"

export default Vue.extend({
  props: {
    hands: Object,
    pieces: Array,
    imagePath: Function,
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
      this.updateFiledHands()
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
