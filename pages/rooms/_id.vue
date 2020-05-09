<template>
  <div class="container">
    <Shogiboard
    ></Shogiboard>
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
    }
  },
  created() {
    this.$store.commit("sfen/setRoomId", {roomId: this.$route.params.id})
    console.log(this.$store.state.sfen.roomId)
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