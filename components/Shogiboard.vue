<template>
  <div>
    <div class="d-md-flex justify-content-around">
      <Hand
        turn="w"
        v-bind:move-from-hand="moveFromHand"
        v-bind:move-to-hand="moveToHand"
        v-bind:is-before-hand="isBeforeHand"
        v-bind:is-selected-piece="isSelectedPiece"
      ></Hand>
      <table
        class="board"
        border="1"
      >
        <tr v-for="(row, y) in rows">
          <td
            v-for="(cell, x) in row"
            v-on:click="moveCell(x, y)"
            v-on:click.right.prevent="togglePromotedAndTurn(x, y)"
            v-bind:class="{beforeCell: isBeforeCell(x, y)}"
            draggable
            v-on:dragstart="dragCellStart(x, y)"
            v-on:drop.prevent="moveCell(x, y)"
            v-on:dragover.prevent
          >
            <Piece
              type="board"
              v-bind:piece="cell"
            ></Piece>
          </td>
        </tr>
      </table>
      <Hand
        turn="b"
        v-bind:move-from-hand="moveFromHand"
        v-bind:move-to-hand="moveToHand"
        v-bind:is-before-hand="isBeforeHand"
        v-bind:is-selected-piece="isSelectedPiece"
      ></Hand>
    </div>
    <div class="m-1">
      <button
        type="button"
        class="btn btn-light btn-sm btn-block"
        v-on:click="togglePromotedAndTurnOnButton()"
        v-bind:disabled="beforeX === undefined"
      >成る/駒反転（右クリックでも可）</button>
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
      >盤反転: {{reversed ? "ON" : "OFF"}}</button>
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
import VueClipboard from "vue-clipboard2"
Vue.use(VueClipboard)

export default Vue.extend({
  components: {
    Piece,
    Hand,
  },
  computed: {
    reversedSfen: function() {
      return this.$store.getters["sfen/reversedSfen"]
    },
    ...mapState("sfen", {
      text: "text",
      reversed: "reversed",
      rows: "rows",
      hands: "hands",
      history: "history",
      historyCursor: "historyCursor",
    })
  },
  mounted() {
    this.$store.commit("sfen/init")
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
    }
  },
  watch: {
    "value": function() {
      this.update()
    },
  },
  methods: {
    isBeforeCell(x, y) {
      return this.beforeX === x && this.beforeY === y
    },
    isBeforeHand(piece) {
      return this.beforeHand === piece
    },
    isSelectedPiece() {
      return this.beforeX !== undefined ||
             this.beforeHand !== undefined
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
          this.$store.commit("sfen/moveBoardToBoard", {
            beforeX: this.beforeX,
            beforeY: this.beforeY,
            afterX: x,
            afterY: y,
          })
        } else if (this.beforeHand) {
          if (afterCell !== ".") {
            return
          } else {
            this.$store.commit("sfen/moveHandToBoard", {
              beforeHand: this.beforeHand,
              afterX: x,
              afterY: y,
            })
          }
        }
        this.beforeX = undefined
        this.beforeY = undefined
        this.beforeHand = undefined
      }
    }
  }
})
</script>
<style>
.beforeCell {
  background-color: yellow;
}
.board {
  margin: 2% 0 2% 0;
  outline: solid 1px;
  background-color: #d6c6af;
  border-collapse: collapse;
}
.toggleButtonOn {
  color: white;
  background-color: #696969;
}
</style>
