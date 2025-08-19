import { defineNuxtConfig } from '@nuxt/bridge'

export default defineNuxtConfig({
  // Nuxt Bridge設定
  bridge: {
    vite: false, // 初期は無効化（後で有効化）
    nitro: true,
    typescript: true,
    composition: true,
    meta: true // useMetaサポート
  },

  // Nitro設定（実験的WebSocketは使用しない）
  nitro: {
    experimental: {
      websocket: false
    }
  },

  // SSRモード（universalは廃止予定）
  ssr: true,

  // ページのメタ情報
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
  },

  // プログレスバーの色
  loading: { color: '#fff' },

  // グローバルCSS
  css: [],

  // プラグイン
  plugins: [],

  // ビルドモジュール（開発時のみ）
  buildModules: [],

  // Nuxtモジュール
  modules: [
    'bootstrap-vue/nuxt',
  ],

  // ビルド設定
  build: {
    // Socket.IOクライアントをベンダーバンドルに含める
    vendor: [
      'socket.io-client'
    ],
    
    // Webpack設定の拡張
    extend(config: any, ctx: any) {
      // オーディオファイルのローダー設定
      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      })
    }
  }
})