// Stock用のComposable（Composition API）
import { useSfenStore } from '~/stores/sfen'
import { useOptionStore } from '~/stores/option'

export const useStock = () => {
  const sfenStore = useSfenStore()
  const optionStore = useOptionStore()
  
  // Computed
  const stock = computed(() => sfenStore.stock)
  const font = computed(() => optionStore.font)
  
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