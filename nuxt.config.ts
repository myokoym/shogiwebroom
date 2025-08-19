import { defineNuxtConfig } from '@nuxt/bridge'

export default defineNuxtConfig({
  // Nuxt Bridge設定
  bridge: {
    vite: false, // Viteを無効化（crypto.hash問題回避）
    nitro: false, // Nitroも一時的に無効化
    typescript: true,
    composition: true,
    meta: true // useMetaサポート
  },
  
  // Vite設定（bridge.vite: falseのため現在無効）
  // vite: {
  //   optimizeDeps: {
  //     include: [
  //       'socket.io-client',
  //       'bootstrap-vue',
  //       'moment',
  //       'crypto-random-string'
  //     ]
  //   },
  //   build: {
  //     rollupOptions: {
  //       output: {
  //         manualChunks: {
  //           'vendor': ['vue', 'vuex', 'pinia'],
  //           'socket': ['socket.io-client', 'engine.io-client'],
  //           'ui': ['bootstrap-vue']
  //         }
  //       }
  //     }
  //   }
  // },

  // Nitro設定（bridge.nitro: falseのため現在無効）
  // nitro: {
  //   experimental: {
  //     websocket: false
  //   }
  // },

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
  plugins: [
    { src: '~/plugins/pinia.js' },
    { src: '~/plugins/socket.client.js', mode: 'client' }
  ],

  // ビルドモジュール（開発時のみ）
  buildModules: [],

  // Nuxtモジュール
  modules: [
    'bootstrap-vue/nuxt',
    // '@pinia/nuxt', // Nuxt 2では直接インポートが必要
  ],

  // ビルド設定
  build: {
    // Socket.IOクライアントをベンダーバンドルに含める
    vendor: [
      'socket.io-client'
    ],
    
    // トランスパイル設定（ES2020榹文をサポート）
    transpile: [
      'pinia',
      '@vue/devtools-api',
      '@vue/devtools-kit',
      'birpc'
    ],
    
    // Webpack設定の拡張
    extend(config: any, ctx: any) {
      // babel-loaderにオプショナルチェーン構文のサポートを追加
      config.module.rules.forEach((rule: any) => {
        if (rule.test && rule.test.toString().includes('m?js')) {
          if (rule.exclude) {
            rule.exclude = /node_modules\/(?!(pinia|@vue\/devtools-api|@vue\/devtools-kit|birpc))/
          }
        }
      })
      
      // Webpack aliasを設定してdevtoolsを無効化
      config.resolve.alias = config.resolve.alias || {}
      const path = require('path')
      config.resolve.alias['@vue/devtools-api'] = path.resolve(__dirname, 'stubs/devtools-stub.js')
      
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