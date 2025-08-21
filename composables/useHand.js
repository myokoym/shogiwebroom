// Hand用のComposable（Composition API）
import { useSfenStore } from '~/stores/sfen'
import { useOptionStore } from '~/stores/option'

export const useHand = (props) => {
  const sfenStore = useSfenStore()
  const optionStore = useOptionStore()
  
  // Computed
  const hands = computed(() => {
    if (props.turn === 'b') {
      return sfenStore.blackHands
    } else {
      return sfenStore.whiteHands
    }
  })
  
  const font = computed(() => optionStore.font)
  
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