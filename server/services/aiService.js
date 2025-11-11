const { generateChatCompletion, generateEmbedding, systemPrompts } = require('../config/openai');
const { db } = require('../config/firebase');

/**
 * AI Matchmaker Service
 * Handles conversational matchmaking with users
 */
class AIMatchmakerService {
  constructor() {
    this.conversationMemory = new Map(); // In-memory cache for active conversations
  }

  /**
   * Start a new conversation with the AI matchmaker
   */
  async startConversation(userId) {
    try {
      // Initialize conversation history
      const conversationId = `matchmaker_${userId}_${Date.now()}`;
      const initialMessages = [
        {
          role: 'system',
          content: systemPrompts.matchmaker
        },
        {
          role: 'assistant',
          content: 'こんにちは！私はあなたの恋愛パートナー探しをお手伝いするAIアシスタントです。まずは、あなたのことを少し教えてください。普段はどんなことをして過ごすのが好きですか？'
        }
      ];

      // Store in Firestore
      await db.collection('ai_conversations').doc(conversationId).set({
        userId,
        type: 'matchmaker',
        messages: initialMessages,
        extractedData: {},
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Cache in memory
      this.conversationMemory.set(conversationId, initialMessages);

      return {
        success: true,
        conversationId,
        message: initialMessages[initialMessages.length - 1].content
      };
    } catch (error) {
      console.error('Error starting conversation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Continue conversation with user input
   */
  async continueConversation(conversationId, userMessage) {
    try {
      // Load conversation history
      let messages = this.conversationMemory.get(conversationId);

      if (!messages) {
        const doc = await db.collection('ai_conversations').doc(conversationId).get();
        if (!doc.exists) {
          throw new Error('Conversation not found');
        }
        messages = doc.data().messages;
        this.conversationMemory.set(conversationId, messages);
      }

      // Add user message
      messages.push({
        role: 'user',
        content: userMessage
      });

      // Generate AI response
      const response = await generateChatCompletion(messages);

      if (!response.success) {
        throw new Error(response.error);
      }

      // Add AI response to history
      messages.push({
        role: 'assistant',
        content: response.content
      });

      // Update in Firestore
      await db.collection('ai_conversations').doc(conversationId).update({
        messages,
        updatedAt: new Date()
      });

      // Update memory cache
      this.conversationMemory.set(conversationId, messages);

      // Try to extract structured data from conversation
      await this.extractUserInsights(conversationId, messages);

      return {
        success: true,
        message: response.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('Error continuing conversation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract structured insights from conversation
   */
  async extractUserInsights(conversationId, messages) {
    try {
      // Build extraction prompt
      const extractionMessages = [
        ...messages,
        {
          role: 'system',
          content: `会話の内容を分析し、以下のJSON形式でユーザーの情報を抽出してください。
まだ情報が不足している項目は null にしてください。

{
  "values": {
    "family": 0-10 (家族の重要度),
    "career": 0-10 (キャリアの重要度),
    "adventure": 0-10 (冒険心),
    "stability": 0-10 (安定志向)
  },
  "personality": {
    "extraversion": 0-10 (外向性),
    "agreeableness": 0-10 (協調性),
    "conscientiousness": 0-10 (誠実性),
    "emotionalStability": 0-10 (情緒安定性),
    "openness": 0-10 (開放性)
  },
  "interests": ["趣味1", "趣味2"],
  "dealBreakers": ["譲れない条件1"],
  "idealPartner": "理想のパートナー像の簡潔な記述",
  "completeness": 0-100 (プロフィール完成度)
}

JSON のみを返してください。`
        }
      ];

      const response = await generateChatCompletion(extractionMessages, {
        temperature: 0.3,
        maxTokens: 500
      });

      if (response.success) {
        try {
          // Parse JSON response
          const extractedData = JSON.parse(response.content);

          // Update in Firestore
          await db.collection('ai_conversations').doc(conversationId).update({
            extractedData,
            extractedAt: new Date()
          });

          // If completeness is high enough, update user profile
          if (extractedData.completeness >= 70) {
            const doc = await db.collection('ai_conversations').doc(conversationId).get();
            const userId = doc.data().userId;

            await db.collection('users').doc(userId).update({
              'aiProfile.values': extractedData.values,
              'aiProfile.personality': extractedData.personality,
              'aiProfile.interests': extractedData.interests,
              'aiProfile.dealBreakers': extractedData.dealBreakers,
              'aiProfile.idealPartner': extractedData.idealPartner,
              'aiProfile.completeness': extractedData.completeness,
              'aiProfile.updatedAt': new Date()
            });
          }

          return { success: true, data: extractedData };
        } catch (parseError) {
          console.error('Error parsing extracted data:', parseError);
          return { success: false, error: 'Failed to parse extraction' };
        }
      }

      return { success: false, error: response.error };
    } catch (error) {
      console.error('Error extracting insights:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate profile embedding from user data
   */
  async generateProfileEmbedding(userId) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();

      // Create comprehensive text representation
      const profileText = `
性別: ${userData.gender}
年齢: ${userData.age}
自己紹介: ${userData.bio}
趣味・興味: ${userData.interests?.join(', ')}
価値観: 家族${userData.aiProfile?.values?.family || 5}/10, キャリア${userData.aiProfile?.values?.career || 5}/10, 冒険${userData.aiProfile?.values?.adventure || 5}/10, 安定${userData.aiProfile?.values?.stability || 5}/10
性格: 外向性${userData.aiProfile?.personality?.extraversion || 5}/10, 協調性${userData.aiProfile?.personality?.agreeableness || 5}/10
理想のパートナー: ${userData.aiProfile?.idealPartner || '未設定'}
      `.trim();

      // Generate embedding
      const result = await generateEmbedding(profileText);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Store embedding in user profile
      await db.collection('users').doc(userId).update({
        embedding: result.embedding,
        embeddingGeneratedAt: new Date()
      });

      return {
        success: true,
        embedding: result.embedding,
        usage: result.usage
      };
    } catch (error) {
      console.error('Error generating embedding:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * AI Love Coach Service
 * Provides dating advice and conversation suggestions
 */
class AILoveCoachService {
  /**
   * Get message reply suggestion
   */
  async getMessageAdvice(userId, context) {
    try {
      const { receivedMessage, conversationHistory } = context;

      const messages = [
        {
          role: 'system',
          content: systemPrompts.loveCoach
        },
        {
          role: 'user',
          content: `相手から「${receivedMessage}」というメッセージが来ました。どのように返信すれば良いでしょうか？自然で好印象な返信例を3つ教えてください。`
        }
      ];

      const response = await generateChatCompletion(messages);

      return {
        success: response.success,
        advice: response.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('Error getting message advice:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate date plan suggestions
   */
  async generateDatePlan(userAId, userBId) {
    try {
      const [userADoc, userBDoc] = await Promise.all([
        db.collection('users').doc(userAId).get(),
        db.collection('users').doc(userBId).get()
      ]);

      const userA = userADoc.data();
      const userB = userBDoc.data();

      const messages = [
        {
          role: 'system',
          content: systemPrompts.loveCoach
        },
        {
          role: 'user',
          content: `2人のユーザーの共通の趣味や興味に基づいて、デートプランを3つ提案してください。

ユーザーA: ${userA.interests?.join(', ')}
ユーザーB: ${userB.interests?.join(', ')}

それぞれのデートプランは具体的で実行可能なものにしてください。`
        }
      ];

      const response = await generateChatCompletion(messages);

      return {
        success: response.success,
        datePlans: response.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('Error generating date plan:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate conversation starters
   */
  async generateConversationStarters(userAId, userBId) {
    try {
      const [userADoc, userBDoc] = await Promise.all([
        db.collection('users').doc(userAId).get(),
        db.collection('users').doc(userBId).get()
      ]);

      const userA = userADoc.data();
      const userB = userBDoc.data();

      const messages = [
        {
          role: 'system',
          content: systemPrompts.loveCoach
        },
        {
          role: 'user',
          content: `2人のユーザーの共通点に基づいて、会話のきっかけとなるメッセージを5つ提案してください。

ユーザーA: ${userA.interests?.join(', ')}, ${userA.bio}
ユーザーB: ${userB.interests?.join(', ')}, ${userB.bio}

自然で好印象なメッセージにしてください。`
        }
      ];

      const response = await generateChatCompletion(messages);

      return {
        success: response.success,
        starters: response.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('Error generating conversation starters:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export service instances
const matchmakerService = new AIMatchmakerService();
const loveCoachService = new AILoveCoachService();

module.exports = {
  matchmakerService,
  loveCoachService,
  AIMatchmakerService,
  AILoveCoachService
};
