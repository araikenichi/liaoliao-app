const { db } = require('../config/firebase');
const { cosineSimilarity, generateChatCompletion, systemPrompts } = require('../config/openai');

/**
 * Matching Service
 * Implements the core matching algorithm using embeddings and compatibility scoring
 */
class MatchingService {
  /**
   * Calculate match score between two users
   */
  async calculateMatchScore(userAId, userBId) {
    try {
      const [userADoc, userBDoc] = await Promise.all([
        db.collection('users').doc(userAId).get(),
        db.collection('users').doc(userBId).get()
      ]);

      if (!userADoc.exists || !userBDoc.exists) {
        throw new Error('One or both users not found');
      }

      const userA = userADoc.data();
      const userB = userBDoc.data();

      // 1. Vector Similarity (40%)
      let embeddingSimilarity = 0;
      if (userA.embedding && userB.embedding) {
        embeddingSimilarity = cosineSimilarity(userA.embedding, userB.embedding);
      }

      // 2. Values Alignment (30%)
      const valuesMatch = this.calculateValuesAlignment(
        userA.aiProfile?.values,
        userB.aiProfile?.values
      );

      // 3. Personality Complementarity (20%)
      const complementarity = this.calculateComplementarity(
        userA.aiProfile?.personality,
        userB.aiProfile?.personality
      );

      // 4. Geographic Proximity (10%)
      const locationScore = this.calculateLocationScore(
        userA.location,
        userB.location
      );

      // Calculate weighted final score
      const finalScore = (
        0.4 * embeddingSimilarity +
        0.3 * valuesMatch +
        0.2 * complementarity +
        0.1 * locationScore
      );

      // Normalize to 0-100 scale
      const normalizedScore = Math.round(finalScore * 100);

      return {
        success: true,
        score: normalizedScore,
        breakdown: {
          embeddingSimilarity: Math.round(embeddingSimilarity * 100),
          valuesMatch: Math.round(valuesMatch * 100),
          complementarity: Math.round(complementarity * 100),
          locationScore: Math.round(locationScore * 100)
        }
      };
    } catch (error) {
      console.error('Error calculating match score:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate values alignment between two users
   */
  calculateValuesAlignment(valuesA, valuesB) {
    if (!valuesA || !valuesB) return 0.5; // Default neutral score

    const valueKeys = ['family', 'career', 'adventure', 'stability'];
    let totalDifference = 0;
    let count = 0;

    for (const key of valueKeys) {
      if (valuesA[key] !== undefined && valuesB[key] !== undefined) {
        // Calculate normalized difference (0 = identical, 1 = opposite)
        const difference = Math.abs(valuesA[key] - valuesB[key]) / 10;
        totalDifference += difference;
        count++;
      }
    }

    if (count === 0) return 0.5;

    // Convert average difference to similarity score
    const avgDifference = totalDifference / count;
    return 1 - avgDifference;
  }

  /**
   * Calculate personality complementarity
   * Some traits benefit from similarity, others from complementarity
   */
  calculateComplementarity(personalityA, personalityB) {
    if (!personalityA || !personalityB) return 0.5;

    // Traits where similarity is good
    const similarityTraits = ['agreeableness', 'openness'];
    // Traits where moderate difference can be complementary
    const complementaryTraits = ['extraversion', 'conscientiousness', 'emotionalStability'];

    let score = 0;
    let count = 0;

    // Score similarity traits
    for (const trait of similarityTraits) {
      if (personalityA[trait] !== undefined && personalityB[trait] !== undefined) {
        const similarity = 1 - Math.abs(personalityA[trait] - personalityB[trait]) / 10;
        score += similarity;
        count++;
      }
    }

    // Score complementary traits (sweet spot is around 2-4 points difference)
    for (const trait of complementaryTraits) {
      if (personalityA[trait] !== undefined && personalityB[trait] !== undefined) {
        const difference = Math.abs(personalityA[trait] - personalityB[trait]);
        // Ideal difference is 2-4, too similar or too different is worse
        let traitScore;
        if (difference >= 2 && difference <= 4) {
          traitScore = 1.0; // Optimal complementarity
        } else if (difference < 2) {
          traitScore = 0.7 + (difference / 2) * 0.3; // Too similar
        } else {
          traitScore = Math.max(0, 1 - (difference - 4) / 6); // Too different
        }
        score += traitScore;
        count++;
      }
    }

    return count > 0 ? score / count : 0.5;
  }

  /**
   * Calculate location score based on distance
   */
  calculateLocationScore(locationA, locationB) {
    if (!locationA || !locationB) return 0.5; // Neutral if location not available

    // Calculate distance using Haversine formula
    const distance = this.calculateDistance(
      locationA.latitude || locationA._latitude,
      locationA.longitude || locationA._longitude,
      locationB.latitude || locationB._latitude,
      locationB.longitude || locationB._longitude
    );

    // Score based on distance (closer is better, but not critical)
    if (distance < 10) return 1.0;      // Within 10km
    if (distance < 30) return 0.8;      // Within 30km
    if (distance < 50) return 0.6;      // Within 50km
    if (distance < 100) return 0.4;     // Within 100km
    return 0.2;                          // Beyond 100km
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  /**
   * Find potential matches for a user
   */
  async findMatches(userId, options = {}) {
    try {
      const {
        limit = 10,
        minScore = 50,
        maxDistance = 100, // km
        ageRange = { min: null, max: null },
        genderPreference = null
      } = options;

      // Get the requesting user
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const user = userDoc.data();

      // Build query for potential matches
      let query = db.collection('users')
        .where('uid', '!=', userId);

      // Filter by gender preference if specified
      if (genderPreference && genderPreference !== 'all') {
        query = query.where('gender', '==', genderPreference);
      }

      // Execute query
      const snapshot = await query.limit(100).get(); // Get a larger pool to filter

      const potentialMatches = [];

      for (const doc of snapshot.docs) {
        const candidate = doc.data();

        // Apply age filters
        if (ageRange.min && candidate.age < ageRange.min) continue;
        if (ageRange.max && candidate.age > ageRange.max) continue;

        // Apply distance filter
        if (maxDistance && user.location && candidate.location) {
          const distance = this.calculateDistance(
            user.location._latitude || user.location.latitude,
            user.location._longitude || user.location.longitude,
            candidate.location._latitude || candidate.location.latitude,
            candidate.location._longitude || candidate.location.longitude
          );
          if (distance > maxDistance) continue;
        }

        // Calculate match score
        const scoreResult = await this.calculateMatchScore(userId, doc.id);

        if (scoreResult.success && scoreResult.score >= minScore) {
          potentialMatches.push({
            userId: doc.id,
            userData: {
              displayName: candidate.displayName,
              age: candidate.age,
              gender: candidate.gender,
              bio: candidate.bio,
              photos: candidate.photos?.[0] || null,
              interests: candidate.interests
            },
            matchScore: scoreResult.score,
            scoreBreakdown: scoreResult.breakdown
          });
        }
      }

      // Sort by match score
      potentialMatches.sort((a, b) => b.matchScore - a.matchScore);

      // Limit results
      const topMatches = potentialMatches.slice(0, limit);

      return {
        success: true,
        matches: topMatches,
        total: topMatches.length
      };
    } catch (error) {
      console.error('Error finding matches:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate AI explanation for why two users match
   */
  async generateMatchReason(userAId, userBId, matchScore) {
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
          content: systemPrompts.matchReason
        },
        {
          role: 'user',
          content: `以下の2人のマッチング理由を説明してください（マッチスコア: ${matchScore}%）

ユーザーA:
- 年齢: ${userA.age}
- 興味: ${userA.interests?.join(', ')}
- 自己紹介: ${userA.bio}
- 価値観: 家族${userA.aiProfile?.values?.family}/10, キャリア${userA.aiProfile?.values?.career}/10

ユーザーB:
- 年齢: ${userB.age}
- 興味: ${userB.interests?.join(', ')}
- 自己紹介: ${userB.bio}
- 価値観: 家族${userB.aiProfile?.values?.family}/10, キャリア${userB.aiProfile?.values?.career}/10

3-5文で、ポジティブで具体的な説明をしてください。`
        }
      ];

      const response = await generateChatCompletion(messages, {
        temperature: 0.7,
        maxTokens: 200
      });

      return {
        success: response.success,
        reason: response.content
      };
    } catch (error) {
      console.error('Error generating match reason:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a match entry in the database
   */
  async createMatch(userAId, userBId) {
    try {
      // Calculate match score
      const scoreResult = await this.calculateMatchScore(userAId, userBId);

      if (!scoreResult.success) {
        throw new Error('Failed to calculate match score');
      }

      // Generate match reason
      const reasonResult = await this.generateMatchReason(userAId, userBId, scoreResult.score);

      const matchId = `${userAId}_${userBId}_${Date.now()}`;

      // Create match document
      await db.collection('matches').doc(matchId).set({
        matchId,
        userA: userAId,
        userB: userBId,
        score: scoreResult.score,
        scoreBreakdown: scoreResult.breakdown,
        reason: reasonResult.success ? reasonResult.reason : 'あなたたちは素晴らしい相性です！',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        success: true,
        matchId,
        score: scoreResult.score,
        reason: reasonResult.success ? reasonResult.reason : 'あなたたちは素晴らしい相性です！'
      };
    } catch (error) {
      console.error('Error creating match:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update match status (accept/decline)
   */
  async updateMatchStatus(matchId, userId, action) {
    try {
      const matchDoc = await db.collection('matches').doc(matchId).get();

      if (!matchDoc.exists) {
        throw new Error('Match not found');
      }

      const matchData = matchDoc.data();

      // Verify user is part of this match
      if (matchData.userA !== userId && matchData.userB !== userId) {
        throw new Error('Unauthorized');
      }

      // Update status based on action
      const updates = {
        status: action === 'accept' ? 'accepted' : 'declined',
        [`${matchData.userA === userId ? 'userA' : 'userB'}Response`]: action,
        [`${matchData.userA === userId ? 'userA' : 'userB'}ResponseAt`]: new Date(),
        updatedAt: new Date()
      };

      // If both users accepted, create a conversation
      if (action === 'accept') {
        const otherUserResponse = matchData.userA === userId ?
          matchData.userBResponse : matchData.userAResponse;

        if (otherUserResponse === 'accept') {
          // Both accepted - create conversation
          const conversationId = `match_${matchId}`;

          await db.collection('conversations').doc(conversationId).set({
            conversationId,
            participants: [matchData.userA, matchData.userB],
            matchId,
            status: 'active',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date()
          });

          updates.conversationId = conversationId;
          updates.status = 'matched';
        }
      }

      await db.collection('matches').doc(matchId).update(updates);

      return {
        success: true,
        matchId,
        status: updates.status
      };
    } catch (error) {
      console.error('Error updating match status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export service instance
const matchingService = new MatchingService();

module.exports = {
  matchingService,
  MatchingService
};
