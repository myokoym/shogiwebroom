// Nuxt 3 configuration
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 開発ツール
  devtools: { enabled: true },
  
  // TypeScript
  typescript: {
    strict: false, // 一旦falseで移行を容易に
    shim: false
  },

  // SSRモード
  ssr: true,

  // アプリケーション設定
  app: {
    head: {
      title: '将棋ウェブルーム',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          hid: 'description', 
          name: 'description', 
          content: 'リアルタイムで同期する将棋盤を複数人が自由に操作できるWebアプリ。自由対局や感想戦、研究会などに。ドラッグ＆ドロップ対応。スマートフォン、タブレット対応（レスポンシブ）。SFEN形式（USI）入出力対応。' 
        },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@shogiwebroom' },
        { property: 'og:url', content: 'https://shogiwebroom.herokuapp.com/' },
        { property: 'og:title', content: '将棋ウェブルーム' },
        { 
          property: 'og:description', 
          content: 'ブラウザで気軽に将棋盤を囲めるWebアプリ。ログイン不要、URL共有で何人でも入室可。リアルタイム同期、ドラッグ＆ドロップ対応、スマートフォン・タブレット対応、簡易チャット機能などが特徴。研究会などにお使いください。' 
        },
        { property: 'og:image', content: 'https://shogiwebroom.herokuapp.com/logo-twitter-card.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ]
    }
  },

  // CSS
  css: [
    // グローバルCSS
  ],

  // プラグイン
  plugins: [
    { src: '~/plugins/socket.client.js', mode: 'client' }
  ],

  // モジュール
  modules: [
    '@pinia/nuxt'
  ],

  // Pinia設定
  pinia: {
    storesDirs: ['./stores/**']
  },

  // Vite設定
  vite: {
    optimizeDeps: {
      include: [
        'socket.io-client',
        'moment',
        'crypto-random-string'
      ]
    },
    resolve: {
      alias: {
        // エイリアス設定
      }
    }
  },

  // Nitro設定（サーバー）
  nitro: {
    experimental: {
      websocket: false // WebSocket問題があるため無効化
    }
  },

  // 互換性設定
  compatibilityDate: '2025-01-01'
})