<template>
  <div class="m-4">
    <div class="mt-2 kif-moves">
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
        class="btn btn-light btn-sm"
        v-on:click="copy()"
      >コピー</button>
    </div>
    <div>
      <small>（※棋譜は保存されません。ページ再読み込みで消去されます。）</small>
    </div>
  </div>
</template>
<script>
import Vue from "vue"
import { mapState } from "vuex"
import VueClipboard from "vue-clipboard2"
Vue.use(VueClipboard)

export default Vue.extend({
  computed: {
    ...mapState("kif", {
      kifs: "kifs",
      ki2s: "ki2s",
    })
  },
  mounted() {
  },
  data() {
    return {
      tab: "ki2",
    }
  },
  methods: {
    selectKi2() {
      this.tab = "ki2"
    },
    selectKif() {
      this.tab = "kif"
    },
    copy() {
      let lines = []
      if (this.tab === "ki2") {
        let line = ""
        this.ki2s.forEach(function(k, i) {
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
        this.kifs.forEach(function(k, i) {
          let line = ""
          line += (i + 1)
          line += " "
          line += k
          lines.push(line)
        })
      }
      this.$copyText(lines.join("\n"))
    },
  }
})
</script>
<style>
.kif-moves {
  max-height: 320px;
  overflow-y: scroll;
}
</style>
