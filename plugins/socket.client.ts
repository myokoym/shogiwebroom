// TypeScript版のSocket.IOクライアントプラグイン（型定義用）
import { Plugin } from '@nuxt/types'
import { Socket } from 'socket.io-client'

declare module 'vue/types/vue' {
  interface Vue {
    $socket: Socket
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $socket: Socket
  }
  interface Context {
    $socket: Socket
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $socket: Socket
  }
}

const socketPlugin: Plugin = ({ store }, inject) => {
  // 実装はJavaScript版を参照
  // このファイルは型定義のみ提供
}

export default socketPlugin