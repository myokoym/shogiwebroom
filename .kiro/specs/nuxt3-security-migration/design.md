# 技術設計書

## 概要
本設計書は、ShogiWebroomアプリケーションをNuxt 2からNuxt 3へ段階的に移行するための技術的アプローチを詳述します。Nuxt Bridgeを使用した移行戦略により、既存機能を維持しながらセキュリティ脆弱性を解消し、最新のVue 3エコシステムへの移行を実現します。

## アーキテクチャ設計

### 現状アーキテクチャ（Nuxt 2）
```
┌─────────────────────────────────────────────────┐
│                   Client Browser                 │
├─────────────────────────────────────────────────┤
│              Nuxt 2 + Vue 2 Frontend             │
│              - Bootstrap Vue                     │
│              - Socket.IO Client v2               │
└─────────────────────────────────────────────────┘
                           ↓↑
┌─────────────────────────────────────────────────┐
│              Express + Nuxt 2 SSR               │
│              - Socket.IO Server v2               │
│              - Webpack 4 Build                   │
└─────────────────────────────────────────────────┘
                           ↓↑
┌─────────────────────────────────────────────────┐
│                   Redis Store                    │
└─────────────────────────────────────────────────┘
```

### 目標アーキテクチャ（Nuxt 3）
```
┌─────────────────────────────────────────────────┐
│                   Client Browser                 │
├─────────────────────────────────────────────────┤
│              Nuxt 3 + Vue 3 Frontend             │
│              - Vue 3 Compatible UI               │
│              - Socket.IO Client v4               │
└─────────────────────────────────────────────────┘
                           ↓↑
┌─────────────────────────────────────────────────┐
│              Nitro Server Engine                 │
│              - Socket.IO Server v4               │
│              - Vite Build System                  │
└─────────────────────────────────────────────────┘
                           ↓↑
┌─────────────────────────────────────────────────┐
│                   Redis Store                    │
└─────────────────────────────────────────────────┘
```

## 移行戦略

### フェーズ1: Nuxt Bridge導入（要件1対応）

#### 1.1 環境準備
```json
// package.json
{
  "dependencies": {
    "nuxt": "npm:nuxt3@latest",
    "@nuxt/bridge": "npm:@nuxt/bridge@latest"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### 1.2 設定移行
```typescript
// nuxt.config.ts (TypeScript化)
import { defineNuxtConfig } from '@nuxt/bridge'

export default defineNuxtConfig({
  bridge: {
    vite: false, // 初期は無効化
    nitro: true,
    typescript: true,
    composition: true
  },
  // 既存の設定を段階的に移行
})
```

#### 1.3 互換性レイヤー
- Vue 2/3 両方のAPIをサポート
- Options APIとComposition APIの共存
- 段階的なTypeScript導入

### フェーズ2: セキュリティ強化（要件2対応）

#### 2.1 依存関係の更新戦略
```bash
# 脆弱性スキャンと修正
npm audit fix --force
npm update --save

# 主要パッケージの更新
- nuxt: 2.18.1 → 3.x
- socket.io: 2.5.1 → 4.x
- bootstrap-vue: 2.13.1 → @bootstrap-vue-next/bootstrap-vue-next
- express: 4.16.4 → 4.21.x
```

#### 2.2 セキュリティポリシー実装
```typescript
// server/middleware/security.ts
export default defineEventHandler((event) => {
  // CSPヘッダー設定
  setHeader(event, 'Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' wss://*"
  ].join('; '))
  
  // その他のセキュリティヘッダー
  setHeader(event, 'X-Frame-Options', 'SAMEORIGIN')
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
})
```

### フェーズ3: Socket.IO v4移行（要件3対応）

#### 3.1 後方互換性の確保
```typescript
// server/socket/compatibility.ts
import { Server as SocketIOServer } from 'socket.io'

export function createSocketServer(nuxtApp: any) {
  const io = new SocketIOServer(nuxtApp.server, {
    // v2クライアントとの互換性
    allowEIO3: true,
    cors: {
      origin: true,
      credentials: true
    }
  })
  
  // 既存のイベントハンドラー維持
  io.on('connection', (socket) => {
    // 既存のロジックを維持
    socket.on('enterRoom', handleEnterRoom)
    socket.on('send', handleSend)
    socket.on('sendComment', handleSendComment)
    socket.on('sendMove', handleSendMove)
  })
  
  return io
}
```

#### 3.2 クライアント側の段階的更新
```typescript
// plugins/socket.client.ts
import { io } from 'socket.io-client'

export default defineNuxtPlugin(() => {
  const socket = io({
    // 自動再接続戦略
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  })
  
  return {
    provide: {
      socket
    }
  }
})
```

### フェーズ4: Vue 3移行（要件4対応）

#### 4.1 コンポーネント移行戦略
```typescript
// 移行前（Vue 2 Options API）
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}

// 移行後（Vue 3 Composition API）
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++
</script>
```

#### 4.2 Vuex → Pinia移行
```typescript
// stores/sfen.ts (Pinia)
export const useSfenStore = defineStore('sfen', () => {
  const board = ref(initialBoard())
  const turn = ref('b')
  
  const movePiece = (from: Position, to: Position) => {
    // 移動ロジック
  }
  
  return { board, turn, movePiece }
})
```

#### 4.3 Bootstrap Vue Next移行
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@bootstrap-vue-next/nuxt'
  ],
  css: ['bootstrap/dist/css/bootstrap.min.css']
})
```

### フェーズ5: ビルドシステム移行（要件5対応）

#### 5.1 Vite設定
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    optimizeDeps: {
      include: ['socket.io-client', 'moment']
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'socket': ['socket.io-client'],
            'ui': ['@bootstrap-vue-next/bootstrap-vue-next']
          }
        }
      }
    }
  }
})
```

#### 5.2 Docker環境更新
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/.output .output
COPY --from=builder /app/node_modules node_modules

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

#### 5.3 CI/CDパイプライン更新
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
```

### フェーズ6: テスト戦略（要件6対応）

#### 6.1 テストフレームワーク更新
```json
// package.json
{
  "devDependencies": {
    "@nuxt/test-utils": "^3.x",
    "@vue/test-utils": "^2.x",
    "vitest": "^1.x",
    "@playwright/test": "^1.x"
  }
}
```

#### 6.2 ユニットテスト移行
```typescript
// test/unit/components/Shogiboard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Shogiboard from '~/components/Shogiboard.vue'

describe('Shogiboard', () => {
  it('初期盤面が正しく表示される', () => {
    const wrapper = mount(Shogiboard)
    expect(wrapper.findAll('.piece')).toHaveLength(40)
  })
})
```

#### 6.3 E2Eテスト維持
```typescript
// test/e2e/room.spec.ts
import { test, expect } from '@playwright/test'

test('複数ユーザーが同じ部屋に入室できる', async ({ page, context }) => {
  const page2 = await context.newPage()
  
  await page.goto('/rooms/test-room')
  await page2.goto('/rooms/test-room')
  
  // ユーザー1が駒を動かす
  await page.dragAndDrop('.piece-7g', '.square-7f')
  
  // ユーザー2の画面で同期を確認
  await expect(page2.locator('.square-7f .piece')).toBeVisible()
})
```

### フェーズ7: パフォーマンス最適化（要件7対応）

#### 7.1 バンドル最適化
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: false
    },
    compressPublicAssets: true
  },
  
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true
  }
})
```

#### 7.2 画像最適化
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/image'],
  image: {
    formats: ['webp', 'avif', 'jpeg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280
    }
  }
})
```

#### 7.3 パフォーマンスモニタリング
```typescript
// plugins/performance.client.ts
export default defineNuxtPlugin(() => {
  if (process.client) {
    // Web Vitals測定
    onCLS((metric) => console.log('CLS:', metric.value))
    onFID((metric) => console.log('FID:', metric.value))
    onLCP((metric) => console.log('LCP:', metric.value))
  }
})
```

### フェーズ8: ドキュメンテーション（要件8対応）

#### 8.1 移行ガイド構造
```
docs/
├── migration/
│   ├── 01-getting-started.md
│   ├── 02-nuxt-bridge.md
│   ├── 03-vue3-components.md
│   ├── 04-socket-io.md
│   └── 05-deployment.md
├── api/
│   ├── composables.md
│   └── server-api.md
└── troubleshooting.md
```

#### 8.2 コード例とベストプラクティス
```markdown
# docs/migration/03-vue3-components.md

## コンポーネント移行チェックリスト

- [ ] `<script setup>` 構文への移行
- [ ] `v-model` の変更対応
- [ ] `$listeners` → `$attrs` への統合
- [ ] `<transition>` クラス名の変更
- [ ] カスタムディレクティブの更新
```

## 実装スケジュール

### タイムライン
```mermaid
gantt
    title Nuxt 3移行スケジュール
    dateFormat  YYYY-MM-DD
    
    section フェーズ1
    Nuxt Bridge導入    :2025-08-20, 3d
    
    section フェーズ2
    セキュリティ更新    :2025-08-23, 2d
    
    section フェーズ3
    Socket.IO v4移行   :2025-08-25, 3d
    
    section フェーズ4
    Vue 3コンポーネント :2025-08-28, 4d
    
    section フェーズ5
    ビルドシステム     :2025-09-01, 2d
    
    section フェーズ6
    テスト整備        :2025-09-03, 2d
    
    section フェーズ7
    パフォーマンス    :2025-09-05, 2d
    
    section フェーズ8
    ドキュメント      :2025-09-07, 2d
```

## リスク管理

### 技術的リスク
1. **Bootstrap Vue互換性**
   - リスク: Bootstrap Vue Nextは完全な互換性を提供しない
   - 対策: 段階的移行とカスタムコンポーネント作成

2. **Socket.IO後方互換性**
   - リスク: v2クライアントとの接続問題
   - 対策: allowEIO3オプションとフォールバック実装

3. **Vuexストア移行**
   - リスク: 複雑な状態管理ロジックの破損
   - 対策: 段階的なPinia移行と並行運用期間

### 運用リスク
1. **ダウンタイム**
   - リスク: デプロイ時のサービス停止
   - 対策: Blue-Greenデプロイメント戦略

2. **パフォーマンス劣化**
   - リスク: 初期バンドルサイズの増加
   - 対策: コード分割と遅延ローディング

## 成功指標

### 技術指標
- セキュリティ脆弱性: 80%以上削減
- ビルド時間: 50%短縮（Vite採用により）
- バンドルサイズ: 20%以内の増加に抑制
- テストカバレッジ: 80%以上維持

### ユーザー体験指標
- 初期表示時間: 3秒以内
- WebSocket接続遅延: 100ms以内
- エラー率: 0.1%以下

## 承認事項

### 前提条件
- Node.js 18以上の環境が利用可能
- 開発チームがVue 3/Nuxt 3の基本知識を習得
- 段階的移行期間中の並行開発体制確立

### 制約事項
- 既存のURLパスとAPI互換性の維持
- Redis接続プロトコルの変更不可
- 既存ユーザーデータの完全保持

## 次のステップ
1. 要件と設計のレビュー・承認
2. 開発環境でのNuxt Bridge導入検証
3. 実装タスクの詳細化と優先順位付け
4. 移行開始とフェーズ1の実装