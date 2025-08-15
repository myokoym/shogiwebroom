# Implementation Plan

## Docker環境構築

- [ ] 1. Node.js 18互換性対応のための基盤更新
  - package.jsonのNuxt.jsを2.18.1以上にアップグレード
  - npm scriptsにNODE_OPTIONS="--openssl-legacy-provider"を追加
  - tsconfig.jsonにskipLibCheck: trueを設定
  - cross-envパッケージを追加してクロスプラットフォーム対応
  - 依存関係のインストールとビルドテストを実行
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 2. 本番用Dockerfileの作成
  - マルチステージビルドでnode:18-alpine3.18ベースイメージを使用
  - ビルドステージでpackage*.jsonをコピーしnpm ciで依存関係インストール
  - ソースコードをコピーしてnpm run buildを実行
  - 本番ステージで必要最小限のファイルのみコピー
  - 非rootユーザー（node）での実行設定
  - _Requirements: 1.1, 1.3, 1.6_

- [ ] 3. 開発用Dockerfileの作成
  - Dockerfile.devファイルを作成
  - node:18-alpineベースイメージを使用
  - nodemonとデバッグポート（9229）を有効化
  - ボリュームマウント用の設定を追加
  - NODE_OPTIONS環境変数を設定
  - _Requirements: 1.2, 1.4_

- [ ] 4. Docker Compose環境の構築
  - compose.yamlファイルを作成
  - アプリケーションサービスとRedisサービスを定義
  - node_modules用の名前付きボリュームを設定
  - ホットリロード用のボリュームマウント設定
  - 環境変数の設定（REDIS_URL等）
  - _Requirements: 1.5, 7.1, 7.6_

## Redis統合とヘルスチェック実装

- [ ] 5. Redisクライアントラッパーの実装
  - server/lib/redis-client.jsファイルを作成
  - Upstash互換のioredis接続を実装
  - エラーハンドリングとインメモリフォールバック機能を追加
  - TTL自動設定（24時間）を実装
  - 接続テストスクリプトを作成
  - _Requirements: 3.1, 3.3, 3.4, 3.5_

- [ ] 6. server/index.jsのRedis統合更新
  - 既存のRedis接続をredis-client.jsを使用するよう更新
  - ルームデータ保存時にTTLを設定
  - エラー時のインメモリフォールバック処理を追加
  - Redis接続失敗時の機能制限モードを実装
  - _Requirements: 3.2, 3.6_

- [ ] 7. ヘルスチェックAPIの実装
  - server/api/health.jsファイルを作成
  - /api/healthエンドポイントでシステム状態を返す実装
  - /api/health/redisエンドポイントでRedis接続詳細を返す実装
  - メモリ使用量とアプリケーション状態の取得機能
  - エラー時の適切なHTTPステータスコード（503）返却
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 8. ロギング機能の強化
  - 構造化ログ出力の実装
  - エラー時のスタックトレース出力
  - 標準出力（stdout）と標準エラー出力（stderr）の使い分け
  - ログレベルの環境変数制御
  - _Requirements: 5.4, 5.5_

## Fly.ioデプロイメント設定

- [ ] 9. fly.toml設定ファイルの作成
  - アプリケーション名とプライマリリージョン（nrt）設定
  - 内部ポート3000の設定
  - HTTPサービスのauto_stop_machines=falseとmin_machines_running=0設定
  - WebSocket対応のための設定追加
  - 256MB RAMの最小構成VM設定
  - _Requirements: 2.1, 2.2, 2.4_

- [ ] 10. Fly.ioヘルスチェック設定
  - fly.tomlにヘルスチェック設定を追加
  - /api/healthへの10秒間隔チェック設定
  - グレースピリオドと再起動閾値の設定
  - 自動停止と再起動の設定（コールドスタート10秒以内）
  - _Requirements: 2.3, 2.5_

- [ ] 11. 環境変数とシークレット管理スクリプト
  - .env.exampleファイルの作成
  - Fly.ioシークレット設定用のスクリプト作成
  - REDIS_URL、NODE_ENV=production設定
  - 環境変数の検証スクリプト作成
  - _Requirements: 2.6_

## CI/CDパイプライン構築

- [ ] 12. GitHub Actions基本ワークフローの作成
  - .github/workflows/deploy.ymlファイルを作成
  - mainブランチへのプッシュトリガー設定
  - Node.js 18セットアップステップ
  - npm ciとnpm testの実行ステップ
  - ビルドキャッシュの設定
  - _Requirements: 6.1, 6.4_

- [ ] 13. Dockerビルドとテストの統合
  - プルリクエスト時のDockerイメージビルド
  - lint（ESLint）とタイプチェックの実行
  - ユニットテストの実行
  - テスト失敗時のエラー報告
  - _Requirements: 6.2_

- [ ] 14. Fly.ioデプロイメントステップの追加
  - superfly/flyctl-actionsのセットアップ
  - fly deployコマンドの実行
  - FLY_API_TOKENのGitHub Secrets設定
  - デプロイ失敗時の自動ロールバック
  - デプロイ成功/失敗の通知設定
  - _Requirements: 6.3, 6.5, 6.6_

## 開発環境の最適化とテスト

- [ ] 15. 開発環境の起動とテスト
  - docker compose upでのアプリケーション起動テスト
  - localhost:3000でのアクセス確認
  - ホットリロード機能の動作確認
  - Redisとの接続確認
  - 3秒以内の起動時間達成確認
  - _Requirements: 7.1, 7.2, 7.4_

- [ ] 16. VSCode統合設定の作成
  - .devcontainer/devcontainer.json設定ファイル作成
  - Remote Containers拡張機能との統合設定
  - デバッグ設定（launch.json）の作成
  - 推奨拡張機能リストの定義
  - _Requirements: 7.3_

- [ ] 17. パフォーマンス最適化の実装
  - 静的アセットのキャッシュヘッダー設定
  - ブラウザキャッシュ制御の実装
  - 帯域使用量削減のための圧縮設定
  - コールドスタート時間の測定と最適化
  - _Requirements: 9.3, 9.2_

## ドキュメント作成

- [ ] 18. DEPLOYMENT_GUIDE.mdの作成
  - Fly.ioへのデプロイ手順詳細
  - 環境変数設定ガイド
  - トラブルシューティングセクション
  - ロールバック手順
  - モニタリング設定方法
  - _Requirements: 8.1, 8.6_

- [ ] 19. DOCKER_FIRST.mdの作成
  - Docker環境のクイックスタートガイド
  - 開発環境セットアップ手順（10分以内）
  - よくあるエラーと解決方法
  - VSCodeでの開発フロー
  - _Requirements: 8.2, 7.5_

- [ ] 20. README.mdの更新
  - Dockerコマンドの追加
  - 環境変数の説明
  - 新しい依存関係の説明
  - アーキテクチャ図の追加
  - 設定ファイルへのコメント追加
  - _Requirements: 8.3, 8.4, 8.5_

## モニタリングとコスト管理

- [ ] 21. コスト監視機能の実装
  - Fly.ioメトリクス取得スクリプトの作成
  - 使用量アラートの設定（$8到達時）
  - 自動スケールダウン機能の実装
  - アイドル時間監視（30分）の実装
  - _Requirements: 9.1, 9.2, 9.4_

- [ ] 22. Redis使用量管理の実装
  - Upstashコマンド数監視スクリプト
  - 無料枠80%到達時のアラート設定
  - 古いデータの自動削除バッチ
  - レート制限機能の実装
  - _Requirements: 9.5, 9.6_

## 統合テストと検証

- [ ] 23. エンドツーエンドテストの実装
  - Playwrightを使用したE2Eテスト作成
  - ルーム作成から対局までのフロー検証
  - WebSocket接続の安定性テスト
  - コールドスタート時間の測定
  - _Requirements: 全要件のE2E検証_

- [ ] 24. パフォーマンステストの実装
  - k6を使用した負荷テスト作成
  - 100同時接続のシミュレーション
  - メモリ使用量の監視
  - レスポンスタイムの測定
  - _Requirements: 全要件のパフォーマンス検証_