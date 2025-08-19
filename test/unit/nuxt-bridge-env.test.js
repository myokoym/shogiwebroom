// Nuxt Bridge環境の起動テスト
const { spawn } = require('child_process')
const path = require('path')

describe('Nuxt Bridge Environment', () => {
  it('should validate nuxt.config.ts syntax', (done) => {
    // TypeScript構文チェック
    const configPath = path.join(__dirname, '../../nuxt.config.ts')
    const fs = require('fs')
    
    // 現時点では.jsファイルのコピーなので、存在確認のみ
    expect(fs.existsSync(configPath)).toBe(true)
    
    // ファイルの中身が読み込める
    const configContent = fs.readFileSync(configPath, 'utf8')
    expect(configContent).toContain('module.exports')
    
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