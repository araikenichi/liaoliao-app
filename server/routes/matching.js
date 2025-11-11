const express = require('express');
const router = express.Router();
const { matchingService } = require('../services/matchingService');
const { authenticate, requireCompleteProfile, requireAgeVerification } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { validateMatchAction, sanitizeInput } = require('../middleware/validation');

/**
 * GET /api/matching/find
 * Find potential matches for the authenticated user
 */
router.get('/find', authenticate, requireCompleteProfile, requireAgeVerification, apiLimiter, async (req, res) => {
  try {
    const {
      limit = 10,
      minScore = 50,
      maxDistance = 100,
      minAge,
      maxAge,
      genderPreference
    } = req.query;

    const options = {
      limit: parseInt(limit),
      minScore: parseInt(minScore),
      maxDistance: parseInt(maxDistance),
      ageRange: {
        min: minAge ? parseInt(minAge) : null,
        max: maxAge ? parseInt(maxAge) : null
      },
      genderPreference
    };

    const result = await matchingService.findMatches(req.user.uid, options);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find matches'
    });
  }
});

/**
 * POST /api/matching/calculate-score
 * Calculate match score between two users
 */
router.post('/calculate-score', authenticate, requireCompleteProfile, apiLimiter, async (req, res) => {
  try {
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        error: 'Target user ID is required'
      });
    }

    const result = await matchingService.calculateMatchScore(req.user.uid, targetUserId);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error calculating match score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate match score'
    });
  }
});

/**
 * POST /api/matching/create
 * Create a match between two users
 */
router.post('/create', authenticate, requireCompleteProfile, requireAgeVerification, apiLimiter, async (req, res) => {
  try {
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        error: 'Target user ID is required'
      });
    }

    const result = await matchingService.createMatch(req.user.uid, targetUserId);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create match'
    });
  }
});

/**
 * POST /api/matching/respond
 * Respond to a match (accept/decline)
 */
router.post('/respond', authenticate, apiLimiter, sanitizeInput, validateMatchAction, async (req, res) => {
  try {
    const { matchId, action } = req.body;

    const result = await matchingService.updateMatchStatus(matchId, req.user.uid, action);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error responding to match:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to respond to match'
    });
  }
});

/**
 * GET /api/matching/my-matches
 * Get all matches for the authenticated user
 */
router.get('/my-matches', authenticate, requireCompleteProfile, apiLimiter, async (req, res) => {
  try {
    const { status = 'all' } = req.query;

    // Query matches where user is either userA or userB
    let queryA = db.collection('matches').where('userA', '==', req.user.uid);
    let queryB = db.collection('matches').where('userB', '==', req.user.uid);

    if (status !== 'all') {
      queryA = queryA.where('status', '==', status);
      queryB = queryB.where('status', '==', status);
    }

    const [snapshotA, snapshotB] = await Promise.all([
      queryA.get(),
      queryB.get()
    ]);

    const matches = [];

    for (const doc of [...snapshotA.docs, ...snapshotB.docs]) {
      const matchData = doc.data();

      // Determine the other user
      const otherUserId = matchData.userA === req.user.uid ? matchData.userB : matchData.userA;

      // Fetch other user's basic info
      const otherUserDoc = await db.collection('users').doc(otherUserId).get();
      const otherUser = otherUserDoc.exists ? otherUserDoc.data() : null;

      matches.push({
        matchId: doc.id,
        ...matchData,
        otherUser: otherUser ? {
          userId: otherUserId,
          displayName: otherUser.displayName,
          age: otherUser.age,
          photos: otherUser.photos?.[0] || null
        } : null
      });
    }

    // Sort by creation date (newest first)
    matches.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    res.json({
      success: true,
      matches,
      total: matches.length
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch matches'
    });
  }
});

module.exports = router;
