// Chat用のComposable（Composition API）
import { useChatStore } from '~/stores/chat'

export const useChat = () => {
  const chatStore = useChatStore()
  
  // State
  const name = ref('')
  const comment = ref('')
  
  // Computed
  const comments = computed(() => chatStore.comments)
  
  // Methods
  const sendComment = () => {
    if (!name.value || !comment.value) {
      return
    }
    
    chatStore.sendComment({
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