// Hand用のComposable（Composition API）
import { computed } from '@nuxt/bridge/dist/runtime'
import { useStore } from 'vuex'

export const useHand = (props) => {
  const store = useStore()
  
  // Computed
  const hands = computed(() => {
    if (props.turn === 'b') {
      return store.state.sfen.blackHands
    } else {
      return store.state.sfen.whiteHands
    }
  })
  
  const font = computed(() => store.state.option.font)
  
  // クラス名
  const klass = computed(() => {
    if (props.turn === 'b') {
      return 'blackHand'
    } else {
      return 'whiteHand'
    }
  })
  
  // Methods
  const turnString = (piece) => {
    if (props.turn === 'b') {
      return piece.toUpperCase()
    } else {
      return piece.toLowerCase()
    }
  }
  
  return {
    hands,
    font,
    klass,
    turnString,
  }
}