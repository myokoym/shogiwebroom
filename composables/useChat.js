// Chat用のComposable（Composition API）
import { computed, ref } from '@nuxt/bridge/dist/runtime'
import { useStore } from 'vuex'

export const useChat = () => {
  const store = useStore()
  
  // State
  const name = ref('')
  const comment = ref('')
  
  // Computed
  const comments = computed(() => store.state.chat.comments)
  
  // Methods
  const sendComment = () => {
    if (!name.value || !comment.value) {
      return
    }
    
    store.commit('chat/sendComment', {
      name: name.value,
      comment: comment.value
    })
    
    // コメント送信後、入力欄をクリア
    comment.value = ''
  }
  
  const onKeydownEnter = (event) => {
    if (event.shiftKey) {
      return
    }
    event.preventDefault()
    sendComment()
  }
  
  return {
    name,
    comment,
    comments,
    sendComment,
    onKeydownEnter
  }
}