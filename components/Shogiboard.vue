<template>
  <div>
    <input
      type="text"
      v-bind:value="value"
      v-on:input="$emit('input', $event.target.value)"
    >
    <button v-on:click="$emit('send')">送信</button>
  </div>
</template>
<script>
import Vue from "vue"

export default Vue.extend({
  props: {
    value: String,
    send: Function,
  },
  data() {
    return {
    }
  },
  methods: {
  }
})
</script>
<style>
</style>
