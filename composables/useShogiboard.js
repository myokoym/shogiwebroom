// Shogiboard用のComposable（Composition API）
import { computed, ref, onMounted, onBeforeUnmount } from '@nuxt/bridge/dist/runtime'
import { useSfenStore } from '~/stores/sfen'
import { useOptionStore } from '~/stores/option'

export const useShogiboard = () => {
  const sfenStore = useSfenStore()
  const optionStore = useOptionStore()
  
  // State
  const komaotoObj = ref(null)
  const beforeX = ref(-1)
  const beforeY = ref(-1)
  const dragFromHand = ref(false)
  const dragFromStock = ref(false)
  
  // Computed
  const rows = computed(() => sfenStore.rows)
  const font = computed(() => optionStore.font)
  const latestX = computed(() => sfenStore.latestX)
  const latestY = computed(() => sfenStore.latestY)
  const isLatestMark = computed(() => optionStore.enabledLatestMark)
  const isBoardGuide = computed(() => optionStore.enabledBoardGuide)
  const isAudio = computed(() => optionStore.enabledAudio)
  const roomId = computed(() => sfenStore.roomId)
  
  // Methods
  const boardGuideTop = (n, length) => {
    if (!isBoardGuide.value) {
      return
    }
    return length - n
  }
  
  const boardGuideRight = (n, length) => {
    if (!isBoardGuide.value) {
      return
    }
    const codeOfOne = "一".charCodeAt(0)
    return String.fromCharCode(codeOfOne + n - 1)
  }
  
  const isLatestCell = (x, y) => {
    if (!isLatestMark.value) {
      return false
    }
    return x === latestX.value && y === latestY.value
  }
  
  const isBeforeCell = (x, y) => {
    return x === beforeX.value && y === beforeY.value
  }
  
  const isBeforeHand = (turn, index) => {
    return dragFromHand.value && beforeX.value === turn && beforeY.value === index
  }
  
  const isBeforeStock = () => {
    return dragFromStock.value && beforeX.value === 0
  }
  
  const isSelectedPiece = (piece) => {
    return (dragFromHand.value || dragFromStock.value) && beforeY.value === piece
  }
  
  const moveCell = (x, y) => {
    // 駒音の再生
    playKomaoto()
    
    // 移動処理
    if (beforeX.value >= 0 && beforeY.value >= 0) {
      // 盤面から盤面
      store.commit("sfen/moveBoardToBoard", {
        beforeX: beforeX.value,
        beforeY: beforeY.value,
        afterX: x,
        afterY: y,
      })
      // 移動情報を送信
      const piece = rows.value[beforeY.value][beforeX.value]
      store.commit("kif/sendMove", {
        beforeX: beforeX.value,
        beforeY: beforeY.value,
        afterX: x,
        afterY: y,
        piece: piece,
      })
      beforeX.value = -1
      beforeY.value = -1
    } else if (dragFromHand.value) {
      // 手駒から盤面
      const turn = beforeX.value
      const piece = beforeY.value
      store.commit("sfen/moveHandToBoard", {
        beforeX: turn,
        beforeY: piece,
        afterX: x,
        afterY: y,
      })
      store.commit("kif/sendMove", {
        beforeX: turn,
        beforeY: piece,
        afterX: x,
        afterY: y,
        piece: piece,
      })
      beforeX.value = -1
      beforeY.value = -1
      dragFromHand.value = false
    } else if (dragFromStock.value) {
      // 駒台から盤面
      const piece = beforeY.value
      store.commit("sfen/moveStockToBoard", {
        piece: piece,
        afterX: x,
        afterY: y,
      })
      beforeX.value = -1
      beforeY.value = -1
      dragFromStock.value = false
    } else {
      // 駒を選択
      beforeX.value = x
      beforeY.value = y
    }
  }
  
  const moveToHand = (turn, piece) => {
    playKomaoto()
    
    if (beforeX.value >= 0 && beforeY.value >= 0) {
      // 盤面から手駒
      store.commit("sfen/moveBoardToHand", {
        beforeX: beforeX.value,
        beforeY: beforeY.value,
        afterX: turn,
        afterY: piece,
      })
      beforeX.value = -1
      beforeY.value = -1
    } else if (dragFromHand.value) {
      // 手駒から手駒
      const beforeTurn = beforeX.value
      const beforePiece = beforeY.value
      store.commit("sfen/moveHandToHand", {
        beforeX: beforeTurn,
        beforeY: beforePiece,
        afterX: turn,
        afterY: piece,
      })
      beforeX.value = -1
      beforeY.value = -1
      dragFromHand.value = false
    }
  }
  
  const moveFromHand = (turn, piece) => {
    playKomaoto()
    beforeX.value = turn
    beforeY.value = piece
    dragFromHand.value = true
  }
  
  const moveToStock = () => {
    playKomaoto()
    
    if (beforeX.value >= 0 && beforeY.value >= 0) {
      // 盤面から駒台
      store.commit("sfen/moveBoardToStock", {
        beforeX: beforeX.value,
        beforeY: beforeY.value,
      })
      beforeX.value = -1
      beforeY.value = -1
    }
  }
  
  const moveFromStock = (piece) => {
    playKomaoto()
    beforeX.value = 0
    beforeY.value = piece
    dragFromStock.value = true
  }
  
  const togglePromotedAndTurn = (x, y) => {
    store.commit("sfen/togglePromotedAndTurn", { x: x, y: y })
  }
  
  const dragCellStart = (x, y) => {
    beforeX.value = x
    beforeY.value = y
  }
  
  const dragHandStart = (turn, piece) => {
    beforeX.value = turn
    beforeY.value = piece
    dragFromHand.value = true
  }
  
  const dragStockStart = (piece) => {
    beforeX.value = 0
    beforeY.value = piece
    dragFromStock.value = true
  }
  
  const komaotoPath = () => {
    return "/audio/komaoto1.mp3"
  }
  
  const playKomaoto = () => {
    if (!isAudio.value) {
      return
    }
    if (!komaotoObj.value) {
      return
    }
    komaotoObj.value.play()
  }
  
  // Lifecycle
  onMounted(() => {
    if (isAudio.value) {
      komaotoObj.value = new Audio(komaotoPath())
    }
  })
  
  return {
    // State
    komaotoObj,
    beforeX,
    beforeY,
    dragFromHand,
    dragFromStock,
    
    // Computed
    rows,
    font,
    latestX,
    latestY,
    isLatestMark,
    isBoardGuide,
    isAudio,
    roomId,
    
    // Methods
    boardGuideTop,
    boardGuideRight,
    isLatestCell,
    isBeforeCell,
    isBeforeHand,
    isBeforeStock,
    isSelectedPiece,
    moveCell,
    moveToHand,
    moveFromHand,
    moveToStock,
    moveFromStock,
    togglePromotedAndTurn,
    dragCellStart,
    dragHandStart,
    dragStockStart,
    komaotoPath,
    playKomaoto,
  }
}