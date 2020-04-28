<template>
  <div class="container">
    <div>
      <label for="roomId">ルームID（空欄の場合は自動生成）:</label>
      <input type="text" id="roomId" v-model="roomId">
      <button @click="enterRoom">ルーム入室</button>
    </div>
  </div>
</template>

<script>
import Vue from "vue"
import cryptoRandomString from "crypto-random-string"

export default Vue.extend({
  data() {
    return {
      roomId: "",
    }
  },
  methods: {
    enterRoom() {
      if (!this.roomId) {
        this.roomId = cryptoRandomString({length: 8})
      }
      this.$router.push("/rooms/" + this.roomId)
    }
  }
})
</script>