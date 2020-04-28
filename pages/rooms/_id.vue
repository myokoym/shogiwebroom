<template>
  <div class="container">
    <div>
      <Shogiboard
        v-model="text"
        v-on:send="send"
      ></Shogiboard>
    </div>
    <div>
      <nuxt-link to="/">戻る</nuxt-link>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client"
import Vue from "vue"
import Shogiboard from '~/components/Shogiboard.vue'

export default Vue.extend({
  components: {
    Shogiboard
  },
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
      console.log("send(): text: " + this.text)
      this.socket.emit("send", {
        id: this.$route.params.id,
        text: this.text
      })
    }
  }
})
</script>