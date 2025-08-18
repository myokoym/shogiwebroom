# Implementation Plan

## フェーズ1: テスト基盤の構築（1-2週間）

### Playwright環境セットアップ

- [ ] 1. Playwright と関連パッケージのインストール
  - package.jsonにPlaywright v1.51.1を追加
  - @playwright/testパッケージを追加
  - playwright.config.tsファイルを作成
  - WebSocket Route API設定を含む基本設定を実装
  - _Requirements: 全要件の基盤構築_

- [ ] 2. Jest環境の初期設定
  - Jest 26.x関連の依存関係を追加（jest, @vue/test-utils, jest-serializer-vue）
  - jest.config.jsファイルを作成し、Nuxt.js 2.xとの互換性設定を実装
  - test/unit/ディレクトリ構造を作成
  - テストヘルパーファイル（test/helpers/setup.js）を作成
  - _Requirements: 5.1, 5.2_

### Docker環境構築

- [ ] 3. Docker Compose テスト設定ファイルの作成
  - compose.test.yamlを作成し、test-orchestratorサービスを定義
  - Dockerfile.testを作成し、Playwright対応環境を構築
  - playwright-cacheボリュームを設定（ブラウザキャッシュ用）
  - Artillery.io用のtest-loadサービスを追加
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 4. TestContainersの統合
  - testcontainersパッケージを追加
  - scripts/test-containers.jsでRedis動的環境構築スクリプトを作成
  - ポート競合回避のための動的ポート割り当てを実装
  - ヘルスチェック機能を追加
  - _Requirements: 4.1, 4.2_

### WebSocketテストユーティリティ

- [ ] 5. EventTesterクラスの実装
  - test/utils/EventTester.jsを作成
  - captureEvents()メソッドで非同期イベントキャプチャを実装
  - verifyEventSequence()でイベント順序検証を実装
  - waitForEvent()で単一イベント待機を実装
  - _Requirements: 6.1, 6.2_

- [ ] 6. ReconnectingWebSocketTesterクラスの実装
  - test/utils/ReconnectingWebSocketTester.jsを作成
  - testReconnection()で再接続ロジックテストを実装
  - simulateNetworkFailure()でネットワーク障害シミュレーションを実装
  - verifyReconnectStrategy()で再接続戦略検証を実装
  - _Requirements: 6.2, 6.4_

## フェーズ2: コアテスト実装（2-3週間）

### ビルドテストの実装

- [ ] 7. ビルド検証スクリプトの作成
  - scripts/test-build.jsファイルを作成
  - Nuxt.jsビルドプロセスをプログラム的に実行するコードを実装
  - ビルドエラーのキャッチと詳細ログ出力機能を追加
  - .nuxtディレクトリの成果物確認ロジックを実装
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

### サーバーテストの実装

- [ ] 8. Express サーバー起動テストの作成
  - test/integration/server.test.jsファイルを作成
  - Express サーバーの起動とポート3000のリッスン確認テストを実装
  - supertest ライブラリを使用したAPIテストの設定
  - /api/health エンドポイントのレスポンステストを作成
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 9. Socket.IO接続テストの実装
  - test/integration/websocket.test.jsを作成
  - EventTesterを使用した接続テストを実装
  - ReconnectingWebSocketTesterで再接続テストを実装
  - 複数クライアントの同時接続テストを実装
  - _Requirements: 3.4, 6.1_

### Redis テストの実装

- [ ] 10. TestContainers Redis統合テストの作成
  - test/integration/redis-container.test.jsを作成
  - TestContainersでRedis環境を動的に構築
  - 基本的なCRUD操作（set/get/del）のテストを実装
  - Pub/Sub機能のテストを実装
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 11. Upstash Redis REST APIテストの実装
  - test/integration/upstash-redis.test.jsを作成
  - REST API経由での接続テストを実装
  - トークン認証のテストを実装
  - レート制限への対応テストを追加
  - _Requirements: 4.2, 4.3_

### Vueコンポーネントテストの実装

- [ ] 12. Vueコンポーネントユニットテストの基盤作成
  - test/unit/components/ディレクトリを作成
  - Mock Service Worker (MSW)の設定を実装
  - Vuexストアのモック設定を実装
  - Socket.IOクライアントのモックを作成
  - _Requirements: 5.1, 5.2_

- [ ] 13. 主要コンポーネントのテスト実装
  - test/unit/components/Shogiboard.test.jsを作成
  - test/unit/components/Chat.test.jsを作成
  - test/unit/components/Kif.test.jsを作成
  - 各コンポーネントのマウントとレンダリング確認テストを実装
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 14. SSRレンダリングテストの実装
  - test/unit/pages/ディレクトリを作成
  - test/unit/pages/index.test.jsでトップページのSSRテストを実装
  - test/unit/pages/rooms/_id.test.jsで動的ルームページのテストを実装
  - Nuxt.jsのasyncDataフックのモックとテストを追加
  - _Requirements: 5.3, 5.4_

### E2Eテストの実装（Playwright）

- [ ] 15. Page Object Pattern実装
  - test/e2e/pages/ShogiRoomPage.tsを作成
  - WebSocketモニタリング機能を実装
  - makeMove()メソッドで駒移動を実装
  - verifySync()メソッドで同期検証を実装
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 16. Playwright E2E環境の構築
  - test/e2e/ディレクトリを作成
  - test/e2e/playwright.config.tsでPlaywright設定を実装
  - WebSocket Route APIの設定を追加
  - スクリーンショット保存機能を実装
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 17. ルーム作成・参加フローのE2Eテスト
  - test/e2e/room-flow.spec.tsを作成
  - Page Object Patternを使用したテスト実装
  - 複数ブラウザコンテキストでの同時接続を実装
  - URLコピー機能のテストを追加
  - _Requirements: 6.1, 6.3_

- [ ] 18. 駒移動同期のE2Eテスト
  - test/e2e/piece-sync.spec.tsを作成
  - WebSocket Route APIでモック同期を実装
  - 複数クライアント間での移動イベント同期確認
  - 駒音再生のテスト（audio要素の確認）
  - _Requirements: 6.2, 6.3_

- [ ] 19. チャット機能のE2Eテスト
  - test/e2e/chat.spec.tsを作成
  - メッセージ送信と受信の同期テスト
  - 特殊文字やXSS対策のテスト
  - タイムスタンプ表示の確認
  - _Requirements: 6.1, 6.3_

### 負荷テストの実装

- [ ] 20. Artillery.io負荷テスト設定の作成
  - test/load/websocket-load.ymlを作成
  - Socket.io v3エンジンの設定を実装
  - 100同時接続シナリオを定義
  - ウォームアップ、ランプアップ、持続負荷フェーズを設定
  - _Requirements: 全要件のパフォーマンス検証_

- [ ] 21. マルチプレイヤーゲームシナリオの実装
  - ルーム参加、駒移動、チャットの複合シナリオを作成
  - ランダムな駒移動パターンを生成
  - think時間でリアルな操作間隔をシミュレート
  - ループ処理で長時間プレイを再現
  - _Requirements: 6.2, 6.3_

## フェーズ3: CI/CD統合（1週間）

### GitHub Actions統合

- [ ] 22. GitHub Actions テストワークフローの作成
  - .github/workflows/test.ymlファイルを作成
  - Docker Buildxのセットアップステップを追加
  - Playwrightブラウザのキャッシング設定を実装
  - テスト並列実行（シャーディング）の設定を追加
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 23. プルリクエスト自動テストの設定
  - PRトリガーの設定とブランチ保護ルールを追加
  - テスト失敗時のステータスチェック設定
  - Allureレポートの生成と公開設定
  - カバレッジレポートのPRコメント投稿設定
  - _Requirements: 7.1, 7.2, 7.3_

### レポートとモニタリング

- [ ] 24. Allureレポート統合
  - allure-commandlineパッケージを追加
  - test/allure-results/ディレクトリ設定
  - HTMLレポートの自動生成スクリプトを作成
  - GitHub Pagesへの自動デプロイ設定
  - _Requirements: 8.1, 8.2, 8.4_

- [ ] 25. カバレッジレポート生成の実装
  - jest.config.jsにカバレッジ設定を追加（目標70%）
  - WebSocketコードのカバレッジ目標80%を設定
  - HTML/JSON/LCOV形式のレポート出力設定
  - test-results/coverageディレクトリへの出力設定
  - _Requirements: 8.1, 8.4_

## フェーズ4: 最適化と拡張（継続的）

### パフォーマンス最適化

- [ ] 26. テスト実行時間の最適化
  - Jest --maxWorkers=4で並列実行を設定
  - Playwrightのシャーディング（3並列）を実装
  - 選択的テスト実行（変更ファイルベース）を設定
  - Docker層キャッシングの最適化
  - _Requirements: 全要件のパフォーマンス最適化_

- [ ] 27. メモリリーク検出テストの実装
  - test/performance/memory-leak.test.jsを作成
  - heapdumpを使用したメモリ使用量の監視
  - 長時間実行テスト（5分間）の実装
  - メモリ使用量の閾値チェックを追加
  - _Requirements: 全要件の安定性検証_

### テストデータとフィクスチャ

- [ ] 28. テストデータファクトリーの作成
  - test/fixtures/ディレクトリを作成
  - ルームデータ、ユーザーデータのファクトリー関数を実装
  - SFEN形式の棋譜サンプルデータを準備
  - KIF形式の棋譜サンプルデータを準備
  - _Requirements: 全要件のテストデータ基盤_

- [ ] 29. モックサーバーとスタブの実装
  - test/mocks/ディレクトリを作成
  - Mock Service Worker (MSW)の設定を実装
  - WebSocketモックサーバーの実装
  - 外部API呼び出しのスタブ化
  - _Requirements: 全要件のモック基盤_

### 最終統合

- [ ] 30. npm scriptsの最終設定
  - package.jsonに全テストコマンドを追加
  - test:all（全テスト実行）スクリプトを作成
  - test:watch（開発時の自動テスト）を設定
  - pre-commit フックでのテスト実行設定
  - _Requirements: 全要件の実行環境統合_

## 成功指標

- **接続安定性**: 切断率 <1%
- **レイテンシ**: <50ms（優秀）、<100ms（良好）
- **再接続成功率**: >95%
- **WebSocketコードカバレッジ**: ≥80%
- **全テスト実行時間**: <10分