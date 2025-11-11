const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { authenticate } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { validateUserProfile, sanitizeInput } = require('../middleware/validation');

/**
 * GET /api/users/me
 * Get current user's profile
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: userDoc.data()
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

/**
 * PUT /api/users/me
 * Update current user's profile
 */
router.put('/me', authenticate, apiLimiter, sanitizeInput, validateUserProfile, async (req, res) => {
  try {
    const { displayName, age, gender, bio, interests, location } = req.body;

    const updates = {
      displayName,
      age,
      gender,
      bio,
      interests,
      updatedAt: new Date()
    };

    if (location) {
      updates.location = location;
    }

    await db.collection('users').doc(req.user.uid).update(updates);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

/**
 * GET /api/users/:userId
 * Get another user's public profile
 */
router.get('/:userId', authenticate, apiLimiter, async (req, res) => {
  try {
    const { userId } = req.params;

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();

    // Return only public information
    const publicProfile = {
      userId: userData.uid,
      displayName: userData.displayName,
      age: userData.age,
      gender: userData.gender,
      bio: userData.bio,
      interests: userData.interests,
      photos: userData.photos
    };

    res.json({
      success: true,
      user: publicProfile
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

/**
 * POST /api/users/update-location
 * Update user's location
 */
router.post('/update-location', authenticate, apiLimiter, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Valid latitude and longitude are required'
      });
    }

    await db.collection('users').doc(req.user.uid).update({
      location: {
        latitude,
        longitude
      },
      locationUpdatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update location'
    });
  }
});

/**
 * POST /api/users/upload-photo
 * Upload profile photo (placeholder - needs Firebase Storage integration)
 */
router.post('/upload-photo', authenticate, apiLimiter, async (req, res) => {
  try {
    const { photoUrl } = req.body;

    if (!photoUrl) {
      return res.status(400).json({
        success: false,
        error: 'Photo URL is required'
      });
    }

    // Get current photos
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const currentPhotos = userDoc.data().photos || [];

    // Add new photo (max 6 photos)
    if (currentPhotos.length >= 6) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 6 photos allowed'
      });
    }

    currentPhotos.push(photoUrl);

    await db.collection('users').doc(req.user.uid).update({
      photos: currentPhotos,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      photos: currentPhotos
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload photo'
    });
  }
});

/**
 * DELETE /api/users/photo/:index
 * Delete a profile photo
 */
router.delete('/photo/:index', authenticate, apiLimiter, async (req, res) => {
  try {
    const photoIndex = parseInt(req.params.index);

    if (isNaN(photoIndex) || photoIndex < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid photo index'
      });
    }

    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const currentPhotos = userDoc.data().photos || [];

    if (photoIndex >= currentPhotos.length) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }

    // Remove photo at index
    currentPhotos.splice(photoIndex, 1);

    await db.collection('users').doc(req.user.uid).update({
      photos: currentPhotos,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      photos: currentPhotos
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete photo'
    });
  }
});

module.exports = router;
