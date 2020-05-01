<template>
  <img
    v-bind:src="imagePath()"
    style="width: 100%; height: auto;"
  >
</template>
<script>
import Vue from "vue"

export default Vue.extend({
  props: {
    piece: String,
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
      return require("@/assets/images/kirieji1/" + this.pieceImagePaths[this.piece] + ".png")
    },
  }
})
</script>
<style>
</style>