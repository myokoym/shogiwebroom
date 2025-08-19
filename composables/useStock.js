// Stock用のComposable（Composition API）
import { computed } from '@nuxt/bridge/dist/runtime'
import { useStore } from 'vuex'

export const useStock = () => {
  const store = useStore()
  
  // Computed
  const stock = computed(() => store.state.sfen.stock)
  const font = computed(() => store.state.option.font)
  
  // Methods
  const moveToStock = () => {
    // Shogiboardから呼ばれる
    // 実際の処理はuseShogiboardで実装
  }
  
  const moveFromStock = (piece) => {
    // Shogiboardから呼ばれる
    // 実際の処理はuseShogiboardで実装
  }
  
  const dragStockStart = (piece) => {
    // ドラッグ開始の処理
    // 実際の処理はuseShogiboardで実装
  }
  
  const isBeforeStock = () => {
    // 選択状態の判定
    // 実際の処理はuseShogiboardで実装
    return false
  }
  
  const isSelectedPiece = (piece) => {
    // 選択された駒の判定
    // 実際の処理はuseShogiboardで実装
    return false
  }
  
  return {
    stock,
    font,
    moveToStock,
    moveFromStock,
    dragStockStart,
    isBeforeStock,
    isSelectedPiece,
  }
}