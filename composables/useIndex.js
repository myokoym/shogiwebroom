// Index page用のComposable（Composition API）
import { ref, onMounted } from '@nuxt/bridge/dist/runtime'
import { useRouter } from '@nuxtjs/composition-api'
import cryptoRandomString from 'crypto-random-string'

export const useIndex = () => {
  const router = useRouter()
  
  // State
  const roomId = ref('')
  
  // Methods
  const enterRoom = () => {
    if (!roomId.value) {
      return
    }
    router.push(`/rooms/${roomId.value}`)
  }
  
  const createRoom = () => {
    const id = cryptoRandomString({ length: 10, type: 'url-safe' })
    router.push(`/rooms/${id}`)
  }
  
  const onKeydownEnter = (event) => {
    event.preventDefault()
    enterRoom()
  }
  
  // Lifecycle
  onMounted(() => {
    // フォーカスを設定
    const input = document.querySelector('input[type="text"]')
    if (input) {
      input.focus()
    }
  })
  
  return {
    roomId,
    enterRoom,
    createRoom,
    onKeydownEnter
  }
}