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
            v-on:click="$store.commit('sfen/prevHistory')"
            v-bind:disabled="historyCursor >= history.length - 1"
          >一手戻る</button>
          <button
            type="button"
            class="btn btn-light btn-sm"
            v-on:click="$store.commit('sfen/nextHistory')"
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
        v-on:input="$store.commit('sfen/setText', {text: $event.target.value})"
      >
      <button
        type="button"
        class="btn btn-light btn-sm"
        v-clipboard:copy="text"
      >コピー</button>
    </div>
  </div>
</template>
<script>
import Vue from "vue"
import { mapState } from "vuex"
import Piece from '~/components/Piece.vue'
import Hand from '~/components/Hand.vue'
import Stock from '~/components/Stock.vue'
import Option from '~/components/Option.vue'
import VueClipboard from "vue-clipboard2"
Vue.use(VueClipboard)

export default Vue.extend({
  components: {
    Piece,
    Hand,
    Stock,
    Option,
  },
  computed: {
    reversedSfen: function() {
      return this.$store.getters["sfen/reversedSfen"]
    },
    ...mapState("sfen", {
      roomId: "roomId",
      text: "text",
      reversed: "reversed",
      rows: "rows",
      hands: "hands",
      latestCellX: "latestCellX",
      latestCellY: "latestCellY",
      history: "history",
      historyCursor: "historyCursor",
    }),
    ...mapState("kif", {
      moves: "moves",
      kifs: "kifs",
      ki2s: "ki2s",
      xChars: "xChars",
      yChars: "yChars",
    }),
    ...mapState("option", {
      enabledGameMode: "enabledGameMode",
      enabledAudio: "enabledAudio",
      enabledLatestMark: "enabledLatestMark",
      enabledBoardGuide: "enabledBoardGuide",
      showStock: "showStock",
      showClock: "showClock",
      font: "font",
    }),
  },
  mounted() {
    this.$store.commit("sfen/init")
    this.komaotoObj = new Audio(this.komaotoPath())
    // debug: console.log("this.text: " + this.text)
    // debug: console.log("this.text: " + this.$store.state.sfen.text)
  },
  data() {
    return {
      filledBHands: [],
      filledWHands: [],
      beforeX: undefined,
      beforeY: undefined,
      beforeHand: undefined,
      beforeStock: undefined,
      komaotoName: "komaoto1",
      komaotoObj: undefined,
    }
  },
  watch: {
    "value": function() {
      this.update()
    },
    "text": function() {
      if (this.enabledAudio) {
        this.komaotoObj.play();
      }
    },
  },
  methods: {
    komaotoPath() {
      return require("@/assets/audio/" + this.komaotoName + ".mp3")
    },
    boardGuideTop(x, max) {
      if (!this.enabledBoardGuide) {
        return "　"
      }
      if (!max) {
        max = 10
      }
      if (!this.reversed) {
        x = max - x
      }
      return this.xChars[x]
    },
    boardGuideRight(y, max) {
      if (!this.enabledBoardGuide) {
        return "　"
      }
      if (!max) {
        max = 10
      }
      if (this.reversed) {
        y = max - y
      }
      return this.yChars[y]
    },
    isLatestCell(x, y) {
      if (!this.enabledLatestMark) {
        return false
      }
      return this.latestCellX == x && this.latestCellY == y
    },
    isBeforeCell(x, y) {
      return this.beforeX === x && this.beforeY === y
    },
    isBeforeHand(piece) {
      return this.beforeHand === piece
    },
    isBeforeStock(piece) {
      // debug: console.log(this.beforeStock)
      // debug: console.log(piece)
      return this.beforeStock === piece
    },
    isSelectedPiece() {
      return this.beforeX !== undefined ||
             this.beforeHand !== undefined ||
             this.beforeStock !== undefined
    },
    reverseBoard() {
      this.$store.commit("sfen/reverse")
    },
    moveFromHand(piece) {
      // debug: console.log("moveFromHand: " + piece)
      if (piece === ".") {
        return
      }
      this.beforeX = undefined
      this.beforeY = undefined
      if (this.beforeHand === piece) {
        this.beforeHand = undefined
      } else {
        this.beforeHand = piece
      }
    },
    moveFromStock(piece) {
      // debug: console.log("moveFromStock: " + piece)
      if (piece === ".") {
        return
      }
      this.beforeX = undefined
      this.beforeY = undefined
      if (this.beforeStock === piece) {
        this.beforeStock = undefined
      } else {
        this.beforeStock = piece
      }
    },
    moveToHand(turn) {
      // debug: console.log("moveToHand: " + turn)
      if (this.beforeX === undefined &&
          this.beforeHand === undefined) {
        return
      }
      if (this.beforeX !== undefined) {
        this.$store.commit("sfen/moveBoardToHand", {
          beforeX: this.beforeX,
          beforeY: this.beforeY,
          turn: turn,
        })
        this.beforeX = undefined
        this.beforeY = undefined
      } else if (this.beforeHand) {
        if ((this.beforeHand.match(/[A-Z]/) && turn === "b") ||
            (this.beforeHand.match(/[a-z]/) && turn === "w")) {
          this.beforeHand = undefined
          return
        }
        this.$store.commit("sfen/moveHandToHand", {
          beforeHand: this.beforeHand,
          turn: turn,
        })
        this.beforeHand = undefined
      }
    },
    moveToStock(turn) {
      // debug: console.log("moveToHand: " + turn)
      if (this.beforeX === undefined &&
          this.beforeStock === undefined) {
        return
      }
      if (this.beforeX !== undefined) {
        this.$store.commit("sfen/moveBoardToStock", {
          beforeX: this.beforeX,
          beforeY: this.beforeY,
        })
        this.beforeX = undefined
        this.beforeY = undefined
      } else if (this.beforeStock) {
        this.beforeStock = undefined
      }
    },
    togglePromotedAndTurn(x, y) {
      this.$store.commit("sfen/togglePromotedAndTurn", {
        x: x,
        y: y,
      })
    },
    togglePromotedAndTurnOnButton() {
      if (this.beforeX === undefined) {
        return
      }
      this.$store.commit("sfen/togglePromotedAndTurn", {
        x: this.beforeX,
        y: this.beforeY,
      })
    },
    dragCellStart(x, y) {
      this.beforeX = undefined
      this.beforeY = undefined
      this.beforeHand = undefined
      this.moveCell(x, y)
    },
    moveCell(x, y) {
      if (this.beforeX === undefined && this.rows[y][x] !== ".") {
        this.beforeX = x
        this.beforeY = y
        this.beforeHand = undefined
        this.beforeStock = undefined
      } else if (this.beforeX === x && this.beforeY === y) {
        this.beforeX = undefined
        this.beforeY = undefined
      } else {
        const afterCell = this.rows[y][x]
        if (this.beforeX !== undefined) {
          const beforeCell = this.rows[this.beforeY][this.beforeX]
          if (beforeCell.match(/[A-Z]/) && afterCell.match(/[A-Z]/) ||
              beforeCell.match(/[a-z]/) && afterCell.match(/[a-z]/)) {
            this.beforeX = x
            this.beforeY = y
            return
          }
          if (this.enabledGameMode &&
              ((beforeCell.match(/^[PLNSBR]$/) && (y <= 2 || this.beforeY <= 2)) ||
               (beforeCell.match(/^[plnsbr]$/) && (y >= 6 || this.beforeY >= 6)))) {
            this.$bvModal.msgBoxConfirm("成りますか？", {
              size: "sm",
              okTitle: "成る",
              cancelTitle: "不成",
              noCloseOnBackdrop: true,
            }).then(promote => {
              let afterPiece = beforeCell
              if (promote) {
                afterPiece = "+" + afterPiece
              }
              this.moveCellFromBoard(x, y, afterPiece)
              this.moveCellFinally()
            })
          } else {
            this.moveCellFromBoard(x, y, beforeCell)
            this.moveCellFinally()
          }
        } else if (this.beforeHand) {
          if (afterCell !== ".") {
            return
          } else {
            this.$store.commit("sfen/moveHandToBoard", {
              beforeHand: this.beforeHand,
              afterX: x,
              afterY: y,
            })
            this.$store.commit("kif/sendMove", {
              afterX: x,
              afterY: y,
              piece: this.beforeHand,
              reversed: this.reversed,
            })
          }
          this.moveCellFinally()
        } else if (this.beforeStock) {
          if (afterCell !== ".") {
            return
          } else {
            this.$store.commit("sfen/moveStockToBoard", {
              beforeStock: this.beforeStock,
              afterX: x,
              afterY: y,
            })
          }
          this.moveCellFinally()
        }
      }
    },
    moveCellFromBoard(x, y, piece) {
      this.$store.commit("sfen/moveBoardToBoard", {
        beforeX: this.beforeX,
        beforeY: this.beforeY,
        afterX: x,
        afterY: y,
        piece: piece,
      })
      this.$store.commit("kif/sendMove", {
        beforeX: this.beforeX,
        beforeY: this.beforeY,
        afterX: x,
        afterY: y,
        piece: piece, // TODO: add promote option
        reversed: this.reversed,
      })
      this.moveCellFinally()
    },
    moveCellFinally() {
      this.beforeX = undefined
      this.beforeY = undefined
      this.beforeHand = undefined
      this.beforeStock = undefined
    },
  }
})
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
