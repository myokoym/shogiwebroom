# Docker でクイックスタート - Shogiwebroom

10分以内で Shogiwebroom を Docker 環境で動かすためのクイックガイドです。

## ⚡ 5分でスタート

### 必要なもの

- Docker（20.x 以上）
- Docker Compose（2.x 以上）
- Git

### インストール確認

```bash
docker --version
docker-compose --version
git --version
```

## 🚀 クイックスタート（10分以内）

### 1. リポジトリクローン（1分）

```bash
git clone https://github.com/myokoym/shogiwebroom.git
cd shogiwebroom
```

### 2. Docker 環境起動（5分）

```bash
# バックグラウンドで起動
docker-compose up -d

# 起動確認（ログ表示）
docker-compose logs -f app
```

### 3. アクセス確認（1分）

ブラウザで以下にアクセス：

- **アプリ**: http://localhost:3000
- **Redis**: localhost:6379（内部接続のみ）

### 4. 動作テスト（3分）

1. ブラウザで http://localhost:3000 を開く
2. 「新しい部屋を作る」をクリック
3. 別のブラウザタブで同じURLにアクセス
4. 将棋の駒をドラッグ＆ドロップして同期を確認

## 📁 Docker 環境の構成

### サービス構成

```yaml
services:
  app:      # Nuxt.js アプリケーション
    - ポート: 3000 (Web), 9229 (デバッグ)
    - 開発モード: ホットリロード対応
  
  redis:    # Redis データストア
    - ポート: 6379
    - データ永続化: 開発時は無効
```

### ファイル構成

```
shogiwebroom/
├── docker-compose.yml         # 基本設定
├── compose.override.yml       # 開発用オーバーライド
├── Dockerfile.dev            # 開発用イメージ
├── Dockerfile                # 本番用イメージ
└── .dockerignore
```

## 🛠 開発フロー

### 基本コマンド

```bash
# 環境起動
docker-compose up -d

# ログ確認
docker-compose logs -f app      # アプリログ
docker-compose logs -f redis    # Redisログ
docker-compose logs -f          # 全体ログ

# 環境停止
docker-compose down

# 完全リセット（データ削除）
docker-compose down -v
```

### コードの編集

ソースコードは **リアルタイム反映** されます：

1. `components/`, `pages/`, `server/` 以下のファイルを編集
2. 自動的にアプリケーションが再起動
3. ブラウザを更新して変更確認

### 依存関係の追加

```bash
# コンテナ内でnpm install実行
docker-compose exec app npm install package-name

# または一度停止して再ビルド
docker-compose down
docker-compose up --build -d
```

## 🐛 VS Code でのデバッグ設定

### 1. VS Code 拡張機能をインストール

- **Docker** (Microsoft)
- **Remote - Containers** (Microsoft)

### 2. デバッグ設定ファイル作成

`.vscode/launch.json` を作成：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Docker: Attach to Node",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "address": "localhost",
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/app",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### 3. デバッグ実行

1. Docker環境が起動していることを確認
2. VS Codeで `F5` を押す または「実行とデバッグ」→「Docker: Attach to Node」
3. コードにブレークポイントを設置
4. ブラウザでアプリにアクセスしてデバッグ開始

### 4. コンテナ内での作業

```bash
# コンテナにシェル接続
docker-compose exec app sh

# コンテナ内でのコマンド実行例
npm list                    # パッケージ一覧
node --version             # Node.js バージョン確認
npm run dev               # 開発サーバー直接起動
```

## ❌ よくある問題と解決方法

### 1. ポート競合エラー

**エラー**: `bind: address already in use`

**解決方法**:
```bash
# ポート使用状況確認
lsof -i :3000
lsof -i :6379

# プロセス終了後に再起動
docker-compose down
docker-compose up -d
```

### 2. Redis接続エラー

**エラー**: `Redis connection failed`

**解決方法**:
```bash
# Redis コンテナ状態確認
docker-compose ps redis

# Redis ログ確認
docker-compose logs redis

# Redis コンテナ再起動
docker-compose restart redis
```

### 3. ホットリロードが効かない

**解決方法**:
```bash
# 環境変数確認
docker-compose exec app env | grep CHOKIDAR

# ファイル監視強制有効化
# compose.override.yaml に以下を追加:
environment:
  - CHOKIDAR_USEPOLLING=true
```

### 4. Node.js メモリエラー

**エラー**: `JavaScript heap out of memory`

**解決方法**:
```bash
# docker-compose.override.yaml に追加:
environment:
  - NODE_OPTIONS=--max-old-space-size=4096
```

### 5. 依存関係の問題

**解決方法**:
```bash
# node_modules クリア再ビルド
docker-compose down
docker volume rm shogiwebroom_node_modules
docker-compose up --build -d
```

### 6. Docker イメージの問題

**解決方法**:
```bash
# 全体クリア
docker-compose down -v --rmi all
docker system prune -a

# 再ビルド
docker-compose up --build -d
```

## 📊 開発時の確認ポイント

### サービス状態確認

```bash
# コンテナ稼働状況
docker-compose ps

# リソース使用量
docker stats

# ボリューム使用量
docker volume ls
docker volume inspect shogiwebroom_node_modules
```

### アプリケーション確認

```bash
# ヘルスチェック
curl http://localhost:3000/api/health

# Redis接続確認
curl http://localhost:3000/api/health/redis

# WebSocket接続テスト
# ブラウザの開発者ツール > Network > WS タブで確認
```

### ログ監視

```bash
# リアルタイムログ監視
docker-compose logs -f --tail=50 app

# エラーログのみ抽出
docker-compose logs app 2>&1 | grep -i error

# 特定時間範囲のログ
docker-compose logs --since "2025-08-15T10:00:00" app
```

## 🎯 開発効率化のコツ

### 1. エイリアス設定

`.bashrc` または `.zshrc` に追加：

```bash
alias dcu="docker-compose up -d"
alias dcd="docker-compose down"
alias dcl="docker-compose logs -f"
alias dcb="docker-compose up --build -d"
alias dce="docker-compose exec app"
```

### 2. ファイル監視設定

大きなプロジェクトでは監視ファイル数を調整：

```bash
# ~/.bashrc に追加
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 3. 開発用環境変数

`compose.override.yaml` をカスタマイズ：

```yaml
environment:
  - NODE_ENV=development
  - DEBUG=socket.io:*,app:*
  - LOG_LEVEL=debug
  - NUXT_HOST=0.0.0.0
  - NUXT_PORT=3000
```

### 4. VSCode ワークスペース設定

`.vscode/settings.json`:

```json
{
  "docker.showStartPage": false,
  "docker.attachShellCommand.linuxContainer": "/bin/sh",
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.nuxt/**": true
  }
}
```

## 🔗 次のステップ

Docker環境での開発に慣れたら：

1. **本番デプロイ**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) を参照
2. **カスタマイズ**: `fly.toml`, `docker-compose.yml` の設定調整
3. **監視設定**: Prometheus, Grafana の追加
4. **CI/CD構築**: GitHub Actions の設定

## 🆘 トラブル時の緊急対応

### 完全リセット手順

```bash
# 1. 全てのコンテナを停止・削除
docker-compose down -v --rmi all

# 2. Dockerシステムクリア
docker system prune -a -f

# 3. 再構築
git pull  # 最新コード取得（必要に応じて）
docker-compose up --build -d

# 4. 動作確認
curl http://localhost:3000/api/health
```

### 緊急時の連絡先

- **Docker 公式ドキュメント**: https://docs.docker.com/
- **プロジェクトIssues**: GitHubリポジトリのIssues
- **Community**: Docker Community Forums

---

**最終更新**: 2025-08-15  
**所要時間**: 初回セットアップ10分、日常開発1分で起動