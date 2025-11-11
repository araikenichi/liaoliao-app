const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebase');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateUserProfile, sanitizeInput } = require('../middleware/validation');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', authLimiter, sanitizeInput, validateUserProfile, async (req, res) => {
  try {
    const { email, password, displayName, age, gender, bio, interests, location } = req.body;

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName
    });

    // Create Firestore user profile
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      age,
      gender,
      bio,
      interests,
      location: location || null,
      photos: [],
      aiProfile: {
        values: {},
        personality: {},
        interests: [],
        dealBreakers: [],
        idealPartner: '',
        completeness: 0
      },
      subscription: {
        tier: 'free',
        status: 'active'
      },
      createdAt: new Date(),
      lastActive: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: userRecord.uid
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        error: 'Email already in use',
        code: 'EMAIL_EXISTS'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

/**
 * POST /api/auth/verify-token
 * Verify Firebase Auth token
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    const decodedToken = await auth.verifyIdToken(token);

    // Update last active time
    await db.collection('users').doc(decodedToken.uid).update({
      lastActive: new Date()
    });

    res.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

/**
 * DELETE /api/auth/delete-account
 * Delete user account
 */
router.delete('/delete-account', async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        success: false,
        error: 'User ID and token are required'
      });
    }

    // Verify token
    const decodedToken = await auth.verifyIdToken(token);

    if (decodedToken.uid !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Delete Firestore data
    await db.collection('users').doc(userId).delete();

    // Delete AI conversations
    const conversationsSnapshot = await db.collection('ai_conversations')
      .where('userId', '==', userId)
      .get();

    const batch = db.batch();
    conversationsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Delete Firebase Auth user
    await auth.deleteUser(userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    });
  }
});

module.exports = router;
