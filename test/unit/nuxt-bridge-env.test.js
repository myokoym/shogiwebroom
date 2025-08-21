// Nuxt 3環境の起動テスト
const { spawn } = require('child_process')
const path = require('path')

describe.skip('Nuxt Bridge Environment - SKIPPED: Using direct Nuxt 3 without Bridge', () => {
  it('should validate nuxt.config.ts syntax', (done) => {
    // TypeScript構文チェック
    const configPath = path.join(__dirname, '../../nuxt.config.ts')
    const fs = require('fs')
    
    // TypeScriptファイルの存在確認
    expect(fs.existsSync(configPath)).toBe(true)
    
    // TypeScript設定ファイルの内容確認
    const configContent = fs.readFileSync(configPath, 'utf8')
    expect(configContent).toContain('defineNuxtConfig')
    expect(configContent).toContain('export default')
    
    done()
  })

  it('should have compatible package versions', () => {
    const packageJson = require('../../package.json')
    
    // Nuxt BridgeはNuxt 3と共存する
    expect(packageJson.dependencies['nuxt']).toContain('nuxt3')
    expect(packageJson.dependencies['@nuxt/bridge']).toContain('@nuxt/bridge')
    
    // Node.js 18以上が必要
    const nodeVersion = process.version
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
    expect(majorVersion).toBeGreaterThanOrEqual(18)
  })
})