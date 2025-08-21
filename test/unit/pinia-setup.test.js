// Piniaセットアップのテスト
describe('Pinia Store Setup', () => {
  describe('Dependencies', () => {
    it('should have Pinia installed', () => {
      const packageJson = require('../../package.json')
      
      expect(packageJson.dependencies['pinia']).toBeDefined()
      expect(packageJson.dependencies['@pinia/nuxt']).toBeDefined()
    })
  })
  
  describe('Store Directory', () => {
    it('should have stores directory created', () => {
      const fs = require('fs')
      const path = require('path')
      
      const storesDir = path.join(__dirname, '../../stores')
      expect(fs.existsSync(storesDir)).toBe(true)
    })
    
    it('should have migration helper', () => {
      const fs = require('fs')
      const path = require('path')
      
      const helperPath = path.join(__dirname, '../../stores/migration-helper.js')
      expect(fs.existsSync(helperPath)).toBe(true)
    })
    
    it('should export migration functions', () => {
      const helper = require('../../stores/migration-helper.js')
      
      expect(typeof helper.migrateVuexModule).toBe('function')
      expect(typeof helper.useVuexStore).toBe('function')
      expect(typeof helper.createVuexCompatibility).toBe('function')
    })
  })
  
  describe('Migration Helper', () => {
    it('should convert Vuex module structure', () => {
      const { migrateVuexModule } = require('../../stores/migration-helper.js')
      
      const vuexModule = {
        state: () => ({
          count: 0
        }),
        getters: {
          doubleCount: state => state.count * 2
        },
        mutations: {
          increment(state) {
            state.count++
          }
        },
        actions: {
          asyncIncrement({ commit }) {
            setTimeout(() => {
              commit('increment')
            }, 100)
          }
        }
      }
      
      const piniaStore = migrateVuexModule(vuexModule)
      
      expect(typeof piniaStore.state).toBe('function')
      expect(piniaStore.state()).toEqual({ count: 0 })
      expect(typeof piniaStore.getters.doubleCount).toBe('function')
      expect(typeof piniaStore.actions.increment).toBe('function')
      expect(typeof piniaStore.actions.asyncIncrement).toBe('function')
    })
  })
})