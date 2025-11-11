# LiaoLiao セットアップガイド

このガイドでは、LiaoLiao AI媒人マッチングアプリを0から構築・デプロイするための詳細な手順を説明します。

---

## 📋 目次

1. [前提条件](#前提条件)
2. [OpenAI APIのセットアップ](#openai-apiのセットアップ)
3. [Firebaseプロジェクトのセットアップ](#firebaseプロジェクトのセットアップ)
4. [ローカル開発環境のセットアップ](#ローカル開発環境のセットアップ)
5. [本番環境へのデプロイ](#本番環境へのデプロイ)
6. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

### 必要なソフトウェア

- **Node.js** 18.0.0以上
  ```bash
  node --version  # v18.0.0以上であることを確認
  ```

- **npm** 9.0.0以上
  ```bash
  npm --version   # v9.0.0以上であることを確認
  ```

- **Git**
  ```bash
  git --version
  ```

### 必要なアカウント

1. **OpenAI アカウント** - https://platform.openai.com/
2. **Firebase アカウント** - https://console.firebase.google.com/
3. **Google Cloud アカウント** (Firebaseと連携)

---

## OpenAI APIのセットアップ

### 1. OpenAI APIキーの取得

1. [OpenAI Platform](https://platform.openai.com/) にアクセス
2. サインアップまたはログイン
3. 右上のアカウントメニューから「API Keys」を選択
4. 「Create new secret key」をクリック
5. キーをコピーして安全な場所に保存（後で使用）

### 2. 課金設定

1. OpenAI Dashboardで「Billing」セクションに移動
2. クレジットカードを登録
3. 使用制限を設定（推奨: 月$50-100から開始）

### 3. 必要なモデルへのアクセス確認

以下のモデルが利用可能であることを確認：
- **GPT-4 Turbo** (`gpt-4-turbo-preview`)
- **Text Embedding 3 Small** (`text-embedding-3-small`)

---

## Firebaseプロジェクトのセットアップ

### 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `liaoliao-app`）
4. Google Analyticsを有効化（推奨）
5. プロジェクトを作成

### 2. Webアプリの追加

1. プロジェクトのダッシュボードで「ウェブ」アイコンをクリック
2. アプリのニックネームを入力（例: `LiaoLiao Web`）
3. 「Firebase Hosting を設定する」をチェック
4. 「アプリを登録」をクリック
5. 設定情報（API Key、Auth Domain等）をコピー

**設定例**:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "liaoliao-app.firebaseapp.com",
  projectId: "liaoliao-app",
  storageBucket: "liaoliao-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};
```

### 3. Firebase Authentication の設定

1. 左側のメニューから「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブを選択
4. 「メール/パスワード」を有効化
5. 保存

### 4. Cloud Firestore の設定

1. 左側のメニューから「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. ロケーションを選択（例: `asia-northeast1` - 東京）
4. 「本番環境モード」で開始（セキュリティルールは後でアップロード）
5. 「有効にする」をクリック

### 5. Firebase Storage の設定

1. 左側のメニューから「Storage」を選択
2. 「始める」をクリック
3. デフォルトのセキュリティルールで開始
4. 同じロケーションを選択
5. 「完了」をクリック

### 6. Firebase CLI のインストール

```bash
npm install -g firebase-tools
```

Firebase にログイン:
```bash
firebase login
```

### 7. Firebase プロジェクトの初期化

プロジェクトディレクトリで：

```bash
firebase init
```

以下を選択：
- **Firestore**: Configure security rules and indexes files
- **Functions**: Configure a Cloud Functions directory
- **Hosting**: Configure files for Firebase Hosting
- **Storage**: Configure a security rules file for Cloud Storage

設定：
- プロジェクトを選択: 作成したFirebaseプロジェクト
- Firestore rules: `firestore.rules` (既存ファイルを使用)
- Firestore indexes: `firestore.indexes.json` (既存ファイルを使用)
- Functions: JavaScript, ESLint有効
- Hosting: `public` ディレクトリ
- Single-page app: Yes
- GitHub actions: No

---

## ローカル開発環境のセットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/liaoliao-app.git
cd liaoliao-app
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env` ファイルを作成：

```bash
cp .env.example .env
```

`.env` ファイルを編集：

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Firebase Configuration (Firebase Consoleから取得)
FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=liaoliao-app.firebaseapp.com
FIREBASE_PROJECT_ID=liaoliao-app
FIREBASE_STORAGE_BUCKET=liaoliao-app.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdefghij

# Server Configuration
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this

# Vector Database (オプション - 将来の拡張用)
# PINECONE_API_KEY=your-pinecone-key
# PINECONE_ENVIRONMENT=us-east-1-aws
# PINECONE_INDEX=liaoliao-embeddings
```

### 4. Firebase設定ファイルの更新

`public/js/config.js` を開き、Firebaseの設定を更新：

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_FIREBASE_API_KEY",
    authDomain: "liaoliao-app.firebaseapp.com",
    projectId: "liaoliao-app",
    storageBucket: "liaoliao-app.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefghij"
};
```

### 5. Firebase Service Account の設定（オプション）

本番環境やCloud Functionsで必要：

1. Firebase Console → プロジェクト設定 → サービスアカウント
2. 「新しい秘密鍵の生成」をクリック
3. JSONファイルをダウンロード
4. `serviceAccountKey.json` として保存（`.gitignore`に含まれています）

### 6. Firestore セキュリティルールのデプロイ

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

### 7. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

### 8. Firebase Emulators での開発（推奨）

ローカルでFirebaseサービスをエミュレート：

```bash
npm run serve
```

以下のURLでアクセス可能：
- **アプリ**: http://localhost:5000
- **Emulator UI**: http://localhost:4000

---

## 本番環境へのデプロイ

### 1. 本番環境の環境変数設定

Firebase Functions用の環境変数を設定：

```bash
firebase functions:config:set \
  openai.api_key="YOUR_OPENAI_API_KEY" \
  openai.model="gpt-4-turbo-preview" \
  openai.embedding_model="text-embedding-3-small"
```

確認：
```bash
firebase functions:config:get
```

### 2. ビルド（必要に応じて）

本番用の最適化：

```bash
# 必要に応じてバンドル処理やminificationを実行
# 現在はVanilla JSなので、そのままでOK
```

### 3. Firebaseへのデプロイ

全てデプロイ：
```bash
firebase deploy
```

個別にデプロイ：
```bash
firebase deploy --only hosting        # フロントエンドのみ
firebase deploy --only functions      # バックエンドのみ
firebase deploy --only firestore      # Firestoreルールのみ
firebase deploy --only storage        # Storageルールのみ
```

### 4. デプロイ後の確認

1. デプロイ完了後に表示されるURLにアクセス
2. アカウント登録・ログインをテスト
3. AI会話機能をテスト
4. マッチング機能をテスト

### 5. カスタムドメインの設定（オプション）

1. Firebase Console → Hosting → ドメインを追加
2. 所有しているドメインを入力
3. DNS設定を更新（AレコードまたはTXTレコード）
4. SSL証明書が自動的に設定される（最大24時間）

---

## トラブルシューティング

### よくある問題と解決策

#### 1. Firebase認証エラー

**問題**: "Permission denied" エラー

**解決策**:
```bash
# Firebase CLIでログアウト・ログイン
firebase logout
firebase login

# プロジェクトを再選択
firebase use --add
```

#### 2. OpenAI APIエラー

**問題**: "Invalid API key" エラー

**解決策**:
- `.env` ファイルのAPIキーを確認
- OpenAI Dashboardで課金設定を確認
- APIキーの権限を確認

#### 3. Firestore権限エラー

**問題**: "Missing or insufficient permissions"

**解決策**:
```bash
# セキュリティルールを再デプロイ
firebase deploy --only firestore:rules

# Firestore Consoleでルールを手動確認
```

#### 4. CORS エラー

**問題**: フロントエンドからAPIリクエストでCORSエラー

**解決策**:
- `server/index.js` のCORS設定を確認
- Firebase Hostingのリライト設定を確認
- ブラウザのキャッシュをクリア

#### 5. 依存関係のインストールエラー

**問題**: `npm install` で失敗

**解決策**:
```bash
# キャッシュをクリア
npm cache clean --force

# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

#### 6. Firebase Emulatorの起動エラー

**問題**: ポート衝突

**解決策**:
```bash
# 使用中のポートを確認
lsof -i :5000
lsof -i :8080

# プロセスを終了
kill -9 <PID>

# または firebase.json でポートを変更
```

---

## パフォーマンス最適化

### 1. Firestore クエリの最適化

- 複合インデックスを作成
- ページネーションを実装
- リスナーの適切な管理

### 2. OpenAI API コスト削減

- 応答キャッシュの実装
- トークン数の制限
- ストリーミングレスポンスの活用

### 3. フロントエンドの最適化

- 画像の遅延読み込み
- コードスプリッティング
- Service Workerの実装

---

## セキュリティチェックリスト

- [ ] `.env` ファイルを `.gitignore` に追加
- [ ] Service Account JSONを `.gitignore` に追加
- [ ] Firestore Security Rulesをテスト
- [ ] Storage Security Rulesをテスト
- [ ] レート制限を設定
- [ ] HTTPS を強制
- [ ] APIキーをローテーション
- [ ] ユーザー入力をサニタイズ

---

## 次のステップ

1. **モニタリングの設定**
   - Firebase Analytics
   - Error tracking (Sentry等)
   - Performance monitoring

2. **CI/CD パイプライン**
   - GitHub Actions
   - 自動テスト
   - 自動デプロイ

3. **スケーリング**
   - Cloud Functions のスケーリング設定
   - Firestoreのインデックス最適化
   - CDNの活用

4. **機能追加**
   - プッシュ通知
   - リアルタイムチャット
   - ビデオ通話

---

## サポート

問題が解決しない場合：

1. [GitHub Issues](https://github.com/yourusername/liaoliao-app/issues) で報告
2. [Firebase サポート](https://firebase.google.com/support)
3. [OpenAI コミュニティ](https://community.openai.com/)

---

**これで LiaoLiao のセットアップが完了です！ 🎉**

Happy coding! 💝
