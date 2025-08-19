// Composition API移行のテスト
describe('Composition API Migration', () => {
  describe('Composables', () => {
    it('should have useShogiboard composable', () => {
      const fs = require('fs')
      const path = require('path')
      
      const composablePath = path.join(__dirname, '../../composables/useShogiboard.js')
      expect(fs.existsSync(composablePath)).toBe(true)
    })
    
    it('should export required functions from useShogiboard', () => {
      const fs = require('fs')
      const path = require('path')
      
      const composablePath = path.join(__dirname, '../../composables/useShogiboard.js')
      const content = fs.readFileSync(composablePath, 'utf-8')
      
      // Composition API imports
      expect(content).toContain("import { computed, ref, onMounted")
      expect(content).toContain("from '@nuxt/bridge")
      expect(content).toContain("useStore")
      
      // 主要な関数
      expect(content).toContain('export const useShogiboard')
      expect(content).toContain('moveCell')
      expect(content).toContain('moveToHand')
      expect(content).toContain('moveFromHand')
      expect(content).toContain('togglePromotedAndTurn')
      
      // State管理
      expect(content).toContain('const beforeX = ref')
      expect(content).toContain('const beforeY = ref')
      expect(content).toContain('const dragFromHand = ref')
      
      // Computed properties
      expect(content).toContain('const rows = computed')
      expect(content).toContain('const font = computed')
    })
  })
  
  describe('Nuxt Bridge Configuration', () => {
    it('should have Composition API enabled in nuxt.config', () => {
      const fs = require('fs')
      const path = require('path')
      
      const configPath = path.join(__dirname, '../../nuxt.config.ts')
      const content = fs.readFileSync(configPath, 'utf-8')
      
      expect(content).toContain('composition: true')
      expect(content).toContain('meta: true')
    })
  })
  
  describe('Component Structure', () => {
    it('should maintain backward compatibility', () => {
      const fs = require('fs')
      const path = require('path')
      
      // 元のコンポーネントファイルが存在する
      const shogiboardPath = path.join(__dirname, '../../components/Shogiboard.vue')
      expect(fs.existsSync(shogiboardPath)).toBe(true)
      
      // Pieceコンポーネントも存在
      const piecePath = path.join(__dirname, '../../components/Piece.vue')
      expect(fs.existsSync(piecePath)).toBe(true)
      
      // Handコンポーネントも存在
      const handPath = path.join(__dirname, '../../components/Hand.vue')
      expect(fs.existsSync(handPath)).toBe(true)
      
      // Stockコンポーネントも存在
      const stockPath = path.join(__dirname, '../../components/Stock.vue')
      expect(fs.existsSync(stockPath)).toBe(true)
    })
  })
  
  describe('Store Integration', () => {
    it('should use Vuex store correctly', () => {
      const fs = require('fs')
      const path = require('path')
      
      const composablePath = path.join(__dirname, '../../composables/useShogiboard.js')
      const content = fs.readFileSync(composablePath, 'utf-8')
      
      // Vuex store の使用
      expect(content).toContain('useStore()')
      expect(content).toContain('store.state.sfen')
      expect(content).toContain('store.state.option')
      expect(content).toContain('store.commit')
      
      // 正しいmutationの呼び出し
      expect(content).toContain('sfen/moveBoardToBoard')
      expect(content).toContain('sfen/moveHandToBoard')
      expect(content).toContain('sfen/moveBoardToHand')
      expect(content).toContain('kif/sendMove')
    })
  })
})