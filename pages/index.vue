<template>
  <div class="container d-flex flex-row justify-content-center">
    <div class="d-flex flex-column">
      <div>
        <h1>
          <img
            class="title-logo"
            src="@/assets/images/logo.png"
            alt="将棋ウェブルーム"
          >
        </h1>
      </div>
      <div class="row">
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text" id="roomId">ルームID</span>
          </div>
          <input
            type="text"
            class="form-control"
            aria-describedby="roomId"
            v-model="roomId"
          >
          <button
            type="button"
            class="btn btn-light btn-sm"
            @click="generateId"
          >自動生成</button>
        </div>
      </div>
      <div>
      <Option
        :hideClock="true"
        :hideStock="true"
      ></Option>
      </div>
      <div class="row">
        <div class="input-group input-group-sm">
          <div class="input-group-prepend">
            <span class="input-group-text" id="roomUrl">URL</span>
          </div>
          <input
            type="text"
            class="form-control"
            aria-describedby="roomUrl"
            v-model="roomUrl"
            readonly
          >
          <button
            type="button"
            class="btn btn-light btn-sm"
            v-clipboard:copy="this.roomUrl"
            v-bind:disabled="!this.roomId"
          >コピー</button>
        </div>
      </div>
      <div class="row">
        <button
          type="button"
          class="btn btn-success btn-lg btn-block"
          @click="enterRoom"
          v-bind:disabled="!this.roomId"
        >入室</button>
      </div>
      <hr>
      <Usage></Usage>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOptionStore } from '~/stores'
import cryptoRandomString from "crypto-random-string"
import VueClipboard from "vue-clipboard2"
import Option from '~/components/Option.vue'
import Usage from '~/components/Usage.vue'

// Get router
const router = useRouter()

// Data
const optionStore = useOptionStore()
const origin = ref("")
const roomId = ref("")

// Computed
const roomPath = computed(() => {
  return "/rooms/" + roomId.value
})

const enabledGameMode = computed(() => optionStore.enabledGameMode || false)
const enabledAudio = computed(() => optionStore.enabledAudio || false)
const enabledLatestMark = computed(() => optionStore.enabledLatestMark || false)
const enabledBoardGuide = computed(() => optionStore.enabledBoardGuide || false)
const font = computed(() => optionStore.font || 'kirieji')

const roomOptions = computed(() => {
  let params = []
  if (enabledGameMode.value) {
    params.push("gameMode=1")
  }
  if (enabledLatestMark.value) {
    params.push("latestMark=1")
  }
  if (enabledBoardGuide.value) {
    params.push("boardGuide=1")
  }
  if (enabledAudio.value) {
    params.push("audio=1")
  }
  if (font.value !== "kirieji") {
    params.push("font=" + font.value)
  }
  let paramText = ""
  if (params.length) {
    paramText += "?"
    paramText += params.join("&")
  }
  return paramText
})

const roomUrl = computed(() => {
  if (!roomId.value) {
    return
  }
  return origin.value + roomPath.value + roomOptions.value
})

// Mounted
onMounted(() => {
  origin.value = location.origin
})

// Methods
const generateId = () => {
  roomId.value = cryptoRandomString({length: 16})
}

const enterRoom = () => {
  if (!roomId.value) {
    return
  }
  router.push(roomPath.value)
}
</script>
<style>
body {
  background-color: #b9d08b;
}
.container {
  max-width: 768px;
}
img.title-logo {
  max-width: 100%;
  height: auto;
}
.row {
  margin: 2%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>