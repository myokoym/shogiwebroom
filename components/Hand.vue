<template>
  <div
    class="d-flex justify-content-around hand"
    v-on:click="moveHand()"
    v-on:drop.prevent="moveToHand(turn)"
    v-on:dragover.prevent
    v-bind:class="{
      'flex-hand': (turn === 'w'),
      'flex-hand-reverse': (turn === 'b'),
    }">
    <div
      class="hand-piece"
      v-for="piece in filledHands"
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
      <span class="hand-n-pieces">{{hands[piece] || "　"}}</span>
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
const filledHands = computed(() => {
  return sfenStore.filledHands?.[props.turn] || []
})

const hands = computed(() => {
  return sfenStore.hands || {}
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
.hand {
  margin: 2%;
  background-color: #d6c6af;
  outline: solid 1px;
  outline-color: gray;
  text-align: center;
}

@media (min-width: 768px) {
  .flex-hand {
    flex-direction: column;
  }
  .flex-hand-reverse {
    flex-direction: column-reverse;
  }
  .hand-piece {
    display: flex;
    flex-direction: row;
  }
  .hand-n-pieces {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
@media (max-width: 767px) {
  .flex-hand {
    flex-direction: row;
  }
  .flex-hand-reverse {
    flex-direction: row-reverse;
  }
}
</style>
