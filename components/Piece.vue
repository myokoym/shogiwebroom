<template>
  <img
    v-bind:src="imagePath()"
    v-bind:class="{
      boardPiece: type === 'board',
      handPiece: type === 'hand',
    }"
  >
</template>
<script>
import Vue from "vue"

export default Vue.extend({
  props: {
    piece: String,
    type: String,
  },
  mounted() {
  },
  data() {
    return {
      pieceImagePaths: {
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
      },
    }
  },
  watch: {
  },
  methods: {
    imagePath() {
      let path = this.pieceImagePaths[this.piece]
      if (path === undefined) {
        path = "hatena"
      }
      return require("@/assets/images/kirieji1/" + path + ".png")
    },
  }
})
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