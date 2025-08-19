// Piece用のComposable（Composition API）
import { computed } from '@nuxt/bridge/dist/runtime'

export const usePiece = (props) => {
  // 駒の文字を取得
  const text = computed(() => {
    if (!props.piece) {
      return ""
    }
    
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
    
    return pieceMap[props.piece] || ""
  })
  
  // 駒の向き（CSSクラス）
  const klass = computed(() => {
    if (!props.piece) {
      return ""
    }
    
    // 小文字は後手（180度回転）
    if (props.piece === props.piece.toLowerCase()) {
      return "turnBlack"
    }
    
    return ""
  })
  
  // フォントクラス
  const fontClass = computed(() => {
    const fontMap = {
      "mincho": "pieceMincho",
      "gothic": "pieceGothic",
      "pop": "piecePop",
      "gyosho": "pieceGyosho",
    }
    
    return fontMap[props.font] || ""
  })
  
  // 駒のサイズクラス
  const sizeClass = computed(() => {
    if (props.type === "board") {
      return "pieceOnBoard"
    } else if (props.type === "hand") {
      return "pieceOnHand"
    } else if (props.type === "stock") {
      return "pieceOnStock"
    }
    return ""
  })
  
  return {
    text,
    klass,
    fontClass,
    sizeClass,
  }
}