// Chat store for Pinia
import { defineStore } from 'pinia'

interface Comment {
  time: string
  name: string
  comment: string
}

interface ChatState {
  name: string
  comment: string
  comments: Comment[]
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
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
    setName(name: string) {
      this.name = name
    },

    setComment(comment: string) {
      this.comment = comment
    },

    sendComment(payload?: { name?: string; comment?: string }) {
      if (payload) {
        this.name = payload.name || this.name
        this.comment = payload.comment || this.comment
      }
      // Socket.IOへの送信はVuexプラグインで処理
    },

    receiveComment(payload: { time: string; name: string; comment: string }) {
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