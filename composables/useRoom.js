// Room page用のComposable（Composition API）
import { onMounted, computed } from '@nuxt/bridge/dist/runtime'
import { useRoute, useRouter } from '@nuxtjs/composition-api'
import { useSfenStore } from '~/stores/sfen'
import { useOptionStore } from '~/stores/option'

export const useRoom = () => {
  const route = useRoute()
  const router = useRouter()
  const sfenStore = useSfenStore()
  const optionStore = useOptionStore()
  
  // Computed
  const roomId = computed(() => route.params.id)
  
  // Methods
  const setupRoom = () => {
    if (!roomId.value) {
      router.replace('/')
      return
    }
    
    // 部屋IDを設定
    sfenStore.setRoomId({ roomId: roomId.value })
    
    // URLクエリパラメータから設定を読み込み
    if (route.query.audio === '1') {
      optionStore.setAudio(true)
    }
    if (route.query.latestMark === '1') {
      optionStore.setLatestMark(true)
    }
    if (route.query.boardGuide === '1') {
      optionStore.setBoardGuide(true)
    }
    if (route.query.font) {
      optionStore.setFont(route.query.font)
    }
  }
  
  // Lifecycle
  onMounted(() => {
    setupRoom()
  })
  
  return {
    roomId,
    setupRoom
  }
}