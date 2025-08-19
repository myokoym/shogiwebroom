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
import { useSfenStore } from '~/stores'
import { useOptionStore } from '~/stores'
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
      sfenStore: null,
      optionStore: null,
    }
  },
  created() {
    // Initialize stores
    this.sfenStore = useSfenStore()
    this.optionStore = useOptionStore()
    
    // debug: console.log(this.$route.params.id)
    if (!this.$route.params.id) {
      this.$router.replace("/")
      return
    }
    this.sfenStore.setRoomId({roomId: this.$route.params.id})
    if (this.$route.query.audio == "1") {
      this.optionStore.setAudio(true)
    }
    if (this.$route.query.latestMark == "1") {
      this.optionStore.setLatestMark(true)
    }
    if (this.$route.query.boardGuide == "1") {
      this.optionStore.setBoardGuide(true)
    }
    if (this.$route.query.font) {
      this.optionStore.setFont(this.$route.query.font)
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