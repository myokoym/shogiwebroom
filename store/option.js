export const state = () => ({
  enabledAudio: false,
  enabledLatestMark: false,
  enabledBoardGuide: false,
  showStock: false,
  showClock: false,
  font: "kirieji1",
  fontOptions: [
    {value: "kirieji1", text: "切絵字"},
    {value: "sarari", text: "しょかきさらり"},
    {value: "kouzan", text: "衡山毛筆フォント行書"},
    {value: "aoyagireisho", text: "青柳隷書しも"},
    {value: "genei-chikumin", text: "源暎ちくご明朝"},
  ],
})

export const mutations = {
  toggleAudio(state) {
    state.enabledAudio = !state.enabledAudio
  },
  toggleLatestMark(state) {
    state.enabledLatestMark = !state.enabledLatestMark
  },
  toggleBoardGuide(state) {
    state.enabledBoardGuide = !state.enabledBoardGuide
  },
  toggleClock(state) {
    state.showClock = !state.showClock
  },
  toggleStock(state) {
    state.showStock = !state.showStock
  },
  setAudio(state, payload) {
    state.enabledAudio = payload
  },
  setLatestMark(state, payload) {
    state.enabledLatestMark = payload
  },
  setBoardGuide(state, payload) {
    state.enabledBoardGuide = payload
  },
  setFont(state, payload) {
    let font = undefined
    switch (payload) {
      case "kirieji1":
      case "sarari":
      case "kouzan":
      case "aoyagireisho":
      case "genei-chikumin":
        font = payload
        break
      default:
        font = "kirieji1"
        break
    }
    state.font = font
  },
}
