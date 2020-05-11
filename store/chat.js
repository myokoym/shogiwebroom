export const state = () => ({
  name: "",
  comment: "",
  comments: [],
})

export const mutations = {
  receiveComment(state, payload) {
    state.comments.unshift({
      time: payload.time,
      name: payload.name,
      comment: payload.comment,
    })
  },
  sendComment(state, payload) {
    console.log("sendComment")
    state.name = payload.name
    state.comment = payload.comment
  },
}
