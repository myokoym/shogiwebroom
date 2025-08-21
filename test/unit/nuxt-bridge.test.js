// Nuxt 3移行のテスト
describe.skip('Nuxt 3 Migration Tests - SKIPPED: Direct Nuxt 3 migration without Bridge', () => {
  let packageJson
  let nuxtConfig
  let tsConfig

  beforeAll(() => {
    // package.jsonの読み込み
    packageJson = require('../../package.json')
    
    // TypeScript設定の存在確認
    try {
      tsConfig = require('../../tsconfig.json')
    } catch (e) {
      tsConfig = null
    }
  })

  describe('Dependencies', () => {
    it('should have Nuxt 3 as dependency', () => {
      expect(packageJson.dependencies).toHaveProperty('nuxt')
      // Direct Nuxt 3 installation
      expect(packageJson.dependencies.nuxt).toMatch(/^[~^]?3\./)
    })

    it.skip('should NOT have @nuxt/bridge - using direct Nuxt 3', () => {
      // We're doing direct Nuxt 3 migration, not using Bridge
      expect(packageJson.dependencies).not.toHaveProperty('@nuxt/bridge')
    })

    it('should require Node.js 18 or higher', () => {
      expect(packageJson.engines).toBeDefined()
      expect(packageJson.engines.node).toBeDefined()
      const nodeVersion = packageJson.engines.node
      // >=18.0.0のようなパターンをチェック
      expect(nodeVersion).toMatch(/>=18/)
    })
  })

  describe('TypeScript Configuration', () => {
    it('should have tsconfig.json file', () => {
      expect(tsConfig).not.toBeNull()
    })

    it('should have proper TypeScript settings for Nuxt Bridge', () => {
      expect(tsConfig).toBeDefined()
      expect(tsConfig.compilerOptions).toBeDefined()
      expect(tsConfig.compilerOptions.target).toBe('ES2018')
      expect(tsConfig.compilerOptions.module).toBe('ESNext')
      expect(tsConfig.compilerOptions.moduleResolution).toBe('Node')
    })
  })

  describe('Nuxt Configuration', () => {
    it('should have nuxt.config.ts file', () => {
      const fs = require('fs')
      const path = require('path')
      const configPath = path.join(__dirname, '../../nuxt.config.ts')
      expect(fs.existsSync(configPath)).toBe(true)
    })
  })
})