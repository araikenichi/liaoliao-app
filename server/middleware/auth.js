const { auth } = require('../config/firebase');
const { db } = require('../config/firebase');

/**
 * Middleware to verify Firebase Auth token
 */
async function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: No token provided'
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify the token
    const decodedToken = await auth.verifyIdToken(token);

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };

    // Optionally fetch full user profile from Firestore
    if (req.query.includeProfile === 'true' || req.body.includeProfile === true) {
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();

      if (userDoc.exists) {
        req.user.profile = userDoc.data();
      }
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * Middleware to check if user has completed profile
 */
async function requireCompleteProfile(req, res, next) {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(403).json({
        success: false,
        error: 'Profile not found. Please complete your profile first.',
        code: 'PROFILE_NOT_FOUND'
      });
    }

    const userData = userDoc.data();
    const requiredFields = ['displayName', 'age', 'gender', 'bio', 'interests'];
    const missingFields = requiredFields.filter(field => !userData[field]);

    if (missingFields.length > 0) {
      return res.status(403).json({
        success: false,
        error: 'Incomplete profile. Please complete all required fields.',
        code: 'INCOMPLETE_PROFILE',
        missingFields
      });
    }

    req.user.profile = userData;
    next();
  } catch (error) {
    console.error('Profile check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error checking profile'
    });
  }
}

/**
 * Middleware to check age verification (18+)
 */
function requireAgeVerification(req, res, next) {
  if (!req.user.profile) {
    return res.status(403).json({
      success: false,
      error: 'Profile not loaded',
      code: 'PROFILE_NOT_LOADED'
    });
  }

  if (!req.user.profile.age || req.user.profile.age < 18) {
    return res.status(403).json({
      success: false,
      error: 'Age verification required. Users must be 18 or older.',
      code: 'AGE_VERIFICATION_FAILED'
    });
  }

  next();
}

/**
 * Middleware to check premium features access
 */
function requirePremium(req, res, next) {
  if (!req.user.profile) {
    return res.status(403).json({
      success: false,
      error: 'Profile not loaded',
      code: 'PROFILE_NOT_LOADED'
    });
  }

  const isPremium = req.user.profile.subscription?.status === 'active' ||
                   req.user.profile.subscription?.tier === 'premium';

  if (!isPremium) {
    return res.status(403).json({
      success: false,
      error: 'Premium subscription required',
      code: 'PREMIUM_REQUIRED'
    });
  }

  next();
}

module.exports = {
  authenticate,
  requireCompleteProfile,
  requireAgeVerification,
  requirePremium
};
