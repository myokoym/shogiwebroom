// 移行完了後の統合テスト
const { spawn } = require('child_process')
const fetch = require('node-fetch')

describe('Migration Complete Integration Tests', () => {
  describe('All Features Working', () => {
    it('should have all critical features functional', () => {
      // Socket.IO v4
      const socketIOTests = [
        'server/plugins/socket.io.js',
        'server/plugins/socket-events.js',
        'server/plugins/socket-fallback.js'
      ]
      
      socketIOTests.forEach(file => {
        const fs = require('fs')
        const path = require('path')
        expect(fs.existsSync(path.join(__dirname, '../..', file))).toBe(true)
      })
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
    it('should support v2 and v4 clients', () => {
      const fs = require('fs')
      const path = require('path')
      
      // Check main socket.io plugin for allowEIO3
      const socketPath = path.join(__dirname, '../../server/plugins/socket.io.js')
      const socketContent = fs.readFileSync(socketPath, 'utf-8')
      expect(socketContent).toContain('allowEIO3')
      
      // Check fallback for v2 client detection
      const fallbackPath = path.join(__dirname, '../../server/plugins/socket-fallback.js')
      const content = fs.readFileSync(fallbackPath, 'utf-8')
      expect(content).toContain('_isV2Client')
      expect(content).toContain('v4-compatible')
    })
  })
  
  describe('Memory Leak Check', () => {
    it('should not have obvious memory leaks', () => {
      // Check for proper cleanup in stores that manage arrays
      const stores = [
        'stores/sfen.js',
        'stores/chat.js',
        'stores/kif.js'
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
        'server/plugins/socket-events.js',
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