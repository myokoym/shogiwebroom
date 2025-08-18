# Technical Design

## 概要

本設計書は、Shogiwebroomアプリケーションに対する包括的な自動テストシステムの実装アプローチを定義します。Docker環境での完全な分離テスト、継続的インテグレーション、そして本番環境へのデプロイ前の品質保証を実現します。

## 要件マッピング

### 設計コンポーネントのトレーサビリティ

各設計コンポーネントが対応する要件：

- **Docker Test Environment** → REQ-1: Dockerテスト環境の構築
- **Build Verification System** → REQ-2: ビルドプロセスの検証
- **Server Testing Framework** → REQ-3: サーバー起動テスト
- **Redis Testing Module** → REQ-4: Redis接続テスト
- **Component Testing Suite** → REQ-5: UIコンポーネントのレンダリングテスト
- **E2E WebSocket Tests** → REQ-6: WebSocket機能のEnd-to-Endテスト
- **CI/CD Integration** → REQ-7: CI/CDパイプライン統合
- **Test Reporter** → REQ-8: テストカバレッジとレポート

### ユーザーストーリーのカバレッジ

- **環境依存問題の検出**: Docker環境での完全な分離により実現
- **ビルド検証の自動化**: 専用テストコンテナとスクリプトで対応
- **サーバー起動確認**: ヘルスチェックとエンドポイントテストで実装
- **Redis通信検証**: 専用テストスクリプトとモックサーバーで実現
- **UI検証**: Vue Test UtilsとJSDOMでSSR環境をシミュレート
- **リアルタイム同期確認**: Socket.IO Clientを使用したE2Eテスト
- **CI/CD自動実行**: GitHub Actionsワークフローで統合
- **レポート生成**: Jest報告とカスタムレポーターで実現

## アーキテクチャ

```mermaid
graph TB
    subgraph "Docker Environment"
        A[Test Orchestrator] --> B[Build Test Container]
        A --> C[Unit Test Container]
        A --> D[Integration Test Container]
        A --> E[E2E Test Container]
        
        B --> F[Nuxt Build Process]
        C --> G[Jest + Vue Test Utils]
        D --> H[API & Redis Tests]
        E --> I[Playwright + WebSocket Route API]
        
        J[TestContainers Redis] --> D
        J --> E
        K[Web Container] --> E
        L[Artillery Load Test] --> K
    end
    
    M[GitHub Actions] --> A
    A --> N[Test Reports]
    N --> O[Coverage Report]
    N --> P[Allure Report]
    N --> Q[JUnit XML]
```

### 技術スタック

小規模システム向けの最小限構成：

- **テストランナー**: Jest 26.x（Nuxt.js 2.xとの互換性）
- **Vueコンポーネントテスト**: @vue/test-utils 1.x
- **E2Eテスト**: Playwright（基本機能のみ）
- **WebSocketテスト**: Socket.IO Client（シンプルな接続テスト）
- **モック**: Jest Mocks
- **カバレッジ**: Istanbul (jest --coverage)
- **CI/CD**: GitHub Actions

### アーキテクチャ決定の根拠

- **なぜPlaywright**: WebSocketテストの基本機能をサポート、軽量で高速
- **なぜJest**: Nuxt.js 2.xの公式サポート、カバレッジ機能内蔵
- **なぜ最小構成**: 小規模システムに適したシンプルなテスト環境
- **なぜGitHub Actions**: 既存のCI/CD設定との統合、無料枠

## データフロー

### テスト実行フロー

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant GA as GitHub Actions
    participant DC as Docker Compose
    participant TC as Test Containers
    participant Rep as Reporter
    
    Dev->>GH: Push Code
    GH->>GA: Trigger Workflow
    GA->>DC: docker compose -f compose.test.yaml up
    DC->>TC: Start Test Services
    TC->>TC: Run Test Suites
    TC->>Rep: Generate Reports
    Rep->>GA: Upload Artifacts
    GA->>GH: Update PR Status
    GA->>Dev: Notify Results
```

## コンポーネントとインターフェース

### シンプルなテスト関数

```javascript
// 基本的なテスト関数のみ実装
async function testBuild() {
  // Nuxt.jsビルドテスト
  return await exec('npm run build');
}

async function testRedisConnection() {
  // Redis接続テスト
  const redis = new Redis(process.env.REDIS_URL);
  return await redis.ping();
}

async function testWebSocketConnection() {
  // WebSocket基本接続テスト
  const socket = io('http://web:3000');
  return new Promise(resolve => {
    socket.on('connect', () => resolve(true));
    setTimeout(() => resolve(false), 5000);
  });
}
```

### フロントエンドコンポーネント

| コンポーネント名 | 責任 | Props/State概要 |
|-----------------|------|----------------|
| TestRunner | テスト実行管理 | testSuites, currentTest, results |
| TestMonitor | リアルタイムログ表示 | logs, status, progress |
| CoverageViewer | カバレッジ表示 | coverageData, threshold |
| ReportGenerator | レポート生成 | testResults, format |

### APIエンドポイント

| メソッド | ルート | 目的 | 認証 | ステータスコード |
|---------|-------|------|-----|-----------------|
| GET | /api/test/status | テスト実行状態取得 | 不要 | 200, 500 |
| POST | /api/test/run | テスト実行開始 | 不要 | 202, 400, 500 |
| GET | /api/test/results/:id | テスト結果取得 | 不要 | 200, 404, 500 |
| GET | /api/test/coverage | カバレッジ取得 | 不要 | 200, 500 |
| POST | /api/test/stop | テスト停止 | 不要 | 200, 500 |

## データモデル

### ドメインエンティティ

1. **TestSuite**: テストスイートの定義と設定
2. **TestCase**: 個別テストケースの定義
3. **TestResult**: テスト実行結果
4. **TestReport**: 統合レポート
5. **CoverageData**: カバレッジ情報

### エンティティ関係

```mermaid
erDiagram
    TESTSUITE ||--o{ TESTCASE : "contains"
    TESTCASE ||--|| TESTRESULT : "produces"
    TESTSUITE ||--|| TESTREPORT : "generates"
    TESTREPORT ||--|| COVERAGEDATA : "includes"
    TESTRESULT ||--o{ ASSERTION : "has"
```

### データモデル定義

```typescript
interface TestSuite {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e';
  testCases: TestCase[];
  config: TestConfig;
  createdAt: Date;
}

interface TestCase {
  id: string;
  suiteId: string;
  name: string;
  description: string;
  assertions: Assertion[];
  timeout: number;
}

interface TestResult {
  id: string;
  testCaseId: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: Error;
  timestamp: Date;
}

interface TestReport {
  id: string;
  suiteResults: TestResult[];
  coverage: CoverageData;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  generatedAt: Date;
}

interface CoverageData {
  lines: { total: number; covered: number; percentage: number };
  functions: { total: number; covered: number; percentage: number };
  branches: { total: number; covered: number; percentage: number };
  statements: { total: number; covered: number; percentage: number };
}
```

## テスト環境構成

### Docker Compose Test Configuration

```yaml
# compose.test.yaml
services:
  test:
    build:
      context: .
      dockerfile: Dockerfile.test
    volumes:
      - .:/app:cached
      - /app/node_modules
      - test-results:/app/test-results
    environment:
      - NODE_ENV=test
      - TEST_MODE=minimal
    depends_on:
      - redis
      - web
    command: ["npm", "run", "test:quick"]
```

### テストスクリプト構成

```javascript
// scripts/test-runner.js
const testRunner = {
  suites: ['unit', 'integration', 'e2e'],
  parallel: false,  // 順次実行でシンプル化
  timeout: 30000,   // 30秒タイムアウト
  reporters: ['jest-default']
};

// scripts/test-redis.js (シンプルな接続テスト)
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

// scripts/test-websocket.js (基本的な接続テスト)
const io = require('socket.io-client');
const socket = io('http://web:3000');
```

## エラーハンドリング

### テスト失敗の処理

- **即座のフィードバック**: 失敗時に詳細なスタックトレース
- **スクリーンショット**: E2Eテスト失敗時の画面キャプチャ
- **ログ収集**: 関連するアプリケーションログの自動収集
- **リトライ機構**: 不安定なテストに対する自動リトライ（最大3回）

### タイムアウト管理

- ユニットテスト: 5秒
- 統合テスト: 10秒
- E2Eテスト: 15秒
- 全体のタイムアウト: 1分

## セキュリティ考慮事項

### テスト環境の分離

- テスト専用のRedisインスタンス
- 本番データベースへのアクセス禁止
- テスト用の環境変数分離

### 機密情報の管理

- GitHub Secretsでの環境変数管理
- テストログからの機密情報除外
- モックデータの使用

## パフォーマンス & スケーラビリティ

### パフォーマンス目標

| メトリック | 目標 | 測定方法 |
|-----------|------|---------|
| ユニットテスト実行時間 | < 10秒 | Jest timer |
| 統合テスト実行時間 | < 20秒 | Docker logs |
| E2Eテスト実行時間 | < 30秒 | Playwright metrics |
| 全テスト実行時間 | < 1分 | CI/CD duration |
| 並列実行数 | 2 | Docker containers |
| WebSocketカバレッジ | ≥60% | Istanbul |

### 最適化戦略

- **テストの順次実行**: シンプルな実行でデバッグを容易に
- **必要最小限のテスト**: 重要な機能のみテスト
- **Dockerキャッシュ活用**: 既存のイメージを再利用


## テスト戦略

### テストカバレッジ要件

- **ユニットテスト**: ≥50% コードカバレッジ
- **統合テスト**: 主要APIエンドポイントとRedis基本操作
- **E2Eテスト**: 最重要フロー2つ（ルーム作成、駒移動）
- **WebSocketコード**: ≥60% カバレッジ

### テストアプローチ

1. **ユニットテスト**
   - Vueコンポーネントの個別テスト
   - Vuexストアのアクション/ミューテーション
   - ユーティリティ関数

2. **統合テスト**
   - Express APIエンドポイント
   - Redis接続と操作
   - Socket.IOイベントハンドリング

3. **E2Eテスト**
   - ルーム作成と参加フロー
   - 駒の移動と同期
   - チャット機能
   - 棋譜の保存と読み込み
   - 複数デバイス間の同期



### CI/CDパイプライン

```mermaid
graph LR
    A[Code Push] --> B[Lint Check]
    B --> C[Build Test]
    C --> D[Unit Tests]
    D --> E[Integration Tests]
    E --> F[E2E Tests]
    F --> G{All Pass?}
    G -->|Yes| H[Deploy to Staging]
    G -->|No| I[Block Merge]
    H --> J[Performance Tests]
    J --> K[Deploy to Production]
```

### GitHub Actions設定

```yaml
# .github/workflows/test.yml
name: Test Suite
on:
  pull_request:
  push:
    branches: [master]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Cache Docker layers
        uses: actions/cache@v4
        with:
          path: /tmp/.buildx-cache
          key: ${{ runner.os }}-buildx-${{ hashFiles('**/package-lock.json') }}
      - name: Run tests
        run: docker compose -f compose.test.yaml up --abort-on-container-exit
      - name: Upload coverage
        uses: actions/upload-artifact@v3
        with:
          name: coverage-report
          path: test-results/coverage
```