// Layout用のComposable（Composition API）
import { computed } from '@nuxt/bridge/dist/runtime'
import { useRoute } from '@nuxtjs/composition-api'

export const useLayout = () => {
  const route = useRoute()
  
  // Computed
  const isRoomPage = computed(() => {
    return route.path.includes('/rooms/')
  })
  
  const showHeader = computed(() => {
    return !isRoomPage.value
  })
  
  const containerClass = computed(() => {
    if (isRoomPage.value) {
      return 'container-fluid'
    }
    return 'container'
  })
  
  return {
    isRoomPage,
    showHeader,
    containerClass
  }
}