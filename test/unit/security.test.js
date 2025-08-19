// セキュリティミドルウェアのテスト
describe('Security Middleware', () => {
  let securityMiddleware
  let req, res, next
  
  beforeEach(() => {
    // ミドルウェアをインポート
    securityMiddleware = require('../../server/middleware/security.js')
    
    // モックオブジェクトを作成
    req = {
      headers: {}
    }
    
    res = {
      headers: {},
      setHeader: jest.fn((name, value) => {
        res.headers[name] = value
      })
    }
    
    next = jest.fn()
  })
  
  describe('Security Headers', () => {
    it('should set Content-Security-Policy header', () => {
      securityMiddleware(req, res, next)
      
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expect.stringContaining("default-src 'self'")
      )
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expect.stringContaining("connect-src 'self' ws: wss:")
      )
    })
    
    it('should set X-Frame-Options header', () => {
      securityMiddleware(req, res, next)
      
      expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'SAMEORIGIN')
    })
    
    it('should set X-Content-Type-Options header', () => {
      securityMiddleware(req, res, next)
      
      expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
    })
    
    it('should set X-XSS-Protection header', () => {
      securityMiddleware(req, res, next)
      
      expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block')
    })
    
    it('should set Referrer-Policy header', () => {
      securityMiddleware(req, res, next)
      
      expect(res.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin')
    })
    
    it('should set Permissions-Policy header', () => {
      securityMiddleware(req, res, next)
      
      expect(res.setHeader).toHaveBeenCalledWith(
        'Permissions-Policy',
        'geolocation=(), microphone=(), camera=()'
      )
    })
    
    it('should call next() function', () => {
      securityMiddleware(req, res, next)
      
      expect(next).toHaveBeenCalled()
    })
  })
  
  describe('HTTPS-only Headers', () => {
    it('should set HSTS header when using HTTPS', () => {
      req.headers['x-forwarded-proto'] = 'https'
      
      securityMiddleware(req, res, next)
      
      expect(res.setHeader).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains'
      )
    })
    
    it('should not set HSTS header when using HTTP', () => {
      req.headers['x-forwarded-proto'] = 'http'
      
      securityMiddleware(req, res, next)
      
      expect(res.setHeader).not.toHaveBeenCalledWith(
        'Strict-Transport-Security',
        expect.any(String)
      )
    })
  })
})