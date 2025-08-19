// Option store for Pinia
import { defineStore } from 'pinia'

type FontType = 'mincho' | 'gothic' | 'pop' | 'gyosho'

interface OptionState {
  isAudio: boolean
  isLatestMark: boolean
  isBoardGuide: boolean
  font: FontType
}

export const useOptionStore = defineStore('option', {
  state: (): OptionState => ({
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
    setAudio(value: boolean) {
      this.isAudio = value
    },

    setLatestMark(value: boolean) {
      this.isLatestMark = value
    },

    setBoardGuide(value: boolean) {
      this.isBoardGuide = value
    },

    setFont(value: FontType | string) {
      const validFonts: FontType[] = ['mincho', 'gothic', 'pop', 'gyosho']
      if (validFonts.includes(value as FontType)) {
        this.font = value as FontType
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