<template>
  <div>
    <div class="m-1 d-flex justify-content-center align-items-center">
      <button
        type="button"
        class="btn btn-sm"
        v-on:click="optionStore.toggleGameMode()"
        v-bind:class="{
          'btn-dark': enabledGameMode,
          'btn-light': !enabledGameMode,
        }"
      >対局</button>
      <button
        type="button"
        class="btn btn-sm"
        v-on:click="optionStore.toggleLatestMark()"
        v-bind:class="{
          'btn-dark': enabledLatestMark,
          'btn-light': !enabledLatestMark,
        }"
      >着手位置</button>
      <button
        type="button"
        class="btn btn-sm"
        v-on:click="optionStore.toggleBoardGuide()"
        v-bind:class="{
          'btn-dark': enabledBoardGuide,
          'btn-light': !enabledBoardGuide,
        }"
      >符号</button>
      <button
        type="button"
        class="btn btn-sm"
        v-on:click="optionStore.toggleAudio()"
        v-bind:class="{
          'btn-dark': enabledAudio,
          'btn-light': !enabledAudio,
        }"
      >駒音</button>
      <button
        type="button"
        class="btn btn-sm"
        v-show="!hideClock"
        v-on:click="optionStore.toggleClock()"
        v-bind:class="{
          'btn-dark': showClock,
          'btn-light': !showClock,
        }"
      >時計</button>
      <button
        type="button"
        class="btn btn-sm"
        v-show="!hideStock"
        v-on:click="optionStore.toggleStock()"
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
import { useOptionStore } from '~/stores'

export default Vue.extend({
  props: {
    hideClock: Boolean,
    hideStock: Boolean,
  },
  data() {
    return {
      optionStore: null,
    }
  },
  computed: {
    enabledGameMode() { return this.optionStore?.enabledGameMode || false },
    enabledAudio() { return this.optionStore?.enabledAudio || false },
    enabledLatestMark() { return this.optionStore?.enabledLatestMark || false },
    enabledBoardGuide() { return this.optionStore?.enabledBoardGuide || false },
    showStock() { return this.optionStore?.showStock || false },
    showClock() { return this.optionStore?.showClock || false },
    font() { return this.optionStore?.font || 'kirieji' },
    fontOptions() { return this.optionStore?.fontOptions || [] },
  },
  mounted() {
    this.optionStore = useOptionStore()
  },
  methods: {
    setFont(value) {
      this.optionStore.setFont(value)
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
