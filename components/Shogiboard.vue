<template>
  <div>
    <div class="d-md-flex justify-content-around">
      <Hand
        turn="w"
        v-bind:font="font"
        v-bind:move-from-hand="moveFromHand"
        v-bind:move-to-hand="moveToHand"
        v-bind:is-before-hand="isBeforeHand"
        v-bind:is-selected-piece="isSelectedPiece"
      ></Hand>
      <div class="my-2 pl-3 pb-2 boardOutside">
        <table
          class="board"
          border="1"
        >
          <tr>
            <td
              class="boardGuide boardGuideTop"
              v-for="(cell, x) in rows[0]"
            >{{boardGuideTop(x + 1, rows[0].length + 1)}}</td>
          </tr>
          <tr v-for="(row, y) in rows">
            <td
              v-for="(cell, x) in row"
              v-on:click="moveCell(x, y)"
              v-on:click.right.prevent="togglePromotedAndTurn(x, y)"
              v-bind:class="{
                latestCell: isLatestCell(x, y),
                beforeCell: isBeforeCell(x, y),
              }"
              draggable
              v-on:dragstart="dragCellStart(x, y)"
              v-on:drop.prevent="moveCell(x, y)"
              v-on:dragover.prevent
            >
              <Piece
                type="board"
                v-bind:piece="cell"
                v-bind:font="font"
              ></Piece>
            </td>
            <td
              class="boardGuide boardGuideRight"
            >{{boardGuideRight(y + 1, row.length + 1)}}</td>
          </tr>
        </table>
      </div>
      <Hand
        turn="b"
        v-bind:font="font"
        v-bind:move-from-hand="moveFromHand"
        v-bind:move-to-hand="moveToHand"
        v-bind:is-before-hand="isBeforeHand"
        v-bind:is-selected-piece="isSelectedPiece"
      ></Hand>
    </div>
    <div v-if="showStock" class="my-2">
      <Stock
        turn="b"
        v-bind:font="font"
        v-bind:move-from-hand="moveFromStock"
        v-bind:move-to-hand="moveToStock"
        v-bind:is-before-hand="isBeforeStock"
        v-bind:is-selected-piece="isSelectedPiece"
      ></Stock>
    </div>
    <div class="m-1">
      <button
        type="button"
        class="btn btn-light btn-sm btn-block"
        v-on:click="togglePromotedAndTurnOnButton()"
        v-bind:disabled="beforeX === undefined"
      >成る/駒反転（右クリックでも可）</button>
    </div>
    <div v-if="showClock" class="my-2 embed-responsive embed-responsive-21by9">
      <iframe class="embed-responsive-item" v-bind:src="'https://webchessclock.herokuapp.com/rooms/' + roomId"></iframe>
    </div>
    <div class="m-1 d-flex justify-content-between align-items-center">
      <button
        type="button"
        class="btn btn-sm"
        v-on:click="reverseBoard()"
        v-bind:class="{
          'btn-dark': reversed,
          'btn-light': !reversed
        }"
      >盤反転{{reversed ? "中" : ""}}</button>
      <div class="btn-group">
        <div class="btn-group">
          <button
            type="button"
            class="btn btn-light btn-sm"
            v-on:click="sfenStore.prevHistory()"
            v-bind:disabled="historyCursor >= history.length - 1"
          >一手戻る</button>
          <button
            type="button"
            class="btn btn-light btn-sm"
            v-on:click="sfenStore.nextHistory()"
            v-bind:disabled="historyCursor <= 0"
          >一手進む</button>
        </div>
      </div>
    </div>
    <Option></Option>
    <div class="mt-3 input-group input-group-sm">
      <div class="input-group-prepend">
        <span class="input-group-text" id="sfen-label">SFEN</span>
      </div>
      <input
        type="text"
        class="form-control"
        aria-describedby="sfen-label"
        v-bind:value="text"
        v-on:input="sfenStore.setText({text: $event.target.value})"
      >
      <button
        type="button"
        class="btn btn-light btn-sm"
        v-clipboard:copy="text"
      >コピー</button>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch, getCurrentInstance } from 'vue'
import { useSfenStore } from '~/stores'
import { useKifStore } from '~/stores'
import { useOptionStore } from '~/stores'
import Piece from '~/components/Piece.vue'
import Hand from '~/components/Hand.vue'
import Stock from '~/components/Stock.vue'
import Option from '~/components/Option.vue'
import VueClipboard from "vue-clipboard2"

// Get the current instance to access $bvModal
const instance = getCurrentInstance()

// Data
const sfenStore = useSfenStore()
const kifStore = useKifStore()
const optionStore = useOptionStore()
const filledBHands = ref([])
const filledWHands = ref([])
const beforeX = ref(undefined)
const beforeY = ref(undefined)
const beforeHand = ref(undefined)
const beforeStock = ref(undefined)
const komaotoName = ref("komaoto1")
const komaotoObj = ref(undefined)

// Computed
const reversedSfen = computed(() => {
  return sfenStore.reversedSfen || ''
})

// SFEN store computed properties
const roomId = computed(() => sfenStore.roomId || '')
const text = computed(() => sfenStore.text || '')
const reversed = computed(() => sfenStore.reversed || false)
const rows = computed(() => sfenStore.rows || [])
const hands = computed(() => sfenStore.hands || {})
const latestCellX = computed(() => sfenStore.latestX || -1)
const latestCellY = computed(() => sfenStore.latestY || -1)
const history = computed(() => sfenStore.history || [])
const historyCursor = computed(() => sfenStore.historyIndex || -1)

// KIF store computed properties
const moves = computed(() => kifStore.moves || [])
const kifs = computed(() => kifStore.kifs || [])
const ki2s = computed(() => kifStore.ki2s || [])
const xChars = computed(() => kifStore.xChars || [])
const yChars = computed(() => kifStore.yChars || [])

// Option store computed properties
const enabledGameMode = computed(() => optionStore.enabledGameMode || false)
const enabledAudio = computed(() => optionStore.enabledAudio || false)
const enabledLatestMark = computed(() => optionStore.enabledLatestMark || false)
const enabledBoardGuide = computed(() => optionStore.enabledBoardGuide || false)
const showStock = computed(() => optionStore.showStock || false)
const showClock = computed(() => optionStore.showClock || false)
const font = computed(() => optionStore.font || 'kirieji')

// Mounted
onMounted(() => {
  sfenStore.init()
  komaotoObj.value = new Audio(komaotoPath())
  // debug: console.log("this.text: " + text.value)
  // debug: console.log("this.text: " + sfenStore.text)
})

// Watch
watch(text, () => {
  if (enabledAudio.value) {
    komaotoObj.value.play();
  }
})

// Methods
const komaotoPath = () => {
  return require("@/assets/audio/" + komaotoName.value + ".mp3")
}

const boardGuideTop = (x, max) => {
  if (!enabledBoardGuide.value) {
    return "　"
  }
  if (!max) {
    max = 10
  }
  if (!reversed.value) {
    x = max - x
  }
  return xChars.value[x]
}

const boardGuideRight = (y, max) => {
  if (!enabledBoardGuide.value) {
    return "　"
  }
  if (!max) {
    max = 10
  }
  if (reversed.value) {
    y = max - y
  }
  return yChars.value[y]
}

const isLatestCell = (x, y) => {
  if (!enabledLatestMark.value) {
    return false
  }
  return latestCellX.value == x && latestCellY.value == y
}

const isBeforeCell = (x, y) => {
  return beforeX.value === x && beforeY.value === y
}

const isBeforeHand = (piece) => {
  return beforeHand.value === piece
}

const isBeforeStock = (piece) => {
  // debug: console.log(beforeStock.value)
  // debug: console.log(piece)
  return beforeStock.value === piece
}

const isSelectedPiece = () => {
  return beforeX.value !== undefined ||
         beforeHand.value !== undefined ||
         beforeStock.value !== undefined
}

const reverseBoard = () => {
  sfenStore.reverse()
}

const moveFromHand = (piece) => {
  // debug: console.log("moveFromHand: " + piece)
  if (piece === ".") {
    return
  }
  beforeX.value = undefined
  beforeY.value = undefined
  if (beforeHand.value === piece) {
    beforeHand.value = undefined
  } else {
    beforeHand.value = piece
  }
}

const moveFromStock = (piece) => {
  // debug: console.log("moveFromStock: " + piece)
  if (piece === ".") {
    return
  }
  beforeX.value = undefined
  beforeY.value = undefined
  if (beforeStock.value === piece) {
    beforeStock.value = undefined
  } else {
    beforeStock.value = piece
  }
}

const moveToHand = (turn) => {
  // debug: console.log("moveToHand: " + turn)
  if (beforeX.value === undefined &&
      beforeHand.value === undefined) {
    return
  }
  if (beforeX.value !== undefined) {
    sfenStore.moveBoardToHand({
      beforeX: beforeX.value,
      beforeY: beforeY.value,
      turn: turn,
    })
    beforeX.value = undefined
    beforeY.value = undefined
  } else if (beforeHand.value) {
    if ((beforeHand.value.match(/[A-Z]/) && turn === "b") ||
        (beforeHand.value.match(/[a-z]/) && turn === "w")) {
      beforeHand.value = undefined
      return
    }
    sfenStore.moveHandToHand({
      beforeHand: beforeHand.value,
      turn: turn,
    })
    beforeHand.value = undefined
  }
}

const moveToStock = (turn) => {
  // debug: console.log("moveToHand: " + turn)
  if (beforeX.value === undefined &&
      beforeStock.value === undefined) {
    return
  }
  if (beforeX.value !== undefined) {
    sfenStore.moveBoardToStock({
      beforeX: beforeX.value,
      beforeY: beforeY.value,
    })
    beforeX.value = undefined
    beforeY.value = undefined
  } else if (beforeStock.value) {
    beforeStock.value = undefined
  }
}

const togglePromotedAndTurn = (x, y) => {
  sfenStore.togglePromotedAndTurn({
    x: x,
    y: y,
  })
}

const togglePromotedAndTurnOnButton = () => {
  if (beforeX.value === undefined) {
    return
  }
  sfenStore.togglePromotedAndTurn({
    x: beforeX.value,
    y: beforeY.value,
  })
}

const dragCellStart = (x, y) => {
  beforeX.value = undefined
  beforeY.value = undefined
  beforeHand.value = undefined
  moveCell(x, y)
}

const moveCell = (x, y) => {
  if (beforeX.value === undefined && rows.value[y][x] !== ".") {
    beforeX.value = x
    beforeY.value = y
    beforeHand.value = undefined
    beforeStock.value = undefined
  } else if (beforeX.value === x && beforeY.value === y) {
    beforeX.value = undefined
    beforeY.value = undefined
  } else {
    const afterCell = rows.value[y][x]
    if (beforeX.value !== undefined) {
      const beforeCell = rows.value[beforeY.value][beforeX.value]
      if (beforeCell.match(/[A-Z]/) && afterCell.match(/[A-Z]/) ||
          beforeCell.match(/[a-z]/) && afterCell.match(/[a-z]/)) {
        beforeX.value = x
        beforeY.value = y
        return
      }
      if (enabledGameMode.value &&
          ((beforeCell.match(/^[PLNSBR]$/) && (y <= 2 || beforeY.value <= 2)) ||
           (beforeCell.match(/^[plnsbr]$/) && (y >= 6 || beforeY.value >= 6)))) {
        instance.proxy.$bvModal.msgBoxConfirm("成りますか？", {
          size: "sm",
          okTitle: "成る",
          cancelTitle: "不成",
          noCloseOnBackdrop: true,
        }).then(promote => {
          let afterPiece = beforeCell
          if (promote) {
            afterPiece = "+" + afterPiece
          }
          moveCellFromBoard(x, y, afterPiece)
          moveCellFinally()
        })
      } else {
        moveCellFromBoard(x, y, beforeCell)
        moveCellFinally()
      }
    } else if (beforeHand.value) {
      if (afterCell !== ".") {
        return
      } else {
        sfenStore.moveHandToBoard({
          beforeHand: beforeHand.value,
          afterX: x,
          afterY: y,
        })
        kifStore.sendMove({
          afterX: x,
          afterY: y,
          piece: beforeHand.value,
          reversed: reversed.value,
        })
      }
      moveCellFinally()
    } else if (beforeStock.value) {
      if (afterCell !== ".") {
        return
      } else {
        sfenStore.moveStockToBoard({
          beforeStock: beforeStock.value,
          afterX: x,
          afterY: y,
        })
      }
      moveCellFinally()
    }
  }
}

const moveCellFromBoard = (x, y, piece) => {
  sfenStore.moveBoardToBoard({
    beforeX: beforeX.value,
    beforeY: beforeY.value,
    afterX: x,
    afterY: y,
    piece: piece,
  })
  kifStore.sendMove({
    beforeX: beforeX.value,
    beforeY: beforeY.value,
    afterX: x,
    afterY: y,
    piece: piece, // TODO: add promote option
    reversed: reversed.value,
  })
  moveCellFinally()
}

const moveCellFinally = () => {
  beforeX.value = undefined
  beforeY.value = undefined
  beforeHand.value = undefined
  beforeStock.value = undefined
}
</script>
<style>
.latestCell {
  background-color: orange;
}
.beforeCell {
  background-color: yellow;
}
.board {
  margin: 0 0 2% 0;
  background-color: #d6c6af;
  border-collapse: collapse;
}
.boardOutside {
  outline: solid 1px;
  outline-color: gray;
  background-color: #d6c6af;
}
.boardGuide {
  font-size: small;
  text-align: center;
}
.boardGuideTop {
  border-top-style: hidden;
  border-left-style: hidden;
  border-right-style: hidden;
  border-bottom-style: outset; /* 枠線の復元 */
}
.boardGuideRight {
  border-top-style: hidden;
  border-right-style: hidden;
  border-bottom-style: hidden;
  border-left-style: outset; /* 枠線の復元 */
}
.toggleButtonOn {
  color: white;
  background-color: #696969;
}
</style>
