# LiaoLiao (聊聊) - AI媒人マッチングアプリ

<div align="center">

![LiaoLiao Logo](https://img.shields.io/badge/LiaoLiao-AI%20Matchmaker-FF6B9D?style=for-the-badge&logo=heart&logoColor=white)

**AIが仲人となり、会話を通じて最適なパートナーを見つける次世代マッチングアプリ**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/firebase-10.7.1-orange.svg)](https://firebase.google.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991.svg)](https://openai.com/)

</div>

---

## 🌟 プロジェクト概要

LiaoLiao（聊聊 = "話そう"）は、従来のスワイプ型マッチングアプリとは異なり、**AIが仲人として対話を通じて** ユーザーの価値観、性格、理想のパートナー像を深く理解し、最適な相手を推薦する革新的なマッチングアプリです。

### 🎯 主な特徴

1. **🤖 AI仲人との対話**
   - GPT-4を活用した自然な会話
   - ユーザーの価値観・性格を深掘り
   - 過去の恋愛経験から学習

2. **🧠 高度なマッチングアルゴリズム**
   - OpenAI Embeddingsによるセマンティック分析
   - Cosine類似度ベースの相性計算
   - 価値観・性格・地理的要素を総合評価

3. **💬 AI恋愛コーチ**
   - メッセージ返信のアドバイス
   - デートプランの提案
   - 会話のきっかけ提供

4. **🔒 プライバシー重視**
   - 匿名での初期会話
   - 相互同意後のみ連絡先開放
   - GDPR・個人情報保護法準拠

---

## 🚀 クイックスタート

### 前提条件

- Node.js 18.0.0 以上
- npm 9.0.0 以上
- Firebaseアカウント
- OpenAI APIキー

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/liaoliao-app.git
cd liaoliao-app

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してAPIキーを設定

# 開発サーバーの起動
npm run dev
```

詳細なセットアップ手順は [SETUP.md](./SETUP.md) を参照してください。

---

## 📁 プロジェクト構造

```
liaoliao-app/
├── server/                  # バックエンド (Node.js + Express)
│   ├── config/              # Firebase & OpenAI 設定
│   ├── middleware/          # 認証・バリデーション
│   ├── routes/              # API エンドポイント
│   ├── services/            # ビジネスロジック (AI, マッチング)
│   └── index.js             # メインサーバー
├── public/                  # フロントエンド
│   ├── css/                 # スタイルシート
│   ├── js/                  # クライアントサイドロジック
│   └── index.html           # メインHTML
├── firebase.json            # Firebase 設定
├── firestore.rules          # Firestore セキュリティルール
├── ARCHITECTURE.md          # アーキテクチャドキュメント
├── SETUP.md                 # 詳細セットアップガイド
└── README.md                # このファイル
```

---

## 🛠️ 技術スタック

### バックエンド
- **Node.js** 18+ & Express.js
- **Firebase**: Firestore, Authentication, Storage
- **OpenAI API**: GPT-4, Embeddings

### フロントエンド
- **HTML5 / CSS3 / Vanilla JavaScript**
- **Firebase SDK**: クライアント認証

### AI・ML
- **OpenAI GPT-4**: AI仲人・恋愛コーチ
- **Text Embeddings**: プロフィール分析
- **Cosine Similarity**: マッチングスコア計算

---

## 📊 主要機能

### 1. AI仲人との対話
```javascript
// AI会話の開始
await api.ai.startMatchmakerConversation();

// 会話の継続
await api.ai.continueMatchmakerConversation(conversationId, userMessage);
```

### 2. マッチング検索
```javascript
// 最適なマッチを検索
const matches = await api.matching.findMatches({
    limit: 10,
    minScore: 50,
    maxDistance: 100
});
```

### 3. AI恋愛コーチ
```javascript
// メッセージ返信のアドバイス
await api.ai.getMessageAdvice(receivedMessage);

// デートプラン提案
await api.ai.generateDatePlan(matchedUserId);
```

---

## 🔐 セキュリティ

- **Firebase Authentication**: ユーザー認証
- **Firestore Security Rules**: データアクセス制御
- **Rate Limiting**: API保護
- **入力サニタイゼーション**: XSS/インジェクション防御
- **HTTPS強制**: 暗号化通信

---

## 📈 ロードマップ

### フェーズ1: MVP ✅
- [x] AI仲人との基本会話
- [x] プロフィール作成・管理
- [x] マッチングアルゴリズム
- [x] 基本的なUI/UX

### フェーズ2: 機能拡張
- [ ] リアルタイムチャット
- [ ] プッシュ通知
- [ ] 写真アップロード
- [ ] AI機能の高度化

### フェーズ3: スケール
- [ ] ビデオ通話
- [ ] グループデート
- [ ] コミュニティ機能
- [ ] 多言語対応

---

## 💰 収益モデル

### フリーミアム
- **無料**: 月3回のAI推薦、基本チャット
- **プレミアム** (¥980/月):
  - 無制限のAI推薦
  - AI恋愛コーチング
  - 優先表示

### 追加課金
- スーパーライク: ¥200/回
- ブースト: ¥500/24時間

---

## 🤝 コントリビューション

プルリクエストを歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

---

## 📝 ドキュメント

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: システムアーキテクチャの詳細
- **[SETUP.md](./SETUP.md)**: 詳細なセットアップガイド

---

## 📞 サポート

問題や質問がある場合は、[GitHub Issues](https://github.com/yourusername/liaoliao-app/issues) で報告してください。

---

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。

---

<div align="center">

**LiaoLiao で、AIがあなたの運命の人を見つけます 💝**

Made with ❤️ by the LiaoLiao Team

</div> 