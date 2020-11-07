<template>
  <div
    class="d-flex justify-content-around stock flex-stock"
    v-on:click="moveHand()"
    v-on:drop.prevent="moveToHand(turn)"
    v-on:dragover.prevent
  >
    <div
      class="stock-piece"
      v-for="piece in $store.state.sfen.filledStock"
      v-bind:class="{beforeCell: isBeforeHand(piece)}"
      v-on:click.stop="moveHand(piece)"
      draggable
      v-on:dragstart="moveFromHand(piece)"
    >
      <Piece
        type="hand"
        v-bind:piece="piece"
        v-bind:font="font"
      ></Piece>
      <span>{{$store.state.sfen.stock[piece] || "　"}}</span>
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
    font: String,
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
      // debug: console.log("moveHand: " + piece)
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
.stock {
  margin: 2%;
  background-color: lightgray;
  outline: solid 1px;
  text-align: center;
}

.flex-stock {
  flex-direction: row;
}
</style>
