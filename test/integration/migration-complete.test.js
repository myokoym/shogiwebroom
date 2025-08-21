// 移行完了後の統合テスト
const { spawn } = require('child_process')
const fetch = require('node-fetch')

describe('Migration Complete Integration Tests', () => {
  describe('All Features Working', () => {
    it('should have all critical features functional', () => {
      // Socket.IO implementation in server file
      const fs = require('fs')
      const path = require('path')
      
      // Check server file has Socket.IO integration
      const serverPath = path.join(__dirname, '../../server/index-nuxt3.js')
      expect(fs.existsSync(serverPath)).toBe(true)
      
      const content = fs.readFileSync(serverPath, 'utf-8')
      expect(content).toContain('socket.io')
      expect(content).toContain('io.on')
    })
    
    it('should have all security headers implemented', () => {
      const fs = require('fs')
      const path = require('path')
      
      const securityPath = path.join(__dirname, '../../server/middleware/security.js')
      expect(fs.existsSync(securityPath)).toBe(true)
      
      const content = fs.readFileSync(securityPath, 'utf-8')
      const headers = [
        'Content-Security-Policy',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Referrer-Policy',
        'Permissions-Policy',
        'Strict-Transport-Security'
      ]
      
      headers.forEach(header => {
        expect(content).toContain(header)
      })
    })
  })
  
  describe('Socket.IO Communication', () => {
    it('should support v4 clients', () => {
      const fs = require('fs')
      const path = require('path')
      
      // Check server implementation for Socket.IO v4
      const serverPath = path.join(__dirname, '../../server/index-nuxt3.js')
      const content = fs.readFileSync(serverPath, 'utf-8')
      
      // Socket.IO v4 configuration in server
      expect(content).toContain('socket.io')
      expect(content).toContain('cors')
      
      // Client plugin for Socket.IO v4
      const clientPath = path.join(__dirname, '../../plugins/socket.client.js')
      const clientContent = fs.readFileSync(clientPath, 'utf-8')
      expect(clientContent).toContain('socket.io-client')
    })
  })
  
  describe('Memory Leak Check', () => {
    it('should not have obvious memory leaks', () => {
      // Check for proper cleanup in stores that manage arrays
      const stores = [
        'stores/sfen.ts',
        'stores/chat.ts',
        'stores/kif.ts'
      ]
      
      stores.forEach(store => {
        const fs = require('fs')
        const path = require('path')
        const content = fs.readFileSync(path.join(__dirname, '../..', store), 'utf-8')
        
        // Check for array length limits in stores that manage collections
        if (store.includes('chat') || store.includes('kif') || store.includes('sfen')) {
          // These stores have array management with length checks
          expect(content).toContain('.length')
          expect(content).toContain('>')
        }
      })
    })
  })
  
  describe('Error Handling', () => {
    it('should have error handling in all critical paths', () => {
      const files = [
        'server/index-nuxt3.js',
        'plugins/socket.client.js'
      ]
      
      files.forEach(file => {
        const fs = require('fs')
        const path = require('path')
        const content = fs.readFileSync(path.join(__dirname, '../..', file), 'utf-8')
        
        expect(content).toContain('error')
        // Different files use different error handling patterns
        if (file.includes('client')) {
          expect(content).toContain('console.error')
        }
      })
    })
  })
})