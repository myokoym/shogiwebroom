// Bootstrap Vue 3 plugin for Nuxt 3
import { createBootstrap } from 'bootstrap-vue-next'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(createBootstrap())
})