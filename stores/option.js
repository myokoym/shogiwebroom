// Option store for Pinia
import { defineStore } from 'pinia'

export const useOptionStore = defineStore('option', {
  state: () => ({
    isAudio: false,
    isLatestMark: false,
    isBoardGuide: false,
    font: 'mincho'
  }),

  getters: {
    audioEnabled: (state) => state.isAudio,
    latestMarkEnabled: (state) => state.isLatestMark,
    boardGuideEnabled: (state) => state.isBoardGuide,
    currentFont: (state) => state.font
  },

  actions: {
    setAudio(value) {
      this.isAudio = value
    },

    setLatestMark(value) {
      this.isLatestMark = value
    },

    setBoardGuide(value) {
      this.isBoardGuide = value
    },

    setFont(value) {
      const validFonts = ['mincho', 'gothic', 'pop', 'gyosho']
      if (validFonts.includes(value)) {
        this.font = value
      }
    },

    toggleAudio() {
      this.isAudio = !this.isAudio
    },

    toggleLatestMark() {
      this.isLatestMark = !this.isLatestMark
    },

    toggleBoardGuide() {
      this.isBoardGuide = !this.isBoardGuide
    },

    resetOptions() {
      this.isAudio = false
      this.isLatestMark = false
      this.isBoardGuide = false
      this.font = 'mincho'
    }
  }
})