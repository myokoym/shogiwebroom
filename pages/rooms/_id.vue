<template>
  <div class="container">
    <div>
      <Shogiboard
        v-model="text"
        v-on:send="send"
        v-on:updateText="updateText"
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
      text: "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL",
      socket: undefined
    }
  },
  mounted: function() {
    this.socket = io()
    this.socket.on("update", (text) => {
      console.log("update: " + text)
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
    },
    updateText(text) {
      console.log("updateText: " + text)
      this.text = text
    },
  }
})
</script>
<style>
body {
  background-color: #b9d08b;
}
.container {
  max-width: 640px;
}
</style>