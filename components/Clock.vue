<template>
  <div class="">
    <div v-if="enabled" class="">
      対局時計: {{displayBTime}} : {{displayWTime}}
      <button type="button" v-on:click="changeTurn('w')">先手側のボタン</button>
      <button type="button" v-on:click="changeTurn('b')">後手側のボタン</button>
      <button type="button" v-on:click="togglePause()">一時停止</button>
    </div>
    {{enabled}}
    {{turn}}
    {{$store.state.clock.currentTurn}}
    {{pause}}
    <button type="button" v-if="!enabled || pause" v-on:click="reset()">リセット</button>
  </div>
</template>
<script>
import Vue from "vue"
import { mapState } from "vuex"

export default Vue.extend({
  computed: {
    displayBTime: function() {
      //console.log("displayBTime")
      return this.displayTime(this.timeLimits['b'])
    },
    displayWTime: function() {
      return this.displayTime(this.timeLimits['w'])
    },
    turn: function() {
      return this.$store.state.clock.currentTurn
    },
    ...mapState("clock", [
      "enabled",
      //"currentTurn",
      "timeLimits",
      "pause",
    ]),
  },
  data() {
    return {
      performanceNow: undefined,
      requestID: undefined,
      subtotal: 0,
    }
  },
  mounted() {
    this.loop()
  },
  watch: {
    turn: function() {
      this.subtotal = 0
    },
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
      this.$store.commit("clock/emitChangeTurn", {
        nextTurn: nextTurn,
      })
    },
    loop() {
      //if (!this.requestID) {
        this.performanceNow = performance.now()
        this.requestID = requestAnimationFrame(this.step)
      //}
    },
    step(timestamp) {
      if (this.enabled && !this.pause) {
        this.subtotal += timestamp - this.performanceNow
        if (this.subtotal >= 100) {
          this.$store.commit("clock/decreaseTimeLimit", {
            diff: 100,
          })
          this.subtotal -= 100
        }
      }
      this.performanceNow = timestamp
      requestAnimationFrame(this.step)
    },
    togglePause() {
      if (this.pause) {
        this.$store.commit("clock/emitCancelPause")
      } else {
        this.$store.commit("clock/emitPause")
      }
    },
    reset(turn) {
      if (!this.enabled) {
        this.$store.commit("clock/enable")
      }
      this.$store.commit("clock/emitReset")
    },
  }
})
</script>
<style>
</style>
