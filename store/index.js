import io from "socket.io-client"

const webSocketPlugin = (store) => {
  const socket = io()
  console.log("socket: " + socket)

  store.watch((state) => {
    console.log("watch roomId")
    return state.roomId
  }, (newRoomId) => {
    console.log(socket)
    console.log("watch roomId: " + newRoomId)
    socket.on("update", (text) => {
      console.log("on update: " + text)
      store.commit("sfen/setText", {text: text})
    })
    socket.emit("enterRoom", newRoomId)
  })

  store.subscribe((mutation, state) => {
    console.log("subscribe: ")
    console.log(mutation)
    //console.log(store)
    console.log(mutation.type)
    if (mutation.type === "sfen/setText") {
      console.log("send: " + mutation.payload.text)
      socket.emit("send", {
        id: state.roomId,
        text: mutation.payload.text,
      })
    }
    if (mutation.type === "sfen/setText" ||
        mutation.type === "sfen/reverse" ||
        mutation.type === "sfen/init") {
      store.commit("sfen/parseSfen")
    }
  })
}

export const plugins = [
  webSocketPlugin,
]