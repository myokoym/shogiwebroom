<template>
  <div class="row">
    <div class="col-xl-8 container">
      <Shogiboard
        class=""
      ></Shogiboard>
    </div>
    <div class="col-xl-4">
      <Chat
      ></Chat>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client"
import Vue from "vue"
import Shogiboard from '~/components/Shogiboard.vue'
import Chat from '~/components/Chat.vue'

export default Vue.extend({
  components: {
    Shogiboard,
    Chat,
  },
  data() {
    return {
    }
  },
  created() {
    // debug: console.log(this.$route.params.id)
    if (!this.$route.params.id) {
      this.$router.replace("/")
      return
    }
    this.$store.commit("sfen/setRoomId", {roomId: this.$route.params.id})
    // debug: console.log(this.$store.state.sfen.roomId)
  },
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