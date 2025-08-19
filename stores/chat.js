// Chat store for Pinia (JavaScript version)
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
    },

    receiveComment(payload) {
      this.comments.push({
        time: payload.time,
        name: payload.name,
        comment: payload.comment
      })
      
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