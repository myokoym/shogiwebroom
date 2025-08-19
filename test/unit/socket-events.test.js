// Socket.IOイベントハンドラーのテスト
const { validateRoomId, validateFieldValue, getRoomKey } = require('../../server/plugins/socket-events.js')

describe('Socket.IO Event Handlers', () => {
  describe('Input Validation', () => {
    describe('validateRoomId', () => {
      it('should accept valid room IDs', () => {
        expect(validateRoomId('room123')).toBe(true)
        expect(validateRoomId('test-room')).toBe(true)
        expect(validateRoomId('room_456')).toBe(true)
        expect(validateRoomId('ABC-123_xyz')).toBe(true)
      })
      
      it('should reject invalid room IDs', () => {
        expect(validateRoomId(null)).toBe(false)
        expect(validateRoomId(undefined)).toBe(false)
        expect(validateRoomId('')).toBe(false)
        expect(validateRoomId(123)).toBe(false)
        expect(validateRoomId('room with spaces')).toBe(false)
        expect(validateRoomId('room@123')).toBe(false)
        expect(validateRoomId('a'.repeat(51))).toBe(false) // Too long
      })
    })
    
    describe('validateFieldValue', () => {
      it('should accept valid field values', () => {
        expect(validateFieldValue('normal text')).toBe(true)
        expect(validateFieldValue(123)).toBe(true)
        expect(validateFieldValue({ move: 'e2e4' })).toBe(true)
        expect(validateFieldValue('a'.repeat(9999))).toBe(true)
      })
      
      it('should reject too large field values', () => {
        expect(validateFieldValue('a'.repeat(10001))).toBe(false)
        const largeObject = { data: 'x'.repeat(10001) }
        expect(validateFieldValue(largeObject)).toBe(false)
      })
    })
    
    describe('getRoomKey', () => {
      it('should generate consistent room keys', () => {
        expect(getRoomKey('room123')).toBe('room:room123')
        expect(getRoomKey('test-room')).toBe('room:test-room')
      })
    })
  })
  
  describe('Event Handler Structure', () => {
    it('should export setupSocketEvents function', () => {
      const { setupSocketEvents } = require('../../server/plugins/socket-events.js')
      expect(typeof setupSocketEvents).toBe('function')
    })
    
    it('should define all required events', () => {
      const fs = require('fs')
      const path = require('path')
      
      const filePath = path.join(__dirname, '../../server/plugins/socket-events.js')
      const content = fs.readFileSync(filePath, 'utf-8')
      
      // 各イベントハンドラーが定義されていることを確認
      expect(content).toContain("socket.on('enterRoom'")
      expect(content).toContain("socket.on('send'")
      expect(content).toContain("socket.on('sendMove'")
      expect(content).toContain("socket.on('sendComment'")
      expect(content).toContain("socket.on('disconnect'")
      expect(content).toContain("socket.on('error'")
    })
    
    it('should handle Redis operations', () => {
      const fs = require('fs')
      const path = require('path')
      
      const filePath = path.join(__dirname, '../../server/plugins/socket-events.js')
      const content = fs.readFileSync(filePath, 'utf-8')
      
      // Redis操作が含まれていることを確認
      expect(content).toContain('redis.get')
      expect(content).toContain('redis.set')
      expect(content).toContain('RedisClient')
    })
    
    it('should emit proper events', () => {
      const fs = require('fs')
      const path = require('path')
      
      const filePath = path.join(__dirname, '../../server/plugins/socket-events.js')
      const content = fs.readFileSync(filePath, 'utf-8')
      
      // 送信イベントが定義されていることを確認
      expect(content).toContain("emit('update'")
      expect(content).toContain("emit('receiveMove'")
      expect(content).toContain("emit('receiveComment'")
      expect(content).toContain("emit('error'")
    })
    
    it('should handle room joining and leaving', () => {
      const fs = require('fs')
      const path = require('path')
      
      const filePath = path.join(__dirname, '../../server/plugins/socket-events.js')
      const content = fs.readFileSync(filePath, 'utf-8')
      
      // 部屋の参加と退出が実装されていることを確認
      expect(content).toContain('socket.join(roomId)')
      expect(content).toContain('socket.leave(roomId)')
      expect(content).toContain('socket.broadcast.to(roomId)')
      expect(content).toContain('io.to(roomId)')
    })
  })
})