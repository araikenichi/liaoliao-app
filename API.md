# LiaoLiao API ドキュメント

## 📚 目次

1. [認証 (Authentication)](#認証-authentication)
2. [ユーザー管理 (Users)](#ユーザー管理-users)
3. [AI機能 (AI Services)](#ai機能-ai-services)
4. [マッチング (Matching)](#マッチング-matching)
5. [エラーコード](#エラーコード)

---

## ベースURL

```
Development: http://localhost:3000/api
Production: https://your-app.firebaseapp.com/api
```

## 認証

すべてのAPIエンドポイント（認証エンドポイントを除く）には、Authorizationヘッダーが必要です。

```http
Authorization: Bearer <Firebase-ID-Token>
```

---

## 認証 (Authentication)

### POST /api/auth/register

新しいユーザーを登録します。

**リクエスト**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "displayName": "太郎",
  "age": 28,
  "gender": "male",
  "bio": "旅行が好きで、週末はよくハイキングに行きます。",
  "interests": ["旅行", "読書", "料理", "写真"],
  "location": {
    "latitude": 35.6762,
    "longitude": 139.6503
  }
}
```

**レスポンス (201 Created)**

```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "abc123xyz"
}
```

**エラー (400 Bad Request)**

```json
{
  "success": false,
  "error": "Email already in use",
  "code": "EMAIL_EXISTS"
}
```

---

### POST /api/auth/verify-token

Firebase認証トークンを検証します。

**リクエスト**

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**レスポンス (200 OK)**

```json
{
  "success": true,
  "user": {
    "uid": "abc123xyz",
    "email": "user@example.com"
  }
}
```

---

### DELETE /api/auth/delete-account

ユーザーアカウントを削除します。

**リクエスト**

```json
{
  "userId": "abc123xyz",
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**レスポンス (200 OK)**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## ユーザー管理 (Users)

### GET /api/users/me

現在のユーザーのプロフィールを取得します。

**ヘッダー**

```
Authorization: Bearer <token>
```

**レスポンス (200 OK)**

```json
{
  "success": true,
  "user": {
    "uid": "abc123xyz",
    "email": "user@example.com",
    "displayName": "太郎",
    "age": 28,
    "gender": "male",
    "bio": "旅行が好きで、週末はよくハイキングに行きます。",
    "interests": ["旅行", "読書", "料理", "写真"],
    "location": {
      "_latitude": 35.6762,
      "_longitude": 139.6503
    },
    "photos": [],
    "aiProfile": {
      "values": {
        "family": 7,
        "career": 8,
        "adventure": 9,
        "stability": 6
      },
      "personality": {
        "extraversion": 7,
        "agreeableness": 8,
        "conscientiousness": 7,
        "emotionalStability": 8,
        "openness": 9
      },
      "completeness": 85
    },
    "createdAt": "2025-11-11T00:00:00.000Z",
    "lastActive": "2025-11-11T10:30:00.000Z"
  }
}
```

---

### PUT /api/users/me

現在のユーザーのプロフィールを更新します。

**リクエスト**

```json
{
  "displayName": "太郎",
  "age": 29,
  "gender": "male",
  "bio": "更新された自己紹介文",
  "interests": ["旅行", "読書", "料理", "写真", "音楽"]
}
```

**レスポンス (200 OK)**

```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

### GET /api/users/:userId

他のユーザーの公開プロフィールを取得します。

**レスポンス (200 OK)**

```json
{
  "success": true,
  "user": {
    "userId": "xyz789abc",
    "displayName": "花子",
    "age": 26,
    "gender": "female",
    "bio": "カフェ巡りが趣味です。",
    "interests": ["カフェ", "映画", "旅行"],
    "photos": ["https://storage.googleapis.com/..."]
  }
}
```

---

### POST /api/users/update-location

ユーザーの位置情報を更新します。

**リクエスト**

```json
{
  "latitude": 35.6762,
  "longitude": 139.6503
}
```

**レスポンス (200 OK)**

```json
{
  "success": true,
  "message": "Location updated successfully"
}
```

---

## AI機能 (AI Services)

### POST /api/ai/matchmaker/start

AI仲人との新しい会話を開始します。

**レスポンス (200 OK)**

```json
{
  "success": true,
  "conversationId": "matchmaker_abc123_1699000000000",
  "message": "こんにちは！私はあなたの恋愛パートナー探しをお手伝いするAIアシスタントです。まずは、あなたのことを少し教えてください。普段はどんなことをして過ごすのが好きですか？"
}
```

---

### POST /api/ai/matchmaker/continue

AI仲人との会話を続けます。

**リクエスト**

```json
{
  "conversationId": "matchmaker_abc123_1699000000000",
  "message": "週末は友達とカフェに行ったり、美術館に行くのが好きです。"
}
```

**レスポンス (200 OK)**

```json
{
  "success": true,
  "message": "素敵ですね！芸術や文化に興味があるんですね。美術館ではどんな作品が特に好きですか？また、理想のデートはどんな雰囲気がいいですか？",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 80,
    "total_tokens": 230
  }
}
```

---

### POST /api/ai/matchmaker/generate-embedding

ユーザープロフィールからEmbeddingを生成します。

**レスポンス (200 OK)**

```json
{
  "success": true,
  "message": "Embedding generated successfully"
}
```

---

### POST /api/ai/coach/message-advice

メッセージ返信のアドバイスを取得します。

**リクエスト**

```json
{
  "receivedMessage": "今度の週末、時間があったら一緒にカフェに行きませんか？",
  "conversationHistory": []
}
```

**レスポンス (200 OK)**

```json
{
  "success": true,
  "advice": "相手からのデートのお誘いですね！以下のような返信が自然で好印象です：\n\n1. 「いいですね！私もカフェ巡りが好きなんです。どこか行きたいお店はありますか？」\n2. 「ありがとうございます！週末なら土曜日の午後が空いてます。おすすめのカフェがあれば教えてください。」\n3. 「嬉しいです！カフェいいですね。最近気になっているお店があるんですが、一緒に行ってみませんか？」",
  "usage": {
    "prompt_tokens": 120,
    "completion_tokens": 150,
    "total_tokens": 270
  }
}
```

---

### POST /api/ai/coach/date-plan

デートプランを提案します。

**リクエスト**

```json
{
  "matchedUserId": "xyz789abc"
}
```

**レスポンス (200 OK)**

```json
{
  "success": true,
  "datePlans": "お二人の共通の趣味に基づいて、以下のデートプランを提案します：\n\n1. **美術館デート**：国立新美術館で展覧会を鑑賞後、近くのカフェでゆっくり感想を語り合う\n2. **カフェ巡りデート**：表参道のおしゃれなカフェを2-3軒巡って、それぞれの違いを楽しむ\n3. **フォトウォーク**：浅草や谷中などの下町を散策しながら、写真を撮り合う",
  "usage": {
    "prompt_tokens": 180,
    "completion_tokens": 200,
    "total_tokens": 380
  }
}
```

---

### POST /api/ai/coach/conversation-starters

会話のきっかけとなるメッセージを生成します。

**リクエスト**

```json
{
  "matchedUserId": "xyz789abc"
}
```

**レスポンス (200 OK)**

```json
{
  "success": true,
  "starters": "お二人の共通点から、以下のような自然な会話のきっかけをおすすめします：\n\n1. 「プロフィール拝見しました！カフェ巡りがお好きなんですね。最近行ったお店でおすすめはありますか？」\n2. 「映画がお好きとのことですが、最近観た中で印象に残っている作品はありますか？」\n3. 「旅行が趣味なんですね！国内外でこれまで行った中で一番良かった場所はどこですか？」\n4. 「写真を見て素敵だなと思いました。どんなことをしている時が一番楽しいですか？」\n5. 「お互い○○が好きみたいですね！私も最近ハマっているんですが、おすすめがあれば教えてください」",
  "usage": {
    "prompt_tokens": 200,
    "completion_tokens": 250,
    "total_tokens": 450
  }
}
```

---

## マッチング (Matching)

### GET /api/matching/find

最適なマッチを検索します。

**クエリパラメータ**

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| limit | number | 10 | 取得する件数 |
| minScore | number | 50 | 最小マッチスコア (0-100) |
| maxDistance | number | 100 | 最大距離 (km) |
| minAge | number | - | 最小年齢 |
| maxAge | number | - | 最大年齢 |
| genderPreference | string | - | 性別 (male/female/other) |

**例**

```
GET /api/matching/find?limit=5&minScore=70&maxDistance=50
```

**レスポンス (200 OK)**

```json
{
  "success": true,
  "matches": [
    {
      "userId": "xyz789abc",
      "userData": {
        "displayName": "花子",
        "age": 26,
        "gender": "female",
        "bio": "カフェ巡りが趣味です。",
        "photos": "https://storage.googleapis.com/...",
        "interests": ["カフェ", "映画", "旅行"]
      },
      "matchScore": 87,
      "scoreBreakdown": {
        "embeddingSimilarity": 85,
        "valuesMatch": 90,
        "complementarity": 88,
        "locationScore": 85
      }
    }
  ],
  "total": 1
}
```

---

### POST /api/matching/calculate-score

2人のユーザー間のマッチスコアを計算します。

**リクエスト**

```json
{
  "targetUserId": "xyz789abc"
}
```

**レスポンス (200 OK)**

```json
{
  "success": true,
  "score": 87,
  "breakdown": {
    "embeddingSimilarity": 85,
    "valuesMatch": 90,
    "complementarity": 88,
    "locationScore": 85
  }
}
```

---

### POST /api/matching/create

マッチを作成します。

**リクエスト**

```json
{
  "targetUserId": "xyz789abc"
}
```

**レスポンス (200 OK)**

```json
{
  "success": true,
  "matchId": "abc123_xyz789_1699000000000",
  "score": 87,
  "reason": "お二人は芸術や文化への興味、カフェ巡りという共通の趣味があり、価値観も非常に近いです。性格的にも互いを尊重し合える相性の良さが感じられます。週末のデートでは、美術館やおしゃれなカフェを一緒に巡ることで、素敵な時間を過ごせるでしょう。"
}
```

---

### POST /api/matching/respond

マッチに応答します（承認/辞退）。

**リクエスト**

```json
{
  "matchId": "abc123_xyz789_1699000000000",
  "action": "accept"
}
```

**アクション**
- `accept`: マッチを承認
- `decline`: マッチを辞退
- `skip`: 後で決める

**レスポンス (200 OK)**

```json
{
  "success": true,
  "matchId": "abc123_xyz789_1699000000000",
  "status": "matched"
}
```

---

### GET /api/matching/my-matches

自分のマッチ一覧を取得します。

**クエリパラメータ**

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| status | string | all | フィルター (all/pending/matched/declined) |

**レスポンス (200 OK)**

```json
{
  "success": true,
  "matches": [
    {
      "matchId": "abc123_xyz789_1699000000000",
      "userA": "abc123",
      "userB": "xyz789",
      "score": 87,
      "reason": "お二人は芸術や文化への興味...",
      "status": "matched",
      "createdAt": "2025-11-11T00:00:00.000Z",
      "otherUser": {
        "userId": "xyz789",
        "displayName": "花子",
        "age": 26,
        "photos": "https://storage.googleapis.com/..."
      }
    }
  ],
  "total": 1
}
```

---

## エラーコード

### 一般的なエラー

| ステータスコード | エラーコード | 説明 |
|----------------|-------------|------|
| 400 | VALIDATION_ERROR | リクエストデータが無効 |
| 401 | UNAUTHORIZED | 認証が必要 |
| 401 | INVALID_TOKEN | 無効なトークン |
| 401 | TOKEN_EXPIRED | トークンの期限切れ |
| 403 | FORBIDDEN | アクセス権限なし |
| 403 | INCOMPLETE_PROFILE | プロフィールが未完成 |
| 403 | AGE_VERIFICATION_FAILED | 年齢確認失敗 |
| 403 | PREMIUM_REQUIRED | プレミアム会員限定 |
| 404 | NOT_FOUND | リソースが見つからない |
| 429 | RATE_LIMIT_EXCEEDED | レート制限超過 |
| 429 | AI_RATE_LIMIT_EXCEEDED | AI APIレート制限超過 |
| 500 | INTERNAL_ERROR | サーバーエラー |

### 認証エラー

| エラーコード | 説明 |
|-------------|------|
| EMAIL_EXISTS | メールアドレスが既に使用されている |
| WEAK_PASSWORD | パスワードが弱すぎる |
| INVALID_EMAIL | 無効なメールアドレス |

### プロフィールエラー

| エラーコード | 説明 |
|-------------|------|
| PROFILE_NOT_FOUND | プロフィールが見つからない |
| INCOMPLETE_PROFILE | 必須項目が未入力 |

---

## レート制限

### 一般API

- **制限**: 100リクエスト / 15分
- **ヘッダー**:
  - `X-RateLimit-Limit`: 制限数
  - `X-RateLimit-Remaining`: 残り回数
  - `X-RateLimit-Reset`: リセット時刻

### AI API

- **無料ユーザー**: 30リクエスト / 15分
- **プレミアムユーザー**: 制限なし

### 認証API

- **制限**: 5リクエスト / 1時間（失敗時のみカウント）

---

## Webhooks (将来実装予定)

### マッチング成立通知

```json
{
  "event": "match.created",
  "timestamp": "2025-11-11T10:30:00.000Z",
  "data": {
    "matchId": "abc123_xyz789_1699000000000",
    "users": ["abc123", "xyz789"],
    "score": 87
  }
}
```

---

## SDK (将来実装予定)

### JavaScript SDK

```javascript
import { LiaoLiaoClient } from '@liaoliao/sdk';

const client = new LiaoLiaoClient({
  apiKey: 'your-api-key'
});

// AI会話開始
const conversation = await client.ai.startMatchmaker();

// マッチング検索
const matches = await client.matching.find({
  minScore: 70,
  limit: 10
});
```

---

**バージョン**: 1.0.0
**最終更新**: 2025-11-11
