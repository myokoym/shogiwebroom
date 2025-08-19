// Chat store for Pinia
import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    name: '',
    comment: '',
    comments: []
  }),

  getters: {
    hasComments: (state) => state.comments.length > 0,
    latestComment: (state) => state.comments[state.comments.length - 1] || null,
    commentCount: (state) => state.comments.length
  },

  actions: {
    setName(name) {
      this.name = name
    },

    setComment(comment) {
      this.comment = comment
    },

    sendComment(payload) {
      if (payload) {
        this.name = payload.name || this.name
        this.comment = payload.comment || this.comment
      }
      // Socket.IOへの送信はプラグインで処理
    },

    receiveComment(payload) {
      this.comments.push({
        time: payload.time,
        name: payload.name,
        comment: payload.comment
      })
      
      // コメント数の上限を設定（100件まで）
      if (this.comments.length > 100) {
        this.comments.shift()
      }
    },

    clearComments() {
      this.comments = []
    },

    clearInput() {
      this.comment = ''
    }
  }
})