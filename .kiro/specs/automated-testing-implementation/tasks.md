# Implementation Plan

## テスト基盤の構築

- [ ] 1. Jestテスト環境の初期設定
  - package.jsonにJest 26.x関連の依存関係を追加（jest, @vue/test-utils, jest-serializer-vue）
  - jest.config.jsファイルを作成し、Nuxt.js 2.xとの互換性設定を実装
  - test/unit/ディレクトリ構造を作成
  - テストヘルパーファイル（test/helpers/setup.js）を作成
  - _Requirements: 全要件の基盤構築_

- [ ] 2. Docker Compose テスト設定ファイルの作成
  - compose.test.yamlを作成し、test-orchestratorサービスを定義
  - Dockerfile.testを作成し、テスト実行環境を構築
  - テスト結果用のボリュームマウントを設定
  - 環境変数の設定（NODE_ENV=test）
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

## ビルドテストの実装

- [ ] 3. ビルド検証スクリプトの作成
  - scripts/test-build.jsファイルを作成
  - Nuxt.jsビルドプロセスをプログラム的に実行するコードを実装
  - ビルドエラーのキャッチと詳細ログ出力機能を追加
  - .nuxtディレクトリの成果物確認ロジックを実装
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 4. ビルドテストのJest統合
  - test/build/build.test.jsを作成
  - ビルドプロセスの成功/失敗をアサートするテストケースを実装
  - タイムアウト設定（60秒）を追加
  - package.jsonにtest:buildスクリプトを追加
  - _Requirements: 2.1, 2.4_

## サーバーテストの実装

- [ ] 5. Express サーバー起動テストの作成
  - test/integration/server.test.jsファイルを作成
  - Express サーバーの起動とポート3000のリッスン確認テストを実装
  - supertest ライブラリを使用したAPIテストの設定
  - /api/health エンドポイントのレスポンステストを作成
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 6. Socket.IO接続テストの実装
  - test/integration/websocket.test.jsを作成
  - socket.io-clientを使用した接続テストを実装
  - 接続イベントのリスナーとタイムアウト処理を追加
  - 複数クライアントの同時接続テストを実装
  - _Requirements: 3.4, 6.1_

## Redis テストの実装

- [ ] 7. Redis接続テストモジュールの作成
  - scripts/test-redis.jsファイルを作成
  - ioredisクライアントを使用した接続テストを実装
  - Upstash REST API対応の条件分岐を追加
  - 基本的なCRUD操作（set/get/del）のテストを実装
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 8. Redis統合テストの作成
  - test/integration/redis.test.jsを作成
  - モックRedisサーバーの設定（redis-mock使用）
  - 接続エラー時の詳細ログ出力テストを実装
  - package.jsonにtest:redisスクリプトを追加
  - _Requirements: 4.1, 4.4_

## コンポーネントテストの実装

- [ ] 9. Vueコンポーネントユニットテストの基盤作成
  - test/unit/components/ディレクトリを作成
  - テスト用のVueインスタンスセットアップファイルを作成
  - Vuexストアのモック設定を実装
  - Socket.IOクライアントのモックを作成
  - _Requirements: 5.1, 5.2_

- [ ] 10. 主要コンポーネントのテスト実装
  - test/unit/components/Shogiboard.test.jsを作成
  - test/unit/components/Chat.test.jsを作成
  - test/unit/components/Kif.test.jsを作成
  - 各コンポーネントのマウントとレンダリング確認テストを実装
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 11. SSRレンダリングテストの実装
  - test/unit/pages/ディレクトリを作成
  - test/unit/pages/index.test.jsでトップページのSSRテストを実装
  - test/unit/pages/rooms/_id.test.jsで動的ルームページのテストを実装
  - Nuxt.jsのasyncDataフックのモックとテストを追加
  - _Requirements: 5.3, 5.4_

## E2Eテストの実装

- [ ] 12. Puppeteer E2E環境の構築
  - test/e2e/ディレクトリを作成
  - test/e2e/setup.jsでPuppeteerの初期設定を実装
  - Dockerコンテナ内でのヘッドレスChrome設定を追加
  - スクリーンショット保存機能を実装
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 13. ルーム作成・参加フローのE2Eテスト
  - test/e2e/room-flow.test.jsを作成
  - ルーム作成から参加までの一連のフローをテスト
  - 複数ブラウザインスタンスでの同時接続を実装
  - URLコピー機能のテストを追加
  - _Requirements: 6.1, 6.3_

- [ ] 14. 駒移動同期のE2Eテスト
  - test/e2e/piece-sync.test.jsを作成
  - ドラッグ&ドロップによる駒移動のシミュレーション
  - 複数クライアント間での移動イベント同期確認
  - 駒音再生のテスト（audio要素の確認）
  - _Requirements: 6.2, 6.3_

- [ ] 15. チャット機能のE2Eテスト
  - test/e2e/chat.test.jsを作成
  - メッセージ送信と受信の同期テスト
  - 特殊文字やXSS対策のテスト
  - タイムスタンプ表示の確認
  - _Requirements: 6.1, 6.3_

## テストオーケストレーションの実装

- [ ] 16. テスト実行オーケストレーターの作成
  - scripts/test-runner.jsを作成
  - 全テストスイートの順次/並列実行ロジックを実装
  - テスト結果の集約とレポート生成機能を追加
  - 失敗時のリトライ機構（最大3回）を実装
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 17. カバレッジレポート生成の実装
  - jest.config.jsにカバレッジ設定を追加
  - HTML/JSON/LCOV形式のレポート出力設定
  - カバレッジ閾値の設定（70%以上）
  - test-results/coverageディレクトリへの出力設定
  - _Requirements: 8.1, 8.4_

## GitHub Actions統合

- [ ] 18. GitHub Actions テストワークフローの作成
  - .github/workflows/test.ymlファイルを作成
  - Docker Buildxのセットアップステップを追加
  - Dockerレイヤーキャッシングの設定を実装
  - テスト実行とアーティファクトアップロードステップを追加
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 19. プルリクエスト自動テストの設定
  - PRトリガーの設定とブランチ保護ルールを追加
  - テスト失敗時のステータスチェック設定
  - カバレッジレポートのPRコメント投稿設定
  - 並列ジョブ実行の最適化
  - _Requirements: 7.1, 7.2, 7.3_

## パフォーマンステストの実装

- [ ] 20. 負荷テストスクリプトの作成
  - test/performance/ディレクトリを作成
  - Artillery.io設定ファイル（artillery.yml）を作成
  - 100同時接続のシナリオを定義
  - WebSocket接続の負荷テストシナリオを実装
  - _Requirements: 全要件のパフォーマンス検証_

- [ ] 21. メモリリーク検出テストの実装
  - test/performance/memory-leak.test.jsを作成
  - heapdumpを使用したメモリ使用量の監視
  - 長時間実行テスト（5分間）の実装
  - メモリ使用量の閾値チェックを追加
  - _Requirements: 全要件の安定性検証_

## テストデータとフィクスチャの準備

- [ ] 22. テストデータファクトリーの作成
  - test/fixtures/ディレクトリを作成
  - ルームデータ、ユーザーデータのファクトリー関数を実装
  - SFEN形式の棋譜サンプルデータを準備
  - KIF形式の棋譜サンプルデータを準備
  - _Requirements: 全要件のテストデータ基盤_

- [ ] 23. モックサーバーとスタブの実装
  - test/mocks/ディレクトリを作成
  - Redis モックサーバーの実装
  - Socket.IO サーバーモックの実装
  - 外部API呼び出しのスタブ化
  - _Requirements: 全要件のモック基盤_

## テストスクリプトの統合

- [ ] 24. npm scriptsの最終設定
  - package.jsonに全テストコマンドを追加
  - test:all（全テスト実行）スクリプトを作成
  - test:watch（開発時の自動テスト）を設定
  - pre-commit フックでのテスト実行設定
  - _Requirements: 全要件の実行環境統合_