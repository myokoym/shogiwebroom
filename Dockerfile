# ====================================
# 本番用Dockerfile
# ====================================
# マルチステージビルドを使用して本番用の軽量なイメージを作成

# ====================================
# ビルドステージ
# ====================================
FROM node:18-alpine3.18 AS builder

# ビルド時に必要な環境変数を設定
# OpenSSL legacy providerを有効にしてNode.js 18での互換性問題を解決
ENV NODE_OPTIONS="--openssl-legacy-provider"

# 作業ディレクトリを設定
WORKDIR /app

# package.json と package-lock.json を先にコピー
# これによりDockerのレイヤーキャッシュを活用し、依存関係が変更されない限り
# npm installをスキップできる
COPY package*.json ./

# 本番用依存関係のみをクリーンインストール
# npm ciを使用することで、package-lock.jsonに基づいた確実なインストールを実行
RUN npm ci --only=production --no-audit --no-fund

# 開発依存関係もインストール（ビルド時に必要）
RUN npm ci --no-audit --no-fund

# アプリケーションのソースコードをコピー
COPY . .

# Nuxt.jsアプリケーションをビルド
# 静的ファイルと最適化されたコードを生成
RUN npm run build

# ====================================
# 本番ステージ
# ====================================
FROM node:18-alpine3.18 AS production

# 本番環境の環境変数を設定
ENV NODE_ENV=production
ENV NODE_OPTIONS="--openssl-legacy-provider"

# curlをインストール（ヘルスチェック用）
RUN apk add --no-cache curl

# セキュリティ向上のため非rootユーザーを使用
# Alpine Linuxでは標準でnodeユーザーが利用可能
USER node

# 作業ディレクトリを設定（nodeユーザーのホームディレクトリ配下）
WORKDIR /home/node/app

# ビルドステージから本番に必要なファイルのみをコピー
# 所有者をnodeユーザーに変更
COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.nuxt ./.nuxt
COPY --from=builder --chown=node:node /app/static ./static
COPY --from=builder --chown=node:node /app/server ./server
COPY --from=builder --chown=node:node /app/nuxt.config.js ./

# アプリケーションが使用するポート3000を公開
EXPOSE 3000

# ヘルスチェックを設定（オプション）
# Dockerコンテナの健全性を監視
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# 本番サーバーを起動
# package.jsonのstartスクリプトを実行
CMD ["npm", "start"]