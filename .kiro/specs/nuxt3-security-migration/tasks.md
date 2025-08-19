# 実装計画

## 基盤整備

- [x] 1. Nuxt Bridge環境の構築
  - package.jsonでNuxt BridgeとNuxt 3を依存関係に追加
  - Node.js 18以上の環境を設定
  - TypeScript設定ファイル（tsconfig.json）を作成
  - 開発環境での起動確認テストを実装
  - _要件: 1_

- [x] 2. Nuxt設定ファイルのTypeScript化
  - nuxt.config.jsをnuxt.config.tsに変換
  - Bridge設定オプションを追加（nitro有効、vite無効）
  - 実験的WebSocketを明示的に無効化
  - 既存の設定値を互換性を保ちながら移行
  - _要件: 1_

## セキュリティ強化

- [x] 3. 依存関係の脆弱性対応
  - npm auditを実行して現在の脆弱性をレポート化
  - 修正可能な脆弱性をnpm audit fixで解消
  - 手動更新が必要なパッケージのリストアップ
  - セキュリティテストを追加
  - _要件: 2_

- [x] 4. セキュリティミドルウェアの実装
  - server/middleware/security.tsを作成
  - CSPヘッダーの設定を実装
  - X-Frame-OptionsとX-Content-Type-Optionsを設定
  - セキュリティヘッダーのテストを作成
  - _要件: 2_

## Socket.IO移行

- [x] 5. Socket.IOサーバーv4への移行準備
  - Socket.IO v4とengine.ioをインストール
  - server/plugins/socket.io.tsを作成
  - Nitroプラグインとして基本構造を実装
  - 開発環境での接続テストを作成
  - _要件: 3_

- [x] 6. Socket.IOイベントハンドラーの移植
  - enterRoomイベントの移植と部屋管理機能
  - sendMoveイベントの移植と盤面同期機能
  - sendCommentイベントの移植とチャット機能
  - sendイベントとその他の既存イベントの移植
  - _要件: 3_

- [x] 7. Socket.IOクライアントの更新
  - plugins/socket.client.tsを作成
  - Socket.IO Client v4への接続設定
  - 再接続ロジックとエラーハンドリング
  - クライアント側のイベントテストを実装
  - _要件: 3_

- [x] 8. Socket.IO後方互換性の確保
  - allowEIO3オプションを有効化
  - v2クライアントとの接続テスト
  - フォールバック処理の実装
  - 本番環境シミュレーションテスト
  - _要件: 3_

## Vue 3コンポーネント移行

- [x] 9. コアコンポーネントのComposition API化
  - components/Shogiboard.vueをComposition APIに変換
  - Piece.vueコンポーネントの移行
  - Stock.vueとHand.vueの移行
  - コンポーネントテストの更新
  - _要件: 4_

- [x] 10. チャット・UI関連コンポーネントの移行
  - Chat.vueをComposition APIに変換
  - Option.vueの設定管理を移行
  - Kif.vue棋譜管理機能の移行
  - Usage.vue使い方説明の移行
  - _要件: 4_

- [x] 11. ページコンポーネントの移行
  - pages/index.vueをComposition APIに変換
  - pages/rooms/_id.vueを動的ルートに対応
  - レイアウトコンポーネントの移行
  - ルーティングテストの実装
  - _要件: 4_

## 状態管理の移行

- [x] 12. VuexからPiniaへの移行準備
  - Piniaのインストールと初期設定
  - stores/ディレクトリ構造の作成
  - 移行ヘルパー関数の作成
  - Piniaストアのテスト環境構築
  - _要件: 4_

- [x] 13. 盤面状態管理の移行
  - store/sfen.jsをstores/sfen.tsに移行
  - SFEN形式の型定義を追加
  - 駒移動ロジックのリファクタリング
  - 盤面同期テストの実装
  - _要件: 4_

- [x] 14. チャット・オプション状態の移行
  - store/chat.jsをstores/chat.tsに移行
  - store/option.jsをstores/option.tsに移行
  - store/kif.jsをstores/kif.tsに移行
  - 統合テストの実装
  - _要件: 4_

## UIライブラリの移行

- [x] 15. Bootstrap Vue Nextへの移行準備
  - @bootstrap-vue-next/nuxtモジュールのインストール
  - Bootstrap 5のCSS設定
  - コンポーネント互換性マッピングの作成
  - UIコンポーネントテストの準備
  - _要件: 4_

- [x] 16. UIコンポーネントの置き換え
  - b-containerとb-rowの移行
  - b-buttonとフォーム要素の移行
  - b-modalとアラートコンポーネントの移行
  - レスポンシブ対応の検証
  - _要件: 4_

## ビルドシステムの更新

- [x] 17. Viteビルドシステムの導入
  - nuxt.config.tsでViteを有効化
  - optimizeDepsの設定
  - ビルド最適化オプションの設定
  - ビルド時間の測定テスト
  - _要件: 5_

- [x] 18. Docker環境の更新
  - DockerfileをNode.js 20対応に更新
  - マルチステージビルドの実装
  - .outputディレクトリ構造への対応
  - コンテナビルドテストの実装
  - _要件: 5_

## テストフレームワークの更新

- [ ] 19. Vitestへの移行
  - Vitestとテスト関連パッケージのインストール
  - Jest設定からVitest設定への変換
  - テストヘルパー関数の更新
  - テスト実行スクリプトの更新
  - _要件: 6_

- [ ] 20. ユニットテストの移行
  - 既存のJestテストをVitestに変換
  - Vue Test Utils v2への対応
  - モックとスタブの更新
  - カバレッジ設定の移行
  - _要件: 6_

- [ ] 21. E2Eテストの更新
  - Playwrightテストの設定更新
  - Socket.IO接続のE2Eテスト作成
  - 主要ユーザーフローのテスト更新
  - クロスブラウザテストの実装
  - _要件: 6_

## パフォーマンス最適化

- [ ] 22. バンドル最適化の実装
  - コード分割戦略の実装
  - 動的インポートの設定
  - チャンク最適化の実装
  - バンドルサイズ分析ツールの設定
  - _要件: 7_

- [ ] 23. 画像・アセット最適化
  - @nuxt/imageモジュールの導入
  - 画像フォーマット変換設定
  - レスポンシブ画像の実装
  - アセットの遅延読み込み設定
  - _要件: 7_

- [ ] 24. SSR・キャッシュ最適化
  - Nitroのプリレンダリング設定
  - 静的アセットの圧縮設定
  - キャッシュヘッダーの最適化
  - パフォーマンス測定の自動化
  - _要件: 7_

## 統合と検証

- [ ] 25. 移行完了後の統合テスト
  - 全機能の動作確認テストスイート作成
  - Socket.IO通信の安定性テスト
  - メモリリークのチェック
  - エラーハンドリングの検証
  - _要件: 全要件の統合検証_

- [ ] 26. パフォーマンスベンチマーク
  - 初期表示時間の測定
  - WebSocket接続遅延の測定
  - バンドルサイズの確認
  - Lighthouse スコアの取得
  - _要件: 7_