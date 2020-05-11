<template>
  <div class="m-4 chat">
    <h5>
      簡易チャット
    </h5>
    <div class="row">
      <div class="chat-name col-sm-3 col-4 input-group input-group-sm">
        <div class="input-group-prepend">
          <span class="input-group-text">名前</span>
        </div>
        <input type="text" v-model="name" class="form-control" id="name">
      </div>
      <div class="chat-comment col-sm-9 col-8 input-group input-group-sm">
        <div class="input-group-prepend">
          <span class="input-group-text">コメント</span>
        </div>
        <input
          type="text"
          v-model="comment"
          v-on:keyup.ctrl.enter="submit"
          class="form-control"
          placeholder="Ctrl+Enterで送信"
          id="comment">
        <button
          type="submit"
          class="btn btn-light btn-sm"
          v-on:click="submit"
        >送信</button>
      </div>
    </div>
    <div v-if="comments.length > 0" class="mt-2 chat-comments">
      <ul class="list-group">
        <li class="list-group-item" v-for="c in comments">
          <span class="font-weight-bold">{{c.name}}</span>
          <span><small class="text-muted">{{c.time}}</small></span>
          <span>{{c.comment}}</span>
        </li>
      </ul>
    </div>
    <small>（※保存されません。ページ再読み込みで消去されます。）</small>
  </div>
</template>
<script>
import Vue from "vue"
import { mapState } from "vuex"

export default Vue.extend({
  computed: {
    ...mapState("chat", {
      comments: "comments",
    })
  },
  mounted() {
  },
  data() {
    return {
      name: "",
      comment: "",
    }
  },
  methods: {
    submit() {
      this.$store.commit("chat/sendComment", {
        name: this.name,
        comment: this.comment,
      })
      this.comment = ""
    },
  }
})
</script>
<style>
.chat-name {
  min-width: 135px;
}
.chat-comment {
  min-width: 320px;
}
.chat-comments {
  max-height: 640px;
  overflow-y: scroll;
}
</style>
