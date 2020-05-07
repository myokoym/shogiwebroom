import io from "socket.io-client"

const webSocketPlugin = (store) => {
  const socket = io()
  console.log("socket: ")
  //console.log(socket)

  store.subscribe((mutation, state) => {
    //console.log(socket)
    console.log("subscribe: ")
    //console.log(state.sfen)
    //console.log(mutation)
    //console.log(store)
    //console.log(mutation.type)
    if (mutation.type === "sfen/setText" ||
        mutation.type === "sfen/buildSfen") {
      console.log("send")
      //console.log(state.sfen)
      console.log(state.sfen.roomId)
      console.log(state.sfen.text)
      socket.emit("send", {
        id: state.sfen.roomId,
        text: state.sfen.text,
      })
    } else if (mutation.type === "sfen/setRoomId") {
      const id = mutation.payload.roomId
      console.log("subscribe roomId: " + id)
      socket.on("update", (text) => {
        console.log("on update: " + text)
        store.commit("sfen/receiveText", {text: text})
      })
      socket.emit("enterRoom", id)
    }
    if (mutation.type === "sfen/setText" ||
        mutation.type === "sfen/receiveText" ||
        mutation.type === "sfen/reverse" ||
        mutation.type === "sfen/init") {
      store.commit("sfen/parseSfen")
      store.commit("sfen/fillHands")
    } else if (mutation.type === "sfen/moveBoardToBoard" ||
               mutation.type === "sfen/moveBoardToHand" ||
               mutation.type === "sfen/moveHandToBoard" ||
               mutation.type === "sfen/moveHandToHand" ||
               mutation.type === "sfen/togglePromotedAndTurn") {
      store.commit("sfen/fillHands")
      store.commit("sfen/buildSfen")
    }
  })
}

export const plugins = [
  webSocketPlugin,
]