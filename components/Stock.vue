<template>
  <div
    class="d-flex justify-content-around stock flex-stock"
    v-on:click="moveHand()"
    v-on:drop.prevent="moveToHand(turn)"
    v-on:dragover.prevent
  >
    <div
      class="stock-piece"
      v-for="piece in filledStock"
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
      <span>{{stock[piece] || "　"}}</span>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useSfenStore } from '~/stores'
import Piece from '~/components/Piece.vue'

// Define props
const props = defineProps({
  turn: String,
  font: String,
  moveFromHand: Function,
  moveToHand: Function,
  isBeforeHand: Function,
  isSelectedPiece: Function,
})

// Data
const sfenStore = useSfenStore()

// Computed
const filledStock = computed(() => {
  return sfenStore.filledStock || []
})

const stock = computed(() => {
  return sfenStore.stock || {}
})

// Methods
const moveHand = (piece) => {
  // debug: console.log("moveHand: " + piece)
  if (props.isSelectedPiece()) {
    props.moveToHand(props.turn)
  } else if (piece) {
    props.moveFromHand(piece)
  }
}
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
