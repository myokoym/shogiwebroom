import type { IncomingMessage, ServerResponse } from 'http'

// セキュリティヘッダーを設定するミドルウェア
export default function securityMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
  // Content Security Policy (CSP)
  // Socket.IOとWebSocketの通信を許可しつつセキュリティを確保
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Socket.IOのインラインスクリプト用
    "style-src 'self' 'unsafe-inline' https://stackpath.bootstrapcdn.com", // Bootstrap CSS
    "img-src 'self' data: https:", // 画像
    "font-src 'self' data:", // フォント
    "connect-src 'self' ws: wss:", // WebSocket接続
    "media-src 'self'", // 音声ファイル
    "object-src 'none'",
    "frame-ancestors 'none'"
  ]
  
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '))
  
  // その他のセキュリティヘッダー
  res.setHeader('X-Frame-Options', 'SAMEORIGIN') // クリックジャッキング対策
  res.setHeader('X-Content-Type-Options', 'nosniff') // MIMEタイプスニッフィング防止
  res.setHeader('X-XSS-Protection', '1; mode=block') // XSS保護（レガシーブラウザ用）
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin') // リファラー制御
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()') // 権限ポリシー
  
  // HTTPS環境でのみHSTSを有効化
  if (req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  next()
}

// Nuxt 3/Nitro用のエクスポート（将来の互換性のため）
export function defineSecurityHeaders(event: any) {
  const headers = event.node?.res || event.res
  if (!headers) return
  
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://stackpath.bootstrapcdn.com",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' ws: wss:",
    "media-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'"
  ]
  
  headers.setHeader('Content-Security-Policy', cspDirectives.join('; '))
  headers.setHeader('X-Frame-Options', 'SAMEORIGIN')
  headers.setHeader('X-Content-Type-Options', 'nosniff')
  headers.setHeader('X-XSS-Protection', '1; mode=block')
  headers.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
}