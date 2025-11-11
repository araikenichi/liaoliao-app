const express = require('express');
const router = express.Router();
const { matchmakerService, loveCoachService } = require('../services/aiService');
const { authenticate, requireCompleteProfile } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const { sanitizeInput } = require('../middleware/validation');

/**
 * POST /api/ai/matchmaker/start
 * Start a new conversation with AI matchmaker
 */
router.post('/matchmaker/start', authenticate, aiLimiter, async (req, res) => {
  try {
    const result = await matchmakerService.startConversation(req.user.uid);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error starting matchmaker conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start conversation'
    });
  }
});

/**
 * POST /api/ai/matchmaker/continue
 * Continue conversation with AI matchmaker
 */
router.post('/matchmaker/continue', authenticate, aiLimiter, sanitizeInput, async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID and message are required'
      });
    }

    const result = await matchmakerService.continueConversation(conversationId, message);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error continuing conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to continue conversation'
    });
  }
});

/**
 * POST /api/ai/matchmaker/generate-embedding
 * Generate embedding for user profile
 */
router.post('/matchmaker/generate-embedding', authenticate, requireCompleteProfile, aiLimiter, async (req, res) => {
  try {
    const result = await matchmakerService.generateProfileEmbedding(req.user.uid);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: 'Embedding generated successfully'
    });
  } catch (error) {
    console.error('Error generating embedding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate embedding'
    });
  }
});

/**
 * POST /api/ai/coach/message-advice
 * Get advice on how to reply to a message
 */
router.post('/coach/message-advice', authenticate, requireCompleteProfile, aiLimiter, sanitizeInput, async (req, res) => {
  try {
    const { receivedMessage, conversationHistory } = req.body;

    if (!receivedMessage) {
      return res.status(400).json({
        success: false,
        error: 'Received message is required'
      });
    }

    const result = await loveCoachService.getMessageAdvice(req.user.uid, {
      receivedMessage,
      conversationHistory: conversationHistory || []
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error getting message advice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get advice'
    });
  }
});

/**
 * POST /api/ai/coach/date-plan
 * Generate date plan suggestions
 */
router.post('/coach/date-plan', authenticate, requireCompleteProfile, aiLimiter, async (req, res) => {
  try {
    const { matchedUserId } = req.body;

    if (!matchedUserId) {
      return res.status(400).json({
        success: false,
        error: 'Matched user ID is required'
      });
    }

    const result = await loveCoachService.generateDatePlan(req.user.uid, matchedUserId);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error generating date plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate date plan'
    });
  }
});

/**
 * POST /api/ai/coach/conversation-starters
 * Generate conversation starters
 */
router.post('/coach/conversation-starters', authenticate, requireCompleteProfile, aiLimiter, async (req, res) => {
  try {
    const { matchedUserId } = req.body;

    if (!matchedUserId) {
      return res.status(400).json({
        success: false,
        error: 'Matched user ID is required'
      });
    }

    const result = await loveCoachService.generateConversationStarters(req.user.uid, matchedUserId);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error generating conversation starters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate conversation starters'
    });
  }
});

module.exports = router;
