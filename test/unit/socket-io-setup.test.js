// Socket.IO v4セットアップのテスト
describe('Socket.IO v4 Setup', () => {
  describe('Dependencies', () => {
    it('should have Socket.IO v4 installed', () => {
      const packageJson = require('../../package.json')
      
      expect(packageJson.dependencies['socket.io']).toBeDefined()
      expect(packageJson.dependencies['socket.io']).toMatch(/^[~^]?4\./)
    })
    
    it('should have Socket.IO Client v4 installed', () => {
      const packageJson = require('../../package.json')
      
      expect(packageJson.dependencies['socket.io-client']).toBeDefined()
      expect(packageJson.dependencies['socket.io-client']).toMatch(/^[~^]?4\./)
    })
    
    it('should have engine.io installed', () => {
      const packageJson = require('../../package.json')
      
      expect(packageJson.dependencies['engine.io']).toBeDefined()
    })
  })
  
  describe('Nitro Plugin Structure', () => {
    it('should have socket.io Nitro plugin file', () => {
      const fs = require('fs')
      const path = require('path')
      
      const pluginPath = path.join(__dirname, '../../server/plugins/socket.io.ts')
      expect(fs.existsSync(pluginPath)).toBe(true)
    })
    
    it('should export defineNitroPlugin function', () => {
      // プラグインが存在することを確認（実際のインポートは後で）
      const fs = require('fs')
      const path = require('path')
      
      const pluginPath = path.join(__dirname, '../../server/plugins/socket.io.ts')
      if (fs.existsSync(pluginPath)) {
        const content = fs.readFileSync(pluginPath, 'utf-8')
        expect(content).toContain('defineNitroPlugin')
        expect(content).toContain('export default')
      }
    })
  })
  
  describe('Socket.IO Configuration', () => {
    it('should have correct CORS configuration', () => {
      const fs = require('fs')
      const path = require('path')
      
      const pluginPath = path.join(__dirname, '../../server/plugins/socket.io.ts')
      if (fs.existsSync(pluginPath)) {
        const content = fs.readFileSync(pluginPath, 'utf-8')
        expect(content).toContain('cors:')
        expect(content).toContain('credentials: true')
      }
    })
    
    it('should have backward compatibility with v2', () => {
      const fs = require('fs')
      const path = require('path')
      
      const pluginPath = path.join(__dirname, '../../server/plugins/socket.io.ts')
      if (fs.existsSync(pluginPath)) {
        const content = fs.readFileSync(pluginPath, 'utf-8')
        expect(content).toContain('allowEIO3: true')
      }
    })
  })
})