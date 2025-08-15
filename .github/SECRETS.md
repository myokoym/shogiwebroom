# GitHub Secrets Configuration

このプロジェクトのCI/CDワークフローを正常に動作させるために必要なGitHub Secretsの設定方法について説明します。

## 必須Secrets

### FLY_API_TOKEN
- **説明**: Fly.ioへのデプロイに必要なAPIトークン
- **取得方法**:
  1. Fly.ioにログイン
  2. `flyctl auth token` コマンドを実行してトークンを取得
  3. または、Fly.ioダッシュボードから「Access Tokens」セクションで生成
- **設定場所**: Repository Settings > Secrets and variables > Actions
- **名前**: `FLY_API_TOKEN`
- **値**: Fly.ioから取得したAPIトークン

## Secretsの設定手順

1. GitHubリポジトリページにアクセス
2. **Settings** タブをクリック
3. 左サイドバーの **Secrets and variables** > **Actions** をクリック
4. **New repository secret** ボタンをクリック
5. Secret名と値を入力して **Add secret** をクリック

## セキュリティ考慮事項

### トークンの管理
- APIトークンは定期的にローテーションすることを推奨
- トークンには最小限の権限のみを付与
- 不要になったトークンは即座に削除

### アクセス制御
- Secretsにアクセスできるユーザーを制限
- Production環境へのデプロイには承認プロセスを設定することを推奨

## トラブルシューティング

### よくあるエラー

#### `FLY_API_TOKEN is not set`
- **原因**: Secret が正しく設定されていない
- **解決方法**: Secret名が正確であることを確認し、再設定

#### `Authentication failed`
- **原因**: トークンが無効または期限切れ
- **解決方法**: 新しいトークンを生成して再設定

#### `App not found`
- **原因**: Fly.ioアプリケーション名が間違っている
- **解決方法**: `fly.toml` のapp名を確認

## 環境別設定（オプション）

本プロジェクトでは現在本番環境のみですが、ステージング環境を追加する場合は以下のSecretsも検討してください：

### ステージング環境用（将来的に追加する場合）
- `FLY_API_TOKEN_STAGING`: ステージング環境用のAPIトークン
- `STAGING_APP_NAME`: ステージング環境のアプリ名

## 検証方法

Secretsが正しく設定されているかを確認するには：

1. テスト用のプルリクエストを作成
2. CI ワークフローが正常に動作することを確認
3. masterブランチへのマージでデプロイワークフローが実行されることを確認

## 関連ドキュメント

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Fly.io API Token Documentation](https://fly.io/docs/flyctl/auth-token/)
- [Fly.io Deployment with GitHub Actions](https://fly.io/docs/app-guides/continuous-deployment-with-github-actions/)