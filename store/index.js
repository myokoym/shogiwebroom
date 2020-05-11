import io from "socket.io-client"

const webSocketPlugin = (store) => {
  const socket = io()
  // debug: console.log("socket: ")
  //console.log(socket)

  store.subscribe((mutation, state) => {
    //console.log(socket)
    // debug: console.log("subscribe: ")
    //console.log(state.sfen)
    //console.log(mutation)
    //console.log(store)
    // debug: console.log(mutation.type)
    if (mutation.type === "sfen/setText" ||
        mutation.type === "sfen/prevHistory" ||
        mutation.type === "sfen/nextHistory" ||
        mutation.type === "sfen/buildSfen") {
      // debug: console.log("send")
      //console.log(state.sfen)
      // debug: console.log(state.sfen.roomId)
      // debug: console.log(state.sfen.text)
      socket.emit("send", {
        id: state.sfen.roomId,
        text: state.sfen.text,
      })
    } else if (mutation.type === "sfen/setRoomId") {
      const id = mutation.payload.roomId
      // debug: console.log("subscribe roomId: " + id)
      socket.on("update", (text) => {
        // debug: console.log("on update: " + text)
        if (!text) {
          return
        }
        store.commit("sfen/receiveText", {text: text})
      })
      socket.on("receiveComment", (params) => {
        // debug: console.log("on receiveComment")
        store.commit("chat/receiveComment", {
          time: params.time,
          name: params.name,
          comment: params.comment,
        })
      })
      socket.emit("enterRoom", id)
    } else if (mutation.type === "chat/sendComment") {
      socket.emit("sendComment", {
        id: state.sfen.roomId,
        name: state.chat.name,
        comment: state.chat.comment,
      })
    }
    if (mutation.type === "sfen/setText" ||
        mutation.type === "sfen/receiveText" ||
        mutation.type === "sfen/reverse" ||
        mutation.type === "sfen/prevHistory" ||
        mutation.type === "sfen/nextHistory" ||
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
    if (mutation.type === "sfen/setText" ||
        mutation.type === "sfen/receiveText" ||
        mutation.type === "sfen/reverse" ||
        mutation.type === "sfen/buildSfen" ||
        mutation.type === "sfen/init") {
      // debug: console.log("mutation.type: " + mutation.type)
      store.commit("sfen/addHistory")
    }
  })
}

export const plugins = [
  webSocketPlugin,
]