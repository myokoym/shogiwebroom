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

<script setup>
import { onMounted } from 'vue'
import io from "socket.io-client"
import { useSfenStore } from '~/stores'
import { useOptionStore } from '~/stores'
import Shogiboard from '~/components/Shogiboard.vue'
import Chat from '~/components/Chat.vue'
import Kif from '~/components/Kif.vue'

// Get route and router (Nuxt provides these directly)
const route = useRoute()
const router = useRouter()

// Data
const sfenStore = useSfenStore()
const optionStore = useOptionStore()

// Created lifecycle (using onMounted as closest equivalent)
onMounted(() => {
  // debug: console.log(route.params.id)
  if (!route.params.id) {
    router.replace("/")
    return
  }
  sfenStore.setRoomId({roomId: route.params.id})
  if (route.query.audio == "1") {
    optionStore.setAudio(true)
  }
  if (route.query.latestMark == "1") {
    optionStore.setLatestMark(true)
  }
  if (route.query.boardGuide == "1") {
    optionStore.setBoardGuide(true)
  }
  if (route.query.font) {
    optionStore.setFont(route.query.font)
  }
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