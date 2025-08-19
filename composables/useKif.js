// Kif用のComposable（Composition API）
import { computed } from '@nuxt/bridge/dist/runtime'
import { useStore } from 'vuex'

export const useKif = () => {
  const store = useStore()
  
  // Computed
  const moves = computed(() => store.state.kif.moves)
  
  // Methods
  const piece2String = (piece) => {
    const pieceMap = {
      "K": "玉",
      "R": "飛",
      "+R": "龍",
      "B": "角",
      "+B": "馬",
      "G": "金",
      "S": "銀",
      "+S": "全",
      "N": "桂",
      "+N": "圭",
      "L": "香",
      "+L": "杏",
      "P": "歩",
      "+P": "と",
      "k": "玉",
      "r": "飛",
      "+r": "龍",
      "b": "角",
      "+b": "馬",
      "g": "金",
      "s": "銀",
      "+s": "全",
      "n": "桂",
      "+n": "圭",
      "l": "香",
      "+l": "杏",
      "p": "歩",
      "+p": "と",
    }
    
    return pieceMap[piece] || ""
  }
  
  const x2String = (x) => {
    return 9 - x
  }
  
  const y2String = (y) => {
    const codeOfOne = "一".charCodeAt(0)
    return String.fromCharCode(codeOfOne + y)
  }
  
  const turn2String = (piece) => {
    // 大文字なら先手、小文字なら後手
    if (piece === piece.toUpperCase()) {
      return "☗"
    } else {
      return "☖"
    }
  }
  
  return {
    moves,
    piece2String,
    x2String,
    y2String,
    turn2String
  }
}