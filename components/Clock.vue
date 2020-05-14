<template>
  <div class="">
    対局時計: {{displayBTime}} : {{displayWTime}}
    <button type="button" v-on:click="changeTurn('w')">先手側のボタン</button>
    <button type="button" v-on:click="changeTurn('b')">後手側のボタン</button>
    <button type="button" v-on:click="togglePause()">一時停止</button>
    <button type="button" v-if="pause" v-on:click="reset()">リセット</button>
  </div>
</template>
<script>
import Vue from "vue"

export default Vue.extend({
  computed: {
    displayBTime: function() {
      console.log("displayBTime")
      return this.displayTime(this.timeLimits['b'])
    },
    displayWTime: function() {
      return this.displayTime(this.timeLimits['w'])
    },
  },
  data() {
    return {
      mode: undefined,
      countdown: 0,
      currentTurn: undefined,
      requestID: undefined,
      performanceNow: undefined,
      subtotal: 0,
      timeLimits: {
        b: 0,
        w: 0,
      },
      pause: false,
    }
  },
  mounted() {
    this.reset()
  },
  methods: {
    displayTime(timeLimit) {
      const timeLimitSecond = Math.floor(timeLimit / 1000)
      const min = Math.floor(timeLimitSecond / 60)
      let sec = timeLimitSecond % 60
      if (sec < 10) {
        sec = "0" + sec
      }
      return min + ":" + sec
    },
    changeTurn(nextTurn) {
      if (this.currentTurn === nextTurn) {
        return
      }
      this.currentTurn = nextTurn
      this.subtotal = 0
      if (!this.requestID) {
        this.performanceNow = performance.now()
        this.requestID = requestAnimationFrame(this.step)
      }
    },
    step(timestamp) {
      if (!this.pause) {
        this.subtotal += timestamp - this.performanceNow
        if (this.subtotal >= 100) {
          this.timeLimits[this.currentTurn] -= 100
          this.subtotal -= 100
        }
      }
      this.performanceNow = timestamp
      requestAnimationFrame(this.step)
    },
    togglePause() {
      this.pause = !this.pause
    },
    reset(turn) {
      if (this.requestID) {
        cancelAnimationFrame(this.requestID)
      }
      this.requestID = undefined
      this.currentTurn = undefined
      this.subtotal = 0
      const timeLimit = 5 * 60 * 1000
      this.timeLimits['b'] = timeLimit
      this.timeLimits['w'] = timeLimit
    },
  }
})
</script>
<style>
</style>
