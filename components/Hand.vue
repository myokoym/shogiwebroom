<template>
  <div
    class="d-flex justify-content-around hand"
    v-on:click="moveHand()"
    v-on:drop.prevent="moveToHand(turn)"
    v-on:dragover.prevent
    v-bind:class="{
      'flex-row': (turn === 'w'),
      'flex-row-reverse': (turn === 'b'),
    }">
    <div
      v-for="piece in $store.state.sfen.filledHands[turn]"
      v-bind:class="{beforeCell: isBeforeHand(piece)}"
      v-on:click.stop="moveHand(piece)"
      draggable
      v-on:dragstart="moveFromHand(piece)"
    >
      <Piece
        type="hand"
        v-bind:piece="piece"
      ></Piece>
      <span>{{$store.state.sfen.hands[piece] || "　"}}</span>
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
      console.log("moveHand: " + piece)
      if (this.isSelectedPiece()) {
        this.moveToHand(this.turn)
      } else if (piece) {
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
