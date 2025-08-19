import Vue from 'vue'
import { createPinia, PiniaVuePlugin } from 'pinia'

// Disable devtools in production to avoid birpc issues
if (process.env.NODE_ENV === 'production') {
  Vue.config.devtools = false
  Vue.config.productionTip = false
}

Vue.use(PiniaVuePlugin)

export default ({ app }, inject) => {
  const pinia = createPinia()
  
  // Disable devtools in production
  if (process.env.NODE_ENV === 'production') {
    pinia.use(() => ({ devtools: false }))
  }
  
  app.pinia = pinia
  
  // Inject pinia into the Vue instance
  inject('pinia', pinia)
}