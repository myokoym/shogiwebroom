# ====================================
# 本番用Dockerfile
# ====================================
# マルチステージビルドを使用して本番用の軽量なイメージを作成

# ====================================
# ビルドステージ
# ====================================
FROM node:18-alpine3.18 AS builder

# ビルド時に必要な環境変数を設定

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
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

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

# Add health check for container health monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
                 const options = { host: 'localhost', port: 3000, timeout: 2000 }; \
                 const request = http.request(options, (res) => { \
                   console.log('Health check status:', res.statusCode); \
                   process.exit(res.statusCode === 200 ? 0 : 1); \
                 }); \
                 request.on('error', () => process.exit(1)); \
                 request.end();"

# Use dumb-init to handle signals properly and start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.js"]