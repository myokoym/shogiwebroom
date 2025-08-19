// Room page用のComposable（Composition API）
import { onMounted, computed } from '@nuxt/bridge/dist/runtime'
import { useRoute, useRouter } from '@nuxtjs/composition-api'
import { useStore } from 'vuex'

export const useRoom = () => {
  const route = useRoute()
  const router = useRouter()
  const store = useStore()
  
  // Computed
  const roomId = computed(() => route.params.id)
  
  // Methods
  const setupRoom = () => {
    if (!roomId.value) {
      router.replace('/')
      return
    }
    
    // 部屋IDを設定
    store.commit('sfen/setRoomId', { roomId: roomId.value })
    
    // URLクエリパラメータから設定を読み込み
    if (route.query.audio === '1') {
      store.commit('option/setAudio', true)
    }
    if (route.query.latestMark === '1') {
      store.commit('option/setLatestMark', true)
    }
    if (route.query.boardGuide === '1') {
      store.commit('option/setBoardGuide', true)
    }
    if (route.query.font) {
      store.commit('option/setFont', route.query.font)
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