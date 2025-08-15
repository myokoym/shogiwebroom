# Technology Stack

## Architecture
- **アーキテクチャパターン**: SSR (Server-Side Rendering) with Real-time WebSocket
- **デプロイメントモデル**: Single Node.js application serving both frontend and backend
- **データ永続化**: Redis for room state persistence
- **リアルタイム通信**: WebSocket (Socket.IO) for bidirectional communication

## Frontend
### Framework & Libraries
- **Nuxt.js 2.x**: Vue.js based SSR framework
- **Vue.js**: Reactive UI framework
- **Bootstrap Vue**: UI component library
- **TypeScript**: Type-safe development support

### Real-time & Utilities
- **Socket.IO Client**: WebSocket client for real-time sync
- **vue-clipboard2**: Clipboard operations for URL sharing
- **Moment.js**: Date/time formatting for chat timestamps

### Asset Management
- **Audio**: MP3 files for piece movement sounds
- **Images**: Multiple piece design sets (5 fonts)
  - 青柳隷書（aoyagireisho）
  - 源暎ちくみん（genei-chikumin）
  - きりえ字（kirieji）
  - 衡山行書（kouzangyousho）
  - しょかき行（shokaki-gyo）

## Backend
### Core Technologies
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **Socket.IO Server**: WebSocket server for real-time features

### Data Storage
- **Redis**: In-memory data store for room states
  - Connection via `ioredis` client
  - Supports both local and cloud Redis (via REDIS_URL env)

## Development Environment
### Build Tools
- **Nuxt Build System**: Webpack-based build pipeline
- **TypeScript Compiler**: Via @nuxt/typescript-build
- **Nodemon**: Auto-restart on server changes in development

### Package Management
- **npm**: Node package manager
- **package-lock.json**: Dependency lock file

## Common Commands
```bash
# Development (with hot reload at localhost:3000)
npm run dev

# Production build
npm run build

# Production server
npm run start

# Static site generation
npm run generate
```

## Environment Variables
- `NODE_ENV`: Environment mode (development/production)
- `REDIS_URL`: Redis connection URL (optional, uses local Redis if not set)
- `PORT`: Server port (default from Nuxt config)
- `HOST`: Server host (default from Nuxt config)

## Port Configuration
- **Development**: 3000 (default)
- **Production**: Process environment PORT or 3000

## Browser Requirements
- Modern browsers with WebSocket support
- ES2018 JavaScript support
- Mobile Safari, Chrome Mobile supported

## Performance Considerations
- Server-side rendering for initial page load
- WebSocket for low-latency real-time updates
- Redis for fast room state retrieval
- Vendor bundling for Socket.IO client optimization