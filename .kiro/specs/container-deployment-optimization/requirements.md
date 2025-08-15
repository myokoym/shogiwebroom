# Requirements Document

## 概要

将棋ウェブルーム（Shogiwebroom）プロジェクトに対する低コスト重視のコンテナ化およびデプロイメント戦略の要件定義書です。本プロジェクトは、現在Herokuで稼働しているNuxt.js、Express.js、Socket.IO、Redisを使用したリアルタイム将棋盤アプリケーションを、webchessclockプロジェクトで実証済みの方法でコンテナ化し、月額$10以内で運用可能な従量課金型PaaSプラットフォームへ移行することを目的としています。

本要件では、Dockerによる開発・本番環境の統一、Fly.ioへのデプロイメント、Upstash Redisによる低コスト化、Node.js 18+対応、CI/CDパイプラインの構築を通じて、開発効率の向上と運用コストの削減を実現します。

## Project Description (User Input)
../webchessclockのspecsや今日のコミット履歴、.claude/session-history/を参考に、同様の対応をこのリポジトリにも適用したい

## Requirements

### 要件1: Dockerコンテナ化実装

**ユーザーストーリー:** 開発者として、開発環境と本番環境の差異を解消し、再現性のある環境構築を実現したい。これにより、環境依存の問題を排除し、新規開発者のオンボーディングを迅速化したい。

#### 受け入れ基準

1. WHEN 本番用Dockerfileが作成される THEN システムは Node.js 18以上のAlpineベースイメージを使用し、マルチステージビルドで最終イメージサイズを最小化 SHALL する
2. IF 開発用Docker環境が構築される THEN システムは ホットリロード機能とデバッグポートを有効化し、node_modulesをボリュームマウント SHALL する
3. WHILE Dockerコンテナがビルドされる間 THE システムは package-lock.jsonをCOPYして npm ciを使用し、再現性のある依存関係インストール SHALL を実行する
4. WHERE Nuxt.js 2.xとNode.js 18+の互換性問題が発生する場所で THE システムは NODE_OPTIONS="--openssl-legacy-provider"環境変数を設定 SHALL する
5. WHEN docker-compose.yamlが作成される THEN システムは 開発環境用のRedisコンテナとアプリケーションコンテナを定義 SHALL する
6. IF セキュリティスキャンが実行される THEN システムは 非rootユーザー（node）でアプリケーションを実行 SHALL する

### 要件2: Fly.ioデプロイメント環境構築

**ユーザーストーリー:** プロダクトオーナーとして、Herokuから低コストのFly.ioプラットフォームへ移行したい。これにより、使用量ゼロ時は$0、最大でも月額$10程度の運用コストを実現したい。

#### 受け入れ基準

1. WHEN fly.tomlが作成される THEN システムは アプリケーション名、プライマリリージョン（nrt/東京）、内部ポート3000の設定を含む SHALL
2. IF WebSocket通信が必要 THEN システムは fly.tomlでHTTPサービスのauto_stop_machines=falseとmin_machines_running=0を設定 SHALL する
3. WHERE ヘルスチェックが設定される場所で THE システムは /api/healthエンドポイントへの定期チェックを10秒間隔で実施 SHALL する
4. WHILE アプリケーションがデプロイされる間 THE システムは 256MB RAMの最小構成でVMを起動 SHALL する
5. WHEN トラフィックがゼロの場合 THEN システムは 自動的にマシンを停止し、新規リクエスト時に10秒以内で再起動 SHALL する
6. IF 環境変数の設定が必要 THEN システムは fly secrets setコマンドでREDIS_URL、NODE_ENV=productionを安全に設定 SHALL する

### 要件3: Upstash Redis統合による低コスト化

**ユーザーストーリー:** システム管理者として、既存のRedis依存部分をUpstash Redisへ移行したい。これにより、日額10,000コマンドまでの無料枠を活用し、Redisコストをゼロにしたい。

#### 受け入れ基準

1. WHEN Redisクライアントが初期化される THEN システムは REDIS_URL環境変数からUpstash接続情報を読み込み、REST APIベースの接続を確立 SHALL する
2. IF Upstash Redisの無料枠制限に近づいた場合 THEN システムは 24時間アクセスのない部屋データを自動削除 SHALL する
3. WHERE server/index.jsでRedis接続が必要な場所で THE システムは ioredisクライアントを維持しつつ、Upstash互換の接続文字列を使用 SHALL する
4. WHILE Redis操作が実行される間 THE システムは エラーハンドリングを実装し、接続失敗時はインメモリフォールバック SHALL を提供する
5. WHEN ルームデータが保存される THEN システムは TTL（Time To Live）を24時間に設定し、自動期限切れ SHALL を実装する
6. IF Redis接続が利用できない場合 THEN システムは 機能制限モード（データ永続化なし）で動作を継続 SHALL する

### 要件4: Node.js 18+互換性対応

**ユーザーストーリー:** 開発者として、最新のNode.js LTS（18以上）でアプリケーションを動作させたい。これにより、セキュリティアップデートとパフォーマンス改善の恩恵を受けたい。

#### 受け入れ基準

1. WHEN package.jsonが更新される THEN システムは Nuxt.jsを2.18.1以上にアップグレード SHALL する
2. IF PostCSS関連のエラーが発生する THEN システムは PostCSS 8互換の設定に更新 SHALL する
3. WHERE npm scriptsが定義される場所で THE システムは NODE_OPTIONS="--openssl-legacy-provider"を各スクリプトに追加 SHALL する
4. WHILE TypeScriptコンパイルが実行される間 THE システムは tsconfig.jsonにskipLibCheck: trueを設定 SHALL する
5. WHEN 開発環境が起動される THEN システムは cross-envパッケージを使用してクロスプラットフォーム対応 SHALL する
6. IF 依存関係の脆弱性が検出される THEN システムは npm auditを実行し、高リスクの脆弱性を修正 SHALL する

### 要件5: ヘルスチェックとモニタリング実装

**ユーザーストーリー:** 運用担当者として、アプリケーションの健全性を常時監視したい。これにより、問題を早期発見し、ダウンタイムを最小化したい。

#### 受け入れ基準

1. WHEN /api/healthエンドポイントが実装される THEN システムは アプリケーション状態、Redis接続状態、メモリ使用量をJSON形式で返却 SHALL する
2. IF Redis接続が失敗した場合 THEN システムは /api/health/redisエンドポイントで詳細なエラー情報を提供 SHALL する
3. WHERE ヘルスチェックが実行される場所で THE システムは 200 OKステータスと適切なエラーコード（503）を返却 SHALL する
4. WHILE アプリケーションが稼働中 THE システムは 標準出力にstructured loggingでログを出力 SHALL する
5. WHEN エラーが発生した場合 THEN システムは スタックトレースを含む詳細ログをstderrに出力 SHALL する
6. IF 外部監視サービスが必要 THEN システムは UptimeRobotまたはFly.io内蔵メトリクスで監視 SHALL する

### 要件6: CI/CDパイプライン構築

**ユーザーストーリー:** 開発者として、コード変更を自動的にテスト・デプロイしたい。これにより、手動デプロイのミスを防ぎ、リリースサイクルを高速化したい。

#### 受け入れ基準

1. WHEN GitHub Actionsワークフローが作成される THEN システムは mainブランチへのプッシュ時に自動ビルド・デプロイ SHALL を実行する
2. IF プルリクエストが作成される THEN システムは Dockerイメージのビルドとlint/typeチェックを実行 SHALL する
3. WHERE デプロイメントが実行される環境で THE システムは fly deployコマンドでFly.ioへ自動デプロイ SHALL する
4. WHILE CI/CDパイプラインが実行中 THE システムは ビルドキャッシュを活用して処理時間を最適化 SHALL する
5. WHEN デプロイが失敗した場合 THEN システムは 自動ロールバックを実行し、管理者に通知 SHALL する
6. IF シークレット管理が必要 THEN システムは GitHub SecretsでFLY_API_TOKENを安全に管理 SHALL する

### 要件7: 開発環境の改善

**ユーザーストーリー:** 開発者として、Dockerベースの統一された開発環境を使用したい。これにより、「私の環境では動く」問題を解消し、チーム全体の生産性を向上させたい。

#### 受け入れ基準

1. WHEN docker compose upが実行される THEN システムは アプリケーションとRedisコンテナを起動し、3秒以内にアクセス可能 SHALL になる
2. IF ソースコードが変更される THEN システムは ホットリロードによって1秒以内に変更を反映 SHALL する
3. WHERE VSCodeでデバッグする場所で THE システムは Remote Containers拡張機能との統合設定を提供 SHALL する
4. WHILE 開発環境が稼働中 THE システムは ホストの3000番ポートでアプリケーションにアクセス可能 SHALL である
5. WHEN 新規開発者が参加する THEN システムは READMEの手順に従って10分以内に開発環境を構築可能 SHALL である
6. IF パフォーマンス問題が発生する THEN システムは node_modulesを名前付きボリュームにマウントして高速化 SHALL する

### 要件8: ドキュメント整備

**ユーザーストーリー:** 新規参加者として、プロジェクトのセットアップと運用方法を理解したい。これにより、迅速に開発に参加し、運用タスクを実行できるようになりたい。

#### 受け入れ基準

1. WHEN DEPLOYMENT_GUIDE.mdが作成される THEN システムは Fly.ioへのデプロイ手順、環境変数設定、トラブルシューティングを含む SHALL
2. IF Docker開発環境のガイドが必要 THEN システムは DOCKER_FIRST.mdでクイックスタート手順を提供 SHALL する
3. WHERE READMEが更新される場所で THE システムは Dockerコマンド、環境変数、依存関係の説明を追加 SHALL する
4. WHILE ドキュメントが作成される間 THE システムは 実際のコマンド例とエラー解決方法を含む SHALL
5. WHEN 設定ファイルが追加される THEN システムは 各設定項目にコメントで説明を記載 SHALL する
6. IF 運用手順が必要 THEN システムは ログ確認、スケーリング、バックアップ手順を文書化 SHALL する

### 要件9: コスト監視と最適化

**ユーザーストーリー:** コスト管理者として、月額使用料を常に$10以内に抑えたい。これにより、プロジェクトの持続可能性を確保し、予算超過を防ぎたい。

#### 受け入れ基準

1. WHEN 月額使用料が$8に達した場合 THEN システムは 管理者にアラートを送信し、自動スケールダウン SHALL を実施する
2. IF アイドル時間が30分を超える THEN システムは Fly.ioのauto_stop機能でインスタンスを停止 SHALL する
3. WHERE 静的アセットが配信される場所で THE システムは ブラウザキャッシュヘッダーを設定し、帯域使用量を削減 SHALL する
4. WHILE コスト分析が必要な場合 THE システムは Fly.ioダッシュボードでリソース使用状況を確認可能 SHALL である
5. WHEN Redisコマンド数が無料枠の80%に達した場合 THEN システムは 古いデータの削除を開始 SHALL する
6. IF 予期しないトラフィック増加が発生した場合 THEN システムは レート制限を適用してコストを制御 SHALL する