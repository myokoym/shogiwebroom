# Project Structure

## Root Directory Organization
```
shogiwebroom/
├── .nuxt/              # Build output (gitignored)
├── assets/             # Uncompiled assets (images, audio)
├── components/         # Vue components
├── layouts/            # Nuxt layout templates
├── middleware/         # Nuxt middleware
├── pages/              # Vue pages (routes)
├── plugins/            # Vue plugins
├── server/             # Express server code
├── static/             # Static files (served directly)
├── store/              # Vuex store modules
├── nuxt.config.js      # Nuxt configuration
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```

## Subdirectory Structures

### `/assets/`
静的アセットの管理
```
assets/
├── audio/
│   └── komaoto1.mp3    # 駒音効果音
└── images/
    ├── logo.png         # アプリケーションロゴ
    └── [font-name]/     # 駒画像セット（5種類）
        ├── b/           # 先手（黒）の駒
        ├── w/           # 後手（白）の駒
        ├── blank.png    # 空白マス
        └── hatena.png   # 不明な駒
```

### `/components/`
再利用可能なVueコンポーネント
```
components/
├── Chat.vue         # チャット機能
├── Hand.vue         # 手番表示
├── Kif.vue          # 棋譜表示・管理
├── Option.vue       # オプション設定
├── Piece.vue        # 駒コンポーネント
├── Shogiboard.vue   # 将棋盤メイン
├── Stock.vue        # 持ち駒表示
└── Usage.vue        # 使い方説明
```

### `/pages/`
ルーティングとページコンポーネント
```
pages/
├── index.vue        # トップページ
└── rooms/
    └── _id.vue      # 動的ルーム (/rooms/:id)
```

### `/server/`
バックエンドサーバー実装
```
server/
└── index.js         # Express + Socket.IO サーバー
```

### `/store/`
Vuex状態管理モジュール
```
store/
├── index.js         # ストアのルート
├── chat.js          # チャット状態
├── kif.js           # 棋譜状態
├── option.js        # オプション状態
└── sfen.js          # SFEN形式の盤面状態
```

### `/static/`
静的ファイル（直接配信）
```
static/
├── favicon.ico            # ファビコン
├── apple-touch-icon.png   # iOS用アイコン
├── logo.png               # ロゴ画像
├── logo-twitter-card.png  # Twitter Card用画像
└── robots.txt             # クローラー設定
```

## Code Organization Patterns

### Component Structure
- **単一ファイルコンポーネント**: `.vue` ファイルで template/script/style を統合
- **Props による通信**: 親子コンポーネント間のデータ受け渡し
- **Event による通知**: 子から親への状態変更通知

### State Management
- **Vuex モジュール**: 機能ごとに分割された状態管理
- **Actions**: 非同期処理とSocket.IO通信
- **Mutations**: 状態の同期的更新
- **Getters**: 算出プロパティ

### Server Architecture
- **Socket.IO イベント**: `enterRoom`, `send`, `sendComment`, `sendMove`
- **Redis 統合**: 部屋の状態永続化
- **Express ミドルウェア**: Nuxt.jsのSSR統合

## File Naming Conventions
- **Vue コンポーネント**: PascalCase (例: `Shogiboard.vue`)
- **JavaScript モジュール**: camelCase (例: `index.js`)
- **設定ファイル**: kebab-case または dotfile (例: `nuxt.config.js`)
- **画像アセット**: 駒は大文字/小文字で先手/後手を区別
  - 先手: 大文字 (例: `K.png` = 王将)
  - 後手: 小文字 (例: `k.png` = 玉将)
  - 成駒: アンダースコア付き (例: `_P.png` = と金)

## Import Organization
```javascript
// 1. Node modules
const express = require('express')
const { Nuxt, Builder } = require('nuxt')

// 2. Local modules
const config = require('../nuxt.config.js')

// 3. Vue imports (in .vue files)
import Component from '~/components/Component.vue'
```

## Key Architectural Principles
- **リアルタイムファースト**: すべての操作は即座に同期
- **ステートレスサーバー**: Redis に状態を外部化
- **コンポーネント分離**: UI要素は独立したコンポーネント
- **レスポンシブ設計**: モバイルファーストのUI実装
- **プログレッシブエンハンスメント**: 基本機能から段階的に機能追加