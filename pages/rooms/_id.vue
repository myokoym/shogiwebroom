<template>
  <div class="container">
    <div>
      <input type="text" v-model="text">
      <button @click="send">送信</button>
      <nuxt-link to="/">戻る</nuxt-link>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client"
import Vue from "vue"

export default Vue.extend({
  data() {
    return {
      text: "",
      socket: undefined
    }
  },
  mounted: function() {
    this.socket = io()
    this.socket.on("update", (text) => {
      this.text = text
    })
    this.socket.emit("enterRoom", this.$route.params.id)
  },
  methods: {
    send() {
      this.socket.emit("send", {
        id: this.$route.params.id,
        text: this.text
      })
    }
  }
})
</script>