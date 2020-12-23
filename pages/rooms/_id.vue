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
      <hr>
      <Kif
      ></Kif>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client"
import Vue from "vue"
import Shogiboard from '~/components/Shogiboard.vue'
import Chat from '~/components/Chat.vue'
import Kif from '~/components/Kif.vue'

export default Vue.extend({
  components: {
    Shogiboard,
    Chat,
    Kif,
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
    if (this.$route.query.audio == "1") {
      this.$store.commit("option/setAudio", true)
    }
    if (this.$route.query.latestMark == "1") {
      this.$store.commit("option/setLatestMark", true)
    }
    if (this.$route.query.boardGuide == "1") {
      this.$store.commit("option/setBoardGuide", true)
    }
    if (this.$route.query.font) {
      this.$store.commit("option/setFont", this.$route.query.font)
    }
  },
})
</script>
<style>
body {
  background-color: #b9d08b;
}
.container {
  max-width: 666px;
}
</style>