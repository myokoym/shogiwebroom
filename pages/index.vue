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

<script>
import Vue from "vue"
import { mapState } from "vuex"
import cryptoRandomString from "crypto-random-string"
import VueClipboard from "vue-clipboard2"
Vue.use(VueClipboard)
import Option from '~/components/Option.vue'
import Usage from '~/components/Usage.vue'

export default Vue.extend({
  components: {
    Option,
    Usage,
  },
  data() {
    return {
      origin: "",
      roomId: "",
    }
  },
  mounted() {
    this.origin = location.origin
  },
  computed: {
    roomPath: function() {
      return "/rooms/" + this.roomId
    },
    ...mapState("option", {
      enabledGameMode: "enabledGameMode",
      enabledAudio: "enabledAudio",
      enabledLatestMark: "enabledLatestMark",
      enabledBoardGuide: "enabledBoardGuide",
      font: "font",
    }),
    roomOptions: function() {
      let params = []
      if (this.enabledGameMode) {
        params.push("gameMode=1")
      }
      if (this.enabledLatestMark) {
        params.push("latestMark=1")
      }
      if (this.enabledBoardGuide) {
        params.push("boardGuide=1")
      }
      if (this.enabledAudio) {
        params.push("audio=1")
      }
      if (this.font !== "kirieji") {
        params.push("font=" + this.font)
      }
      let paramText = ""
      if (params.length) {
        paramText += "?"
        paramText += params.join("&")
      }
      return paramText
    },
    roomUrl: function() {
      if (!this.roomId) {
        return
      }
      return this.origin + this.roomPath + this.roomOptions
    },
  },
  methods: {
    generateId() {
      this.roomId = cryptoRandomString({length: 16})
    },
    enterRoom() {
      if (!this.roomId) {
        return
      }
      this.$router.push(this.roomPath)
    },
  }
})
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