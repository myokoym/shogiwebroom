// Option用のComposable（Composition API）
import { computed, watch } from '@nuxt/bridge/dist/runtime'
import { useOptionStore } from '~/stores/option'
import { useSfenStore } from '~/stores/sfen'

export const useOption = () => {
  const optionStore = useOptionStore()
  const sfenStore = useSfenStore()
  
  // Computed with setter
  const audio = computed({
    get: () => optionStore.enabledAudio,
    set: (value) => optionStore.setAudio(value)
  })
  
  const latestMark = computed({
    get: () => optionStore.enabledLatestMark,
    set: (value) => optionStore.setLatestMark(value)
  })
  
  const boardGuide = computed({
    get: () => optionStore.enabledBoardGuide,
    set: (value) => optionStore.setBoardGuide(value)
  })
  
  const font = computed({
    get: () => optionStore.font,
    set: (value) => optionStore.setFont(value)
  })
  
  // Methods
  const reverse = () => {
    sfenStore.reverse()
  }
  
  const init = () => {
    sfenStore.init()
  }
  
  const prevHistory = () => {
    sfenStore.prevHistory()
  }
  
  const nextHistory = () => {
    sfenStore.nextHistory()
  }
  
  const getText = () => {
    return sfenStore.text
  }
  
  const setText = (text) => {
    sfenStore.setText({ text })
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