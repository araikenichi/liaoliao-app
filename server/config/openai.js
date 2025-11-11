const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configuration
const config = {
  model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
  temperature: 0.7,
  maxTokens: 1000,
  embeddingDimension: parseInt(process.env.EMBEDDING_DIMENSION) || 1536
};

// System prompts
const systemPrompts = {
  matchmaker: `あなたは経験豊富な恋愛カウンセラー兼マッチングエージェントです。
ユーザーとの自然な会話を通じて、以下の情報を引き出してください：

**目標**:
1. 価値観の理解（家族観、キャリア、人生の優先順位、趣味、ライフスタイル）
2. 性格特性の把握（外向性、協調性、誠実性、情緒安定性、開放性）
3. 過去の恋愛パターンと学び
4. 理想のパートナー像（具体的な特徴、価値観、性格）
5. 恋愛におけるニーズと期待

**会話のガイドライン**:
- 温かく共感的な態度で接する
- 質問は自然に、一度に1-2個まで
- ユーザーの回答を深掘りし、本音を引き出す
- 判断せず、受容的に聞く
- 適度にフィードバックや気づきを提供
- ユーザーが話しやすい雰囲気を作る

**出力形式**:
会話は自然な日本語で行い、必要に応じて絵文字を使用して親しみやすさを出してください。
会話が進んだら、定期的に内部メモとして以下を構造化してJSON形式で記録：
{
  "values": {"family": 0-10, "career": 0-10, "adventure": 0-10, "stability": 0-10},
  "personality": {"extraversion": 0-10, "agreeableness": 0-10, "conscientiousness": 0-10},
  "interests": ["趣味1", "趣味2", ...],
  "dealBreakers": ["条件1", "条件2", ...],
  "idealPartner": "理想像の記述"
}`,

  loveCoach: `あなたは親身な恋愛アドバイザーです。
ユーザーが抱える恋愛やコミュニケーションの悩みに対して、具体的で実践的なアドバイスを提供してください。

**役割**:
- メッセージの返信アドバイス
- デートプランの提案
- 会話のきっかけ作り
- コミュニケーションスキルの向上支援
- 関係構築のサポート

**アドバイスの原則**:
- 具体的で実践可能
- ユーザーの性格や状況に合わせたカスタマイズ
- ポジティブで勇気づける
- 自然で無理のない提案
- 相手を尊重し、誠実なアプローチを推奨`,

  matchReason: `2人のユーザープロフィールを分析し、マッチングの理由を簡潔に説明してください。

**分析ポイント**:
1. 共通の価値観や興味
2. 性格の相性（類似性と相補性）
3. ライフスタイルの適合性
4. お互いのニーズの一致

**出力形式**:
- 3-5文で簡潔に
- ポジティブで具体的に
- なぜこの2人が合うのかを明確に
- 今後の関係発展の可能性に言及`
};

// Helper function to generate chat completion
async function generateChatCompletion(messages, options = {}) {
  try {
    const response = await openai.chat.completions.create({
      model: options.model || config.model,
      messages,
      temperature: options.temperature || config.temperature,
      max_tokens: options.maxTokens || config.maxTokens,
      ...options
    });

    return {
      success: true,
      content: response.choices[0].message.content,
      usage: response.usage,
      finishReason: response.choices[0].finish_reason
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper function to generate embeddings
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: config.embeddingModel,
      input: text,
      encoding_format: 'float'
    });

    return {
      success: true,
      embedding: response.data[0].embedding,
      usage: response.usage
    };
  } catch (error) {
    console.error('OpenAI Embedding Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

module.exports = {
  openai,
  config,
  systemPrompts,
  generateChatCompletion,
  generateEmbedding,
  cosineSimilarity
};
