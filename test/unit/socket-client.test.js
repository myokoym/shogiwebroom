// Socket.IOクライアントv4のテスト
describe('Socket.IO Client v4', () => {
  describe('Client Plugin', () => {
    it('should have socket.client plugin files', () => {
      const fs = require('fs')
      const path = require('path')
      
      const jsPath = path.join(__dirname, '../../plugins/socket.client.js')
      const tsPath = path.join(__dirname, '../../plugins/socket.client.ts')
      
      expect(fs.existsSync(jsPath)).toBe(true)
      expect(fs.existsSync(tsPath)).toBe(true)
    })
    
    it('should export Nuxt plugin', () => {
      const fs = require('fs')
      const path = require('path')
      
      const jsPath = path.join(__dirname, '../../plugins/socket.client.js')
      const content = fs.readFileSync(jsPath, 'utf-8')
      
      expect(content).toContain('export default')
      expect(content).toContain('inject')
      expect(content).toContain('socket.io-client')
      expect(content).toContain('connect_error')
    })
    
    it('should have v4 connection configuration', () => {
      const fs = require('fs')
      const path = require('path')
      
      const jsPath = path.join(__dirname, '../../plugins/socket.client.js')
      const content = fs.readFileSync(jsPath, 'utf-8')
      
      // v4特有の設定が含まれているか確認
      expect(content).toContain('autoConnect')
      expect(content).toContain('reconnectionAttempts')
      expect(content).toContain('reconnectionDelay')
      expect(content).toContain('transports')
    })
  })
  
  describe('Store Plugin', () => {
    it('should have socket-plugin.js file', () => {
      const fs = require('fs')
      const path = require('path')
      
      const pluginPath = path.join(__dirname, '../../store/socket-plugin.js')
      expect(fs.existsSync(pluginPath)).toBe(true)
    })
    
    it('should use Socket.IO v4 client', () => {
      const fs = require('fs')
      const path = require('path')
      
      const pluginPath = path.join(__dirname, '../../store/socket-plugin.js')
      const content = fs.readFileSync(pluginPath, 'utf-8')
      
      // Socket.IO v4のインポート
      expect(content).toContain("import { io } from 'socket.io-client'")
      // v4の設定
      expect(content).toContain('Socket.IO v4')
    })
    
    it('should handle all required events', () => {
      const fs = require('fs')
      const path = require('path')
      
      const pluginPath = path.join(__dirname, '../../store/socket-plugin.js')
      const content = fs.readFileSync(pluginPath, 'utf-8')
      
      // 送信イベント
      expect(content).toContain("emit('send'")
      expect(content).toContain("emit('enterRoom'")
      expect(content).toContain("emit('sendComment'")
      expect(content).toContain("emit('sendMove'")
      
      // 受信イベント
      expect(content).toContain("on('update'")
      expect(content).toContain("on('receiveComment'")
      expect(content).toContain("on('receiveMove'")
      expect(content).toContain("on('connect'")
      expect(content).toContain("on('connect_error'")
    })
    
    it('should prevent duplicate event listeners', () => {
      const fs = require('fs')
      const path = require('path')
      
      const pluginPath = path.join(__dirname, '../../store/socket-plugin.js')
      const content = fs.readFileSync(pluginPath, 'utf-8')
      
      // リスナーの削除処理があることを確認
      expect(content).toContain("socket.off('update')")
      expect(content).toContain("socket.off('receiveComment')")
      expect(content).toContain("socket.off('receiveMove')")
    })
  })
  
  describe('Error Handling', () => {
    it('should have error handling in client', () => {
      const fs = require('fs')
      const path = require('path')
      
      const jsPath = path.join(__dirname, '../../plugins/socket.client.js')
      const content = fs.readFileSync(jsPath, 'utf-8')
      
      expect(content).toContain("on('connect_error'")
      expect(content).toContain("on('error'")
      expect(content).toContain("on('reconnect_error'")
      expect(content).toContain("on('reconnect_failed'")
    })
  })
  
  describe('Reconnection Logic', () => {
    it('should have reconnection handling', () => {
      const fs = require('fs')
      const path = require('path')
      
      const jsPath = path.join(__dirname, '../../plugins/socket.client.js')
      const content = fs.readFileSync(jsPath, 'utf-8')
      
      expect(content).toContain("on('reconnect'")
      expect(content).toContain("on('reconnect_attempt'")
      expect(content).toContain('reconnectionAttempts: 5')
      expect(content).toContain('reconnectionDelay: 1000')
      expect(content).toContain('reconnectionDelayMax: 5000')
    })
    
    it('should rejoin room on reconnection', () => {
      const fs = require('fs')
      const path = require('path')
      
      const jsPath = path.join(__dirname, '../../plugins/socket.client.js')
      const content = fs.readFileSync(jsPath, 'utf-8')
      
      // 再接続時に部屋に再参加する処理
      expect(content).toContain("emit('enterRoom', roomId)")
    })
  })
})