# AI媒人マッチングアプリ - アーキテクチャ設計

## 🎯 プロジェクト概要

**アプリ名**: LiaoLiao (聊聊 = "話そう")
**コンセプト**: AIが仲人として、対話を通じて最適なパートナーを推薦するマッチングアプリ

## 🏗️ システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/HTML)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ AI会話UI     │  │プロフィール  │  │マッチング    │      │
│  │ (ChatBot)    │  │登録・管理    │  │リスト        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/WebSocket
┌─────────────────────────────────────────────────────────────┐
│              Backend (Node.js/Firebase Functions)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ API Gateway  │  │ Auth Service │  │ Match Engine │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ AI Service   │  │ RAG Memory   │  │ Embedding    │      │
│  │ (OpenAI)     │  │ Service      │  │ Service      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Firestore    │  │ Vector DB    │  │ Firebase     │      │
│  │ (User/Chat)  │  │ (Embeddings) │  │ Storage      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 📦 技術スタック

### フロントエンド
- **Base**: HTML5, CSS3, Vanilla JavaScript (既存コードベース活用)
- **Future**: React or Flutter (スケール時に移行)
- **UI Framework**: カスタムコンポーネント + Font Awesome
- **リアルタイム通信**: Firebase SDK + WebSocket

### バックエンド
- **Runtime**: Node.js 18+
- **Framework**: Express.js + Firebase Functions
- **認証**: Firebase Authentication
- **データベース**:
  - Firestore (ユーザープロフィール、チャット履歴)
  - Pinecone/Qdrant (ベクトル埋め込みDB)
- **ファイルストレージ**: Firebase Storage (プロフィール画像)

### AI・ML
- **LLM**: OpenAI GPT-4 / Claude 3.5 Sonnet
- **Embeddings**: OpenAI text-embedding-3-small
- **ベクトル検索**: Cosine Similarity
- **RAG**: LangChain + カスタムメモリストア

## 🔄 主要データフロー

### 1. ユーザー登録フロー
```
User → [プロフィール入力] → AI分析 → Embedding生成 → Firestore保存
                          ↓
                    価値観・趣味抽出
                          ↓
                    Vector DB保存
```

### 2. AI推薦フロー
```
User → [AI会話開始] → GPT分析 → Vector検索 → マッチング候補
                  ↓                    ↓
            ユーザー嗜好学習        Cosine類似度計算
                  ↓                    ↓
            RAGメモリ更新          推薦リスト生成
```

### 3. マッチング成立フロー
```
User A ←→ [AI仲介チャット] ←→ User B
    ↓                              ↓
 相互興味確認                   相互興味確認
    ↓                              ↓
    └────→ [Match成立] ←──────────┘
              ↓
      Contact情報開放
```

## 📊 データモデル

### Firestore コレクション

#### `users`
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  age: number,
  gender: string,
  location: GeoPoint,
  bio: string,
  interests: string[],
  values: {
    family: number,      // 0-10
    career: number,
    adventure: number,
    // ...
  },
  photos: string[],
  embedding: number[],  // 参照のみ、実体はVector DB
  createdAt: timestamp,
  lastActive: timestamp
}
```

#### `conversations`
```javascript
{
  conversationId: string,
  participants: [uid1, uid2],
  status: 'ai_mediated' | 'matched' | 'declined',
  messages: [
    {
      sender: 'user' | 'ai',
      content: string,
      timestamp: timestamp
    }
  ],
  matchScore: number,
  createdAt: timestamp
}
```

#### `matches`
```javascript
{
  matchId: string,
  userA: string,
  userB: string,
  score: number,
  reason: string,  // AIが生成したマッチ理由
  status: 'pending' | 'accepted' | 'declined',
  createdAt: timestamp
}
```

### Vector DB (Pinecone)
```javascript
{
  id: userId,
  values: [0.123, 0.456, ...],  // 1536次元埋め込み
  metadata: {
    age: number,
    gender: string,
    location: string,
    interests: string[]
  }
}
```

## 🤖 AI機能設計

### 1. AI仲人エージェント
**役割**: ユーザーとの会話を通じて、価値観・性格・好みを理解

**プロンプト構造**:
```
あなたは経験豊富な恋愛カウンセラー兼マッチングエージェントです。
ユーザーとの会話を通じて以下を達成してください：

1. 価値観の深掘り（家族観、キャリア、趣味など）
2. 過去の恋愛経験からのパターン抽出
3. 理想のパートナー像の具体化
4. 性格特性の把握

会話は自然で共感的に進め、ユーザーが本音を話しやすい雰囲気を作ってください。
```

### 2. マッチング推薦エンジン
**アルゴリズム**:
```python
def calculate_match_score(user_a, user_b):
    # 1. ベクトル類似度 (40%)
    embedding_similarity = cosine_similarity(
        user_a.embedding,
        user_b.embedding
    )

    # 2. 価値観一致度 (30%)
    values_match = calculate_values_alignment(
        user_a.values,
        user_b.values
    )

    # 3. 相補性スコア (20%)
    complementary = calculate_complementary_traits(
        user_a.personality,
        user_b.personality
    )

    # 4. 地理的近接性 (10%)
    location_score = calculate_distance_score(
        user_a.location,
        user_b.location
    )

    final_score = (
        0.4 * embedding_similarity +
        0.3 * values_match +
        0.2 * complementary +
        0.1 * location_score
    )

    return final_score
```

### 3. AI恋愛アドバイザー
**機能**:
- メッセージの返信アドバイス
- デートプラン提案
- 会話のきっかけ提供
- コミュニケーションのフィードバック

## 🔒 セキュリティとプライバシー

### 認証・認可
- Firebase Authentication (Email/Password, Google, Apple)
- JWT トークンベースのセッション管理
- 年齢確認プロセス（日本の法規制対応）

### データ保護
- 個人情報の暗号化（at rest & in transit）
- 匿名化された初期会話
- GDPRおよび個人情報保護法準拠
- ユーザーの明示的同意後のみ連絡先開放

### AI倫理
- 推薦理由の透明性（Explainable AI）
- バイアス検出と軽減
- ユーザーフィードバックによる継続的改善

## 📈 スケーラビリティ

### フェーズ1: MVP (現在)
- 100-1000ユーザー
- 単一リージョンデプロイ
- 基本的なマッチングアルゴリズム

### フェーズ2: グロース
- 10,000-100,000ユーザー
- マルチリージョン対応
- リアルタイム推薦の最適化
- A/Bテスト基盤

### フェーズ3: スケール
- 100万+ユーザー
- マイクロサービス化
- ML推薦モデルのカスタムトレーニング
- エッジキャッシング

## 🚀 デプロイメント

### 開発環境
```bash
npm run dev          # ローカル開発サーバー
firebase emulators:start  # Firebase エミュレータ
```

### ステージング
- Firebase Hosting (プレビューチャネル)
- Cloud Functions (staging環境変数)

### 本番
- Firebase Hosting (本番ドメイン)
- Cloud Functions (本番環境変数)
- CDN配信

## 💰 収益モデル

### フリーミアム
- **無料**: 月3回のAI推薦、基本チャット
- **プレミアム** (¥980/月):
  - 無制限のAI推薦
  - AI恋愛コーチング
  - 優先表示
  - 既読・入力中ステータス

### 追加課金
- スーパーライク: ¥200/回
- ブースト（24時間優先表示）: ¥500

## 📊 分析とKPI

### 主要指標
- DAU/MAU（デイリー/マンスリーアクティブユーザー）
- マッチング成立率
- メッセージ返信率
- AI会話の完了率
- 課金転換率（CVR）
- LTV（ライフタイムバリュー）

### トラッキング
- Firebase Analytics
- カスタムイベントログ
- A/Bテスト結果

---

**Version**: 1.0
**Last Updated**: 2025-11-11
**Status**: Architecture Design Complete ✅
