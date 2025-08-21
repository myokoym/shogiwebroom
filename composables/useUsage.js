// Usage用のComposable（Composition API）

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