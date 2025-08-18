# Implementation Plan

## 必須タスク（実装時間: 1-2日）

### 基本テスト環境構築

- [ ] 1. Jest環境の初期設定
  - Jest 26.x と @vue/test-utils をインストール
  - jest.config.js を作成（Nuxt.js 2.x互換設定）
  - test/ ディレクトリ構造を作成
  - _実装時間: 30分_

- [ ] 2. Docker Compose テスト設定
  - compose.test.yaml を作成（シンプルな1コンテナ構成）
  - 既存の Dockerfile.dev を活用
  - test:quick スクリプトを追加
  - _実装時間: 20分_

### コアテスト実装

- [ ] 3. ビルドテストの作成
  - scripts/test-build.js でビルド検証
  - ビルド成功/失敗の確認のみ
  - _実装時間: 20分_

- [ ] 4. Redis接続テストの作成
  - scripts/test-redis.js で接続確認
  - ping/pong の基本テストのみ
  - _実装時間: 20分_

- [ ] 5. WebSocket基本接続テスト
  - test/integration/websocket.test.js を作成
  - Socket.IOクライアントで接続確認
  - 1クライアントの接続/切断テスト
  - _実装時間: 30分_

### 最小限のE2Eテスト

- [ ] 6. Playwright基本設定
  - @playwright/test をインストール
  - playwright.config.js を作成（最小設定）
  - _実装時間: 20分_

- [ ] 7. ルーム作成テスト
  - test/e2e/room.spec.js を作成
  - ルーム作成と入室の基本フロー
  - _実装時間: 30分_

- [ ] 8. 駒移動同期テスト
  - test/e2e/sync.spec.js を作成
  - 2つのブラウザで駒移動の同期確認
  - _実装時間: 30分_

### CI/CD統合

- [ ] 9. GitHub Actions設定
  - .github/workflows/test.yml を作成
  - プルリクエスト時に自動実行
  - Docker Compose でテスト実行
  - _実装時間: 20分_

- [ ] 10. npm scripts設定
  - package.json にテストコマンド追加
  - test:quick（全テスト1分以内）
  - test:unit, test:e2e の個別実行
  - _実装時間: 10分_

## オプショナルタスク（必要に応じて追加）

### コンポーネントテスト
- [ ] 主要Vueコンポーネントのマウントテスト（Shogiboard.vue）
- [ ] 最小限のスナップショットテスト

### カバレッジ設定
- [ ] Jest カバレッジレポート設定（目標50%）
- [ ] カバレッジ結果の簡易表示

## 成功指標

- **全テスト実行時間**: <1分
- **ユニットテスト**: <10秒
- **統合テスト**: <20秒
- **E2Eテスト**: <30秒
- **カバレッジ**: ≥50%（主要コードのみ）

## 実装順序

1. **Day 1 AM**: タスク1-5（基本環境とコアテスト）
2. **Day 1 PM**: タスク6-8（E2Eテスト）
3. **Day 2 AM**: タスク9-10（CI/CD統合）
4. **Day 2 PM**: 動作確認と調整

## 削除した機能

以下の大規模機能は小規模システムには不要と判断：

- TestContainers（動的Redis環境）
- Artillery.io（負荷テスト）
- Page Object Pattern（複雑なE2E構造）
- EventTester/ReconnectingWebSocketTester（高度なWebSocketテスト）
- Allureレポート（詳細なレポート生成）
- Mock Service Worker（高度なモック）
- メモリリーク検出
- 並列実行最適化
- 複数コンテナでのテスト分離

これらの機能は、システムが成長した際に必要に応じて追加可能です。