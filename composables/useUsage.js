// Usage用のComposable（Composition API）
import { ref } from '@nuxt/bridge/dist/runtime'

export const useUsage = () => {
  // State
  const isExpanded = ref(false)
  
  // Methods
  const toggleUsage = () => {
    isExpanded.value = !isExpanded.value
  }
  
  return {
    isExpanded,
    toggleUsage
  }
}