<template>
  <div
    class="d-flex hand"
    v-bind:class="{
      'flex-row': (turn === 'w'),
      'flex-row-reverse': (turn === 'b'),
    }">
    <div
      v-for="piece in $store.state.sfen.filledHands[turn]"
      v-bind:class="{beforeCell: isBeforeHand(piece)}"
      v-on:click="moveHand(piece)"
      draggable
      v-on:dragstart="moveFromHand(piece)"
      v-on:drop.prevent="moveToHand(turn)"
      v-on:dragover.prevent
    >
      <Piece
        type="hand"
        v-bind:piece="piece"
      ></Piece>
      <div>{{$store.state.sfen.hands[piece] || "　"}}</div>
    </div>
  </div>
</template>
<script>
import Vue from "vue"
import { mapState } from "vuex"
import Piece from '~/components/Piece.vue'

export default Vue.extend({
  components: {
    Piece,
  },
  props: {
    turn: String,
    moveFromHand: Function,
    moveToHand: Function,
    isBeforeHand: Function,
    isSelectedPiece: Function,
  },
  computed: {
  },
  mounted() {
  },
  data() {
    return {
    }
  },
  watch: {
  },
  methods: {
    moveHand(piece) {
      console.log("moveHand")
      if (this.isSelectedPiece()) {
        this.moveToHand(this.turn)
      } else {
        this.moveFromHand(piece)
      }
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
