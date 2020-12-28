<template>
  <div>
    <div class="m-1 d-flex justify-content-center align-items-center">
      <button
        type="button"
        class="btn btn-sm"
        v-on:click="$store.commit('option/toggleGameMode')"
        v-bind:class="{
          'btn-dark': enabledGameMode,
          'btn-light': !enabledGameMode,
        }"
      >対局</button>
      <button
        type="button"
        class="btn btn-sm"
        v-on:click="$store.commit('option/toggleLatestMark')"
        v-bind:class="{
          'btn-dark': enabledLatestMark,
          'btn-light': !enabledLatestMark,
        }"
      >着手位置</button>
      <button
        type="button"
        class="btn btn-sm"
        v-on:click="$store.commit('option/toggleBoardGuide')"
        v-bind:class="{
          'btn-dark': enabledBoardGuide,
          'btn-light': !enabledBoardGuide,
        }"
      >符号</button>
      <button
        type="button"
        class="btn btn-sm"
        v-on:click="$store.commit('option/toggleAudio')"
        v-bind:class="{
          'btn-dark': enabledAudio,
          'btn-light': !enabledAudio,
        }"
      >駒音</button>
      <button
        type="button"
        class="btn btn-sm"
        v-show="!hideClock"
        v-on:click="$store.commit('option/toggleClock')"
        v-bind:class="{
          'btn-dark': showClock,
          'btn-light': !showClock,
        }"
      >時計</button>
      <button
        type="button"
        class="btn btn-sm"
        v-show="!hideStock"
        v-on:click="$store.commit('option/toggleStock')"
        v-bind:class="{
          'btn-dark': showStock,
          'btn-light': !showStock,
        }"
      >駒箱</button>
      <div>
        <b-form-select
          :value="font"
          @input="setFont"
          :options="fontOptions"
          size="sm"
        ></b-form-select>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from "vue"
import { mapState } from "vuex"

export default Vue.extend({
  props: {
    hideClock: Boolean,
    hideStock: Boolean,
  },
  computed: {
    ...mapState("option", {
      enabledGameMode: "enabledGameMode",
      enabledAudio: "enabledAudio",
      enabledLatestMark: "enabledLatestMark",
      enabledBoardGuide: "enabledBoardGuide",
      showStock: "showStock",
      showClock: "showClock",
      font: "font",
      fontOptions: "fontOptions",
    }),
  },
  data() {
    return {
    }
  },
  methods: {
    setFont(value) {
      this.$store.commit("option/setFont", value)
    },
  }
})
</script>
<style>
.latestCell {
  background-color: orange;
}
.beforeCell {
  background-color: yellow;
}
.board {
  margin: 0 0 2% 0;
  background-color: #d6c6af;
  border-collapse: collapse;
}
.boardOutside {
  outline: solid 1px;
  outline-color: gray;
  background-color: #d6c6af;
}
.boardGuide {
  font-size: small;
  text-align: center;
}
.boardGuideTop {
  border-top-style: hidden;
  border-left-style: hidden;
  border-right-style: hidden;
  border-bottom-style: outset; /* 枠線の復元 */
}
.boardGuideRight {
  border-top-style: hidden;
  border-right-style: hidden;
  border-bottom-style: hidden;
  border-left-style: outset; /* 枠線の復元 */
}
.toggleButtonOn {
  color: white;
  background-color: #696969;
}
</style>
