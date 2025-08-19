<template>
  <div class="m-4 chat">
    <div class="input-group input-group-sm">
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
    <div v-if="comments.length > 0" class="mt-2 chat-comments">
      <ul class="list-group">
        <li class="list-group-item" v-for="c in comments">
          <span class="font-weight-bold">{{c.name}}</span>
          <span><small class="text-muted">{{c.time}}</small></span>
          <span>{{c.comment}}</span>
        </li>
      </ul>
    </div>
    <small>（※チャット内容は保存されません。ページ再読み込みで消去されます。）</small>
    <div class="chat-name mt-2 input-group input-group-sm">
      <div class="input-group-prepend">
        <span class="input-group-text">表示名（任意）</span>
      </div>
      <input type="text" v-model="name" class="form-control" id="name">
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useChatStore } from '~/stores'

// Data
const chatStore = useChatStore()
const name = ref("")
const comment = ref("")

// Computed
const comments = computed(() => {
  return chatStore.comments || []
})

// Methods
const submit = () => {
  chatStore.sendComment({
    name: name.value,
    comment: comment.value,
  })
  comment.value = ""
}
</script>
<style>
.chat-name {
  width: 240px;
}
.chat-comments {
  max-height: 360px;
  overflow-y: scroll;
}
</style>
