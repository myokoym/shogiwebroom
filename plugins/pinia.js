import Vue from 'vue'
import { createPinia, PiniaVuePlugin } from 'pinia'

Vue.use(PiniaVuePlugin)

export default ({ app }, inject) => {
  const pinia = createPinia()
  app.pinia = pinia
  
  // Inject pinia into the Vue instance
  inject('pinia', pinia)
}