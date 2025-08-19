// Vuex to Pinia migration helper functions
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

// Helper to migrate Vuex modules to Pinia stores
export function migrateVuexModule(vuexModule) {
  const state = typeof vuexModule.state === 'function' 
    ? vuexModule.state() 
    : vuexModule.state
    
  const getters = {}
  const actions = {}
  
  // Convert Vuex getters to Pinia getters
  if (vuexModule.getters) {
    Object.keys(vuexModule.getters).forEach(key => {
      getters[key] = (state) => vuexModule.getters[key](state)
    })
  }
  
  // Convert Vuex mutations and actions to Pinia actions
  if (vuexModule.mutations) {
    Object.keys(vuexModule.mutations).forEach(key => {
      actions[key] = function(payload) {
        vuexModule.mutations[key](this.$state, payload)
      }
    })
  }
  
  if (vuexModule.actions) {
    Object.keys(vuexModule.actions).forEach(key => {
      actions[key] = async function(payload) {
        const context = {
          state: this.$state,
          getters: this,
          commit: (type, payload) => {
            if (this[type]) {
              this[type](payload)
            }
          },
          dispatch: (type, payload) => {
            if (this[type]) {
              return this[type](payload)
            }
          }
        }
        return await vuexModule.actions[key](context, payload)
      }
    })
  }
  
  return {
    state,
    getters,
    actions
  }
}

// Helper to use Vuex store in Pinia during migration
export function useVuexStore() {
  // This will be replaced with proper Nuxt context access
  if (process.client && window.$nuxt) {
    return window.$nuxt.$store
  }
  return null
}

// Compatibility layer for components still using Vuex
export function createVuexCompatibility(piniaStore) {
  return {
    state: piniaStore.$state,
    getters: piniaStore,
    commit: (type, payload) => {
      const actionName = type.split('/').pop()
      if (piniaStore[actionName]) {
        piniaStore[actionName](payload)
      }
    },
    dispatch: (type, payload) => {
      const actionName = type.split('/').pop()
      if (piniaStore[actionName]) {
        return piniaStore[actionName](payload)
      }
    }
  }
}