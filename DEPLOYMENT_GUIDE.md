# Shogiwebroom デプロイメントガイド

リアルタイム将棋盤Webアプリケーション「Shogiwebroom」の包括的なデプロイメントガイドです。

## 📋 プロジェクト概要

Shogiwebroomは、リアルタイムで同期する将棋盤を複数人が操作できるWebアプリケーションです。

### 主な特徴
- リアルタイム同期対応（Socket.IO）
- ドラッグ＆ドロップ操作
- レスポンシブデザイン（スマートフォン・タブレット対応）
- SFEN形式（USI）入出力対応
- Redis によるセッション管理
- Docker コンテナ対応

### 技術スタック
- **フロントエンド**: Nuxt.js 2.x, Vue.js, Bootstrap Vue
- **バックエンド**: Node.js, Express.js
- **リアルタイム通信**: Socket.IO
- **データストア**: Redis（Upstash Redis）
- **コンテナ化**: Docker, Docker Compose
- **デプロイ**: Fly.io

## 🔧 必要な前提条件

### 開発環境
- **Node.js**: 18.x以上
- **npm**: 9.x以上
- **Docker**: 20.x以上
- **Docker Compose**: 2.x以上

### デプロイ環境
- **Fly.io CLI**: 最新版
- **Upstash Redis**: アカウントとインスタンス
- **Git**: バージョン管理

### アカウント準備
1. [Fly.io](https://fly.io) アカウント作成
2. [Upstash](https://upstash.com) アカウント作成（Redis用）

## 🚀 ローカル開発環境のセットアップ

### 方法1: Docker Compose使用（推奨）

```bash
# リポジトリをクローン
git clone https://github.com/myokoym/shogiwebroom.git
cd shogiwebroom

# Docker Composeで環境を起動
docker-compose up -d

# ログを確認
docker-compose logs -f app
```

アプリケーション: http://localhost:3000  
Redis: localhost:6379

### 方法2: ローカルNode.js環境

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

**注意**: ローカル環境では別途Redisサーバーが必要です。

```bash
# Redis をDockerで起動
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

## 🐳 Docker環境の詳細

### 開発環境（Dockerfile.dev）
- ホットリロード対応
- デバッグポート（9229）開放
- ボリュームマウントでリアルタイム編集

### 本番環境（Dockerfile）
- マルチステージビルド
- 軽量Alpine Linuxベース
- セキュリティ強化（非rootユーザー）
- ヘルスチェック機能

### Docker Compose設定

#### 基本設定（compose.yaml）
```yaml
services:
  app:
    build:
      dockerfile: Dockerfile.dev
    environment:
      - REDIS_URL=redis://redis:6379
  redis:
    image: redis:7-alpine
```

#### 開発用オーバーライド（compose.override.yaml）
- ポートマッピング（3000:3000, 9229:9229）
- デバッグ用環境変数
- ファイル監視設定

## ☁️ Fly.io への初回デプロイ

### 1. Fly.io CLI のインストール

```bash
# Linux/macOS
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### 2. Fly.io にログイン

```bash
flyctl auth login
```

### 3. アプリケーションの作成

```bash
flyctl apps create shogiwebroom --org personal
```

### 4. 環境変数の設定

```bash
# Upstash Redis URL を設定
flyctl secrets set REDIS_URL="redis://default:AX1HAAIncDFkMTJiYTJhZDBjZDA0MmU1OTY0NTZjNjgyMWRlM2Q3ZHAxMzIwNzE@welcome-termite-32071.upstash.io:32071"

# 設定確認
flyctl secrets list
```

### 5. デプロイ実行

```bash
# 自動デプロイスクリプト使用
chmod +x deploy.sh
./deploy.sh
```

または手動デプロイ：

```bash
flyctl deploy --remote-only
```

### 6. デプロイ確認

```bash
# アプリケーション状態確認
flyctl status

# ログ確認
flyctl logs

# ヘルスチェック
curl https://shogiwebroom.fly.dev/api/health
```

## 🔒 環境変数の設定

### 必須環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `REDIS_URL` | Upstash Redis接続URL | `redis://default:***@***.upstash.io:***` |
| `NODE_ENV` | Node.js環境 | `production` |
| `PORT` | アプリケーションポート | `3000` |

### Upstash Redis URL の取得

1. [Upstash Console](https://console.upstash.com/) にログイン
2. Redis インスタンスを選択
3. "Connect your database" → "ioredis" タブ
4. 接続URLをコピー

```
redis://default:PASSWORD@ENDPOINT:PORT
```

### 環境変数設定方法

#### Fly.io
```bash
flyctl secrets set REDIS_URL="your-redis-url-here"
```

#### Docker Compose
```yaml
# compose.override.yaml
environment:
  - REDIS_URL=redis://redis:6379
```

#### ローカル開発
```bash
export REDIS_URL="redis://localhost:6379"
```

## 🔄 CI/CDワークフロー（手動）

現在のプロジェクトでは手動デプロイを採用していますが、以下のワークフローを推奨します：

### 1. 開発フロー

```bash
# 1. フィーチャーブランチ作成
git checkout -b feature/new-feature

# 2. 開発・テスト
docker-compose up -d
# 開発作業...

# 3. コミット・プッシュ
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# 4. マージ後、mainブランチでデプロイ
git checkout main
git pull origin main
./deploy.sh
```

### 2. 自動デプロイスクリプト

`deploy.sh` スクリプトが以下を自動実行：

- flyctl インストール確認
- ログイン状態確認
- アプリケーション存在確認
- シークレット設定
- ビルド・デプロイ実行
- デプロイ結果確認

## 🔍 トラブルシューティング

### よくある問題と解決方法

#### 1. Redis接続エラー

**症状**: アプリケーションが起動しない、ヘルスチェックが失敗する

**解決方法**:
```bash
# 環境変数確認
flyctl secrets list

# Redis URL再設定
flyctl secrets set REDIS_URL="correct-redis-url"

# ログ確認
flyctl logs --app shogiwebroom
```

#### 2. Node.js メモリエラー

**症状**: `JavaScript heap out of memory`

**解決方法**:
```bash
# Fly.io メモリ増加
flyctl scale memory 512 --app shogiwebroom

# またはローカル
export NODE_OPTIONS="--max-old-space-size=4096"
```

#### 3. Docker ビルドエラー

**症状**: Docker イメージビルド失敗

**解決方法**:
```bash
# キャッシュクリア
docker system prune -a

# 再ビルド
docker-compose build --no-cache

# または本番ビルドテスト
docker build -f Dockerfile .
```

#### 4. Socket.IO 接続問題

**症状**: リアルタイム同期が動作しない

**解決方法**:
- Fly.io設定確認：`fly.toml` のWebSocketサポート
- ネットワークポート確認
- CORS設定確認

#### 5. OpenSSL Legacy Provider エラー

**症状**: `error:0308010C:digital envelope routines::unsupported`

**解決方法**:
```bash
export NODE_OPTIONS="--openssl-legacy-provider"
```

### デバッグコマンド

```bash
# アプリケーション状態
flyctl status --app shogiwebroom

# ログ監視
flyctl logs --app shogiwebroom -f

# SSHアクセス（デバッグ用）
flyctl ssh console --app shogiwebroom

# Redis接続テスト
curl https://shogiwebroom.fly.dev/api/health/redis
```

## 📊 監視とログ確認

### ヘルスチェック エンドポイント

#### 基本ヘルスチェック
```
GET https://shogiwebroom.fly.dev/api/health
```

**レスポンス例**:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-15T13:49:00.000Z",
  "service": "shogiwebroom",
  "redis": {
    "connected": true,
    "latency": 15
  },
  "memory": {
    "heapUsed": 45000000,
    "heapTotal": 67000000,
    "external": 12000000
  },
  "uptime": 3600
}
```

#### Redis詳細チェック
```
GET https://shogiwebroom.fly.dev/api/health/redis
```

### Fly.io 監視機能

```bash
# リアルタイムログ
flyctl logs -f

# メトリクス確認
flyctl info

# スケーリング状況
flyctl scale show

# 過去のデプロイ履歴
flyctl releases
```

### カスタムアラート設定

Fly.io では以下の監視が自動設定されています：

- **ヘルスチェック**: 10秒間隔で `/api/health` をチェック
- **TCP チェック**: 15秒間隔でポート接続確認
- **メモリ監視**: 256MB制限での自動監視

## 💰 コスト管理のベストプラクティス

### Fly.io 料金最適化

#### 1. 適切なマシンサイズ

```bash
# 現在の設定確認
flyctl scale show

# メモリ最適化（最小: 256MB）
flyctl scale memory 256

# CPU最適化
flyctl scale count 1
```

#### 2. 自動停止設定

`fly.toml` 設定:
```toml
[http_service]
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
```

#### 3. リージョン最適化

```bash
# アジア太平洋リージョン（Tokyo）使用
primary_region = 'nrt'
```

### Upstash Redis コスト管理

- **Free Tier**: 10,000コマンド/日まで無料
- **データ容量**: 256MBまで無料
- **接続数**: 30同時接続まで無料

### 推定月額コスト

**最小構成**:
- Fly.io: $0（低トラフィック時）〜$5/月
- Upstash Redis: $0（Free Tier内）
- **合計**: $0〜$5/月

**本格運用**:
- Fly.io: $5〜$20/月（トラフィック依存）
- Upstash Redis: $0〜$10/月
- **合計**: $5〜$30/月

### コスト監視

```bash
# 使用量確認
flyctl billing show

# マシン稼働状況
flyctl status
flyctl info
```

## 🎯 本番運用チェックリスト

### デプロイ前確認

- [ ] 全ての環境変数が正しく設定されている
- [ ] Redisに接続できる
- [ ] ローカルでDockerビルドが成功する
- [ ] ヘルスチェックエンドポイントが正常動作する
- [ ] WebSocket接続が正常に動作する

### デプロイ後確認

- [ ] アプリケーションが正常に起動している
- [ ] ヘルスチェックが成功している
- [ ] Redisに正常に接続している
- [ ] Socket.IOの接続が正常に動作している
- [ ] 複数ユーザーでのリアルタイム同期が動作している

### 定期メンテナンス

- [ ] 週1回: アプリケーションログ確認
- [ ] 月1回: セキュリティアップデート確認
- [ ] 月1回: 依存関係の更新確認
- [ ] 四半期1回: パフォーマンス最適化レビュー

## 🔗 参考リンク

- [Fly.io Documentation](https://fly.io/docs/)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [Nuxt.js Documentation](https://nuxtjs.org/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Docker Documentation](https://docs.docker.com/)

## 📞 サポート

問題が発生した場合：

1. **ログ確認**: `flyctl logs --app shogiwebroom`
2. **ヘルスチェック**: `curl https://shogiwebroom.fly.dev/api/health`
3. **GitHub Issues**: プロジェクトのGitHubリポジトリでIssue作成
4. **Fly.io サポート**: [Fly.io Community](https://community.fly.io/)

---

**最終更新**: 2025-08-15  
**バージョン**: 1.0.0