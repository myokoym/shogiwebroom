export const state = () => ({
  enabled: false,
  mode: undefined,
  countdown: 0,
  currentTurn: undefined,
  nextTurn: undefined,
  timeLimits: {
    b: 0,
    w: 0,
  },
  pause: false,
})

export const mutations = {
  defaultTimeLimits(state) {
    //const timeLimit = 5 * 60 * 1000
    //state.timeLimits['b'] = timeLimit
    //state.timeLimits['w'] = timeLimit
  },
  decreaseTimeLimit(state, payload) {
    state.timeLimits[state.currentTurn] -= payload.diff
    if (state.timeLimits[state.currentTurn] < 0) {
      state.timeLimits[state.currentTurn] = 0
    }
  },
  emitChangeTurn(state, payload) {
    state.nextTurn = payload.nextTurn
  },
  emitPause(state) {
  },
  emitCancelPause(state) {
  },
  emitReset(state) {
    console.log("emitReset")
  },
  emitEnable(state) {
  },
  emitDisable(state) {
  },
  onChangeTurn(state, payload) {
    console.log("onChangeTurn: " + payload.nextTurn)
    const nextTurn = payload.nextTurn
    if (state.currentTurn === nextTurn) {
      return
    }
    state.currentTurn = nextTurn
  },
  onPause(state) {
    state.pause = true
  },
  onCancelPause(state) {
    state.pause = false
  },
  onReset(state) {
    state.requestID = undefined
    state.currentTurn = undefined
    const timeLimit = 5 * 60 * 1000
    state.timeLimits['b'] = timeLimit
    state.timeLimits['w'] = timeLimit
    state.pause = false
  },
  onEnable(state) {
    console.log("onEnable")
    state.enabled = true
  },
  onDisable(state) {
    state.enabled = false
  },
}
