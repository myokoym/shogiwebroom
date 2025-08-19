<template>
  <img
    v-bind:src="imagePath()"
    v-bind:class="{
      boardPiece: type === 'board',
      handPiece: type === 'hand',
    }"
  >
</template>
<script setup>
// Define props
const props = defineProps({
  piece: String,
  type: String,
  font: String,
})

// Data
const pieceImagePaths = {
  ".":  "blank",
  "K":  "b/K",
  "G":  "b/G",
  "S":  "b/S",
  "N":  "b/N",
  "L":  "b/L",
  "R":  "b/R",
  "B":  "b/B",
  "P":  "b/P",
  "+S": "b/_S",
  "+N": "b/_N",
  "+L": "b/_L",
  "+R": "b/_R",
  "+B": "b/_B",
  "+P": "b/_P",
  "k":  "w/k",
  "g":  "w/g",
  "s":  "w/s",
  "n":  "w/n",
  "l":  "w/l",
  "r":  "w/r",
  "b":  "w/b",
  "p":  "w/p",
  "+s": "w/_s",
  "+n": "w/_n",
  "+l": "w/_l",
  "+r": "w/_r",
  "+b": "w/_b",
  "+p": "w/_p",
}

// Methods
const imagePath = () => {
  let path = pieceImagePaths[props.piece]
  if (path === undefined) {
    path = "hatena"
  }
  let font = props.font
  if (!font) {
    font = "kirieji"
  }
  return require("@/assets/images/" + font + "/" + path + ".png")
}
</script>
<style>
.boardPiece {
  width: 100%;
  height: auto;
}
.handPiece {
  width: 80%;
  height: auto;
}
@media screen and (min-width: 640px) {
  .boardPiece {
    width: 64px;
  }
  .handPiece {
    width: 64px;
  }
}
</style>