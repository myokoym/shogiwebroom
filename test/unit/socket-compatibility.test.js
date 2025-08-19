// Socket.IO v2/v4互換性テスト
describe('Socket.IO Backward Compatibility', () => {
  describe('Server Configuration', () => {
    it('should have allowEIO3 enabled for v2 client support', () => {
      const fs = require('fs')
      const path = require('path')
      
      // TypeScriptファイルをチェック
      const tsPath = path.join(__dirname, '../../server/plugins/socket.io.ts')
      const tsContent = fs.readFileSync(tsPath, 'utf-8')
      
      expect(tsContent).toContain('allowEIO3: true')
      expect(tsContent).toContain('// Socket.IO v2クライアントとの後方互換性')
      
      // JavaScriptファイルもチェック
      const jsPath = path.join(__dirname, '../../server/plugins/socket.io.js')
      const jsContent = fs.readFileSync(jsPath, 'utf-8')
      
      expect(jsContent).toContain('allowEIO3: true')
    })
    
    it('should support both polling and websocket transports', () => {
      const fs = require('fs')
      const path = require('path')
      
      const tsPath = path.join(__dirname, '../../server/plugins/socket.io.ts')
      const content = fs.readFileSync(tsPath, 'utf-8')
      
      expect(content).toContain("transports: ['polling', 'websocket']")
    })
    
    it('should have proper CORS configuration for v2 clients', () => {
      const fs = require('fs')
      const path = require('path')
      
      const tsPath = path.join(__dirname, '../../server/plugins/socket.io.ts')
      const content = fs.readFileSync(tsPath, 'utf-8')
      
      expect(content).toContain('cors:')
      expect(content).toContain('origin: true')
      expect(content).toContain('credentials: true')
      expect(content).toContain("methods: ['GET', 'POST']")
    })
  })
  
  describe('Client Compatibility', () => {
    it('should support v4 client configuration', () => {
      const fs = require('fs')
      const path = require('path')
      
      const clientPath = path.join(__dirname, '../../store/socket-plugin.js')
      const content = fs.readFileSync(clientPath, 'utf-8')
      
      // v4クライアントの設定
      expect(content).toContain("transports: ['websocket', 'polling']")
      expect(content).toContain('upgrade: true')
    })
    
    it('should handle both v2 and v4 event formats', () => {
      const fs = require('fs')
      const path = require('path')
      
      const eventsPath = path.join(__dirname, '../../server/plugins/socket-events.js')
      const content = fs.readFileSync(eventsPath, 'utf-8')
      
      // v2形式のイベントハンドラーが維持されている
      expect(content).toContain("socket.on('enterRoom'")
      expect(content).toContain("socket.on('send'")
      expect(content).toContain("socket.on('sendMove'")
      expect(content).toContain("socket.on('sendComment'")
      
      // v2形式のemitも維持
      expect(content).toContain("socket.emit('update'")
      expect(content).toContain("io.to(roomId).emit('receiveMove'")
      expect(content).toContain("io.to(roomId).emit('receiveComment'")
    })
  })
  
  describe('Fallback Mechanisms', () => {
    it('should start with polling for v2 clients', () => {
      const fs = require('fs')
      const path = require('path')
      
      const tsPath = path.join(__dirname, '../../server/plugins/socket.io.ts')
      const content = fs.readFileSync(tsPath, 'utf-8')
      
      // pollingが最初に来ている（v2クライアント対応）
      expect(content).toContain("transports: ['polling', 'websocket']")
    })
    
    it('should have proper timeout settings for compatibility', () => {
      const fs = require('fs')
      const path = require('path')
      
      const tsPath = path.join(__dirname, '../../server/plugins/socket.io.ts')
      const content = fs.readFileSync(tsPath, 'utf-8')
      
      // 長めのタイムアウト設定（v2クライアント対応）
      expect(content).toContain('pingTimeout: 60000')
      expect(content).toContain('pingInterval: 25000')
    })
    
    it('should use standard Socket.IO path', () => {
      const fs = require('fs')
      const path = require('path')
      
      const tsPath = path.join(__dirname, '../../server/plugins/socket.io.ts')
      const content = fs.readFileSync(tsPath, 'utf-8')
      
      // 標準パスを使用（v2/v4両対応）
      expect(content).toContain("path: '/socket.io/'")
    })
  })
  
  describe('Data Format Compatibility', () => {
    it('should maintain v2 data structure for events', () => {
      const fs = require('fs')
      const path = require('path')
      
      const eventsPath = path.join(__dirname, '../../server/plugins/socket-events.js')
      const content = fs.readFileSync(eventsPath, 'utf-8')
      
      // v2形式のデータ構造を維持
      expect(content).toContain('params.id')
      expect(content).toContain('params.text')
      expect(content).toContain('params.name')
      expect(content).toContain('params.comment')
      expect(content).toContain('params.piece')
      expect(content).toContain('params.beforeX')
      expect(content).toContain('params.beforeY')
      expect(content).toContain('params.afterX')
      expect(content).toContain('params.afterY')
    })
    
    it('should maintain room management compatibility', () => {
      const fs = require('fs')
      const path = require('path')
      
      const eventsPath = path.join(__dirname, '../../server/plugins/socket-events.js')
      const content = fs.readFileSync(eventsPath, 'utf-8')
      
      // v2形式の部屋管理
      expect(content).toContain('socket.join(roomId)')
      expect(content).toContain('socket.leave(roomId)')
      expect(content).toContain('socket.broadcast.to(roomId)')
    })
  })
})