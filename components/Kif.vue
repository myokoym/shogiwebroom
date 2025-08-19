<template>
  <div class="m-4">
    棋譜機能（開発中）
    <div id="kif-list" class="mt-2 kif-moves">
      <ul v-if="tab === 'ki2'" class="list-group">
        <li class="list-group-item" v-for="(k, i) in ki2s">
          <span><small>{{i + 1}}</small></span>
          <span>{{k}}</span>
        </li>
      </ul>
      <ul v-if="tab === 'kif'" class="list-group">
        <li class="list-group-item" v-for="(k, i) in kifs">
          <span><small>{{i + 1}}</small></span>
          <span>{{k}}</span>
        </li>
      </ul>
    </div>
    <div class="d-flex justify-content-between">
      <div class="btn-group">
        <button
          type="button"
          class="btn btn-sm"
          v-on:click="selectKi2()"
          v-bind:class="{
            'btn-dark': tab === 'ki2',
            'btn-light': tab !== 'ki2',
          }"
        >KI2形式</button>
        <button
          type="button"
          class="btn btn-sm"
          v-on:click="selectKif()"
          v-bind:class="{
            'btn-dark': tab === 'kif',
            'btn-light': tab !== 'kif',
          }"
        >KIF形式</button>
      </div>
      <button
        type="button"
        class="btn btn-sm"
        v-on:click="kifStore.togglePause()"
        v-bind:class="{
          'btn-dark': pause,
          'btn-light': !pause,
        }"
      >一時停止{{pause ? "中" : ""}}</button>
      <button
        type="button"
        class="btn btn-light btn-sm"
        v-on:click="copy()"
      >コピー</button>
    </div>
    <div>
      <small>（※棋譜は保存されません。ページ再読み込みで消去されます。）</small>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, getCurrentInstance } from 'vue'
import { useKifStore } from '~/stores'
import VueClipboard from "vue-clipboard2"

// Get the current instance to access $copyText
const instance = getCurrentInstance()

// Data
const kifStore = useKifStore()
const tab = ref("ki2")

// Computed
const kifs = computed(() => kifStore.kifs || [])
const ki2s = computed(() => kifStore.ki2s || [])
const pause = computed(() => kifStore.pause || false)

// Watch
watch(ki2s, () => {
  setTimeout(() => {
    let obj = document.getElementById("kif-list")
    if (obj) {
      obj.scrollTop = obj.scrollHeight
    }
  })
})

// Methods
const selectKi2 = () => {
  tab.value = "ki2"
}

const selectKif = () => {
  tab.value = "kif"
}

const copy = () => {
  let lines = []
  if (tab.value === "ki2") {
    let line = ""
    ki2s.value.forEach((k, i) => {
      if ((i + 1) % 2 === 0) {
        line += "    "
        line += k
        lines.push(line)
        line = ""
      } else {
        line += k
      }
    })
  } else {
    kifs.value.forEach((k, i) => {
      let line = ""
      line += (i + 1)
      line += " "
      line += k
      lines.push(line)
    })
  }
  instance.proxy.$copyText(lines.join("\n"))
}
</script>
<style>
.kif-moves {
  max-height: 320px;
  overflow-y: scroll;
}
</style>
