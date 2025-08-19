// Option用のComposable（Composition API）
import { computed, watch } from '@nuxt/bridge/dist/runtime'
import { useStore } from 'vuex'

export const useOption = () => {
  const store = useStore()
  
  // Computed with setter
  const audio = computed({
    get: () => store.state.option.isAudio,
    set: (value) => store.commit('option/setAudio', value)
  })
  
  const latestMark = computed({
    get: () => store.state.option.isLatestMark,
    set: (value) => store.commit('option/setLatestMark', value)
  })
  
  const boardGuide = computed({
    get: () => store.state.option.isBoardGuide,
    set: (value) => store.commit('option/setBoardGuide', value)
  })
  
  const font = computed({
    get: () => store.state.option.font,
    set: (value) => store.commit('option/setFont', value)
  })
  
  // Methods
  const reverse = () => {
    store.commit('sfen/reverse')
  }
  
  const init = () => {
    store.commit('sfen/init')
  }
  
  const prevHistory = () => {
    store.commit('sfen/prevHistory')
  }
  
  const nextHistory = () => {
    store.commit('sfen/nextHistory')
  }
  
  const getText = () => {
    return store.state.sfen.text
  }
  
  const setText = (text) => {
    store.commit('sfen/setText', { text })
  }
  
  return {
    audio,
    latestMark,
    boardGuide,
    font,
    reverse,
    init,
    prevHistory,
    nextHistory,
    getText,
    setText
  }
}