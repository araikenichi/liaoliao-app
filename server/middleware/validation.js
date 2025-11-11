/**
 * Validation middleware for request data
 */

function validateUserProfile(req, res, next) {
  const { displayName, age, gender, bio, interests } = req.body;
  const errors = [];

  // Validate displayName
  if (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0) {
    errors.push('Display name is required');
  } else if (displayName.length > 50) {
    errors.push('Display name must be 50 characters or less');
  }

  // Validate age
  if (!age || typeof age !== 'number') {
    errors.push('Age is required and must be a number');
  } else if (age < 18 || age > 100) {
    errors.push('Age must be between 18 and 100');
  }

  // Validate gender
  const validGenders = ['male', 'female', 'other'];
  if (!gender || !validGenders.includes(gender)) {
    errors.push('Gender must be one of: male, female, other');
  }

  // Validate bio
  if (!bio || typeof bio !== 'string' || bio.trim().length === 0) {
    errors.push('Bio is required');
  } else if (bio.length > 500) {
    errors.push('Bio must be 500 characters or less');
  }

  // Validate interests
  if (!interests || !Array.isArray(interests) || interests.length === 0) {
    errors.push('At least one interest is required');
  } else if (interests.length > 10) {
    errors.push('Maximum 10 interests allowed');
  } else if (!interests.every(i => typeof i === 'string' && i.length <= 30)) {
    errors.push('Each interest must be a string of 30 characters or less');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors
    });
  }

  next();
}

function validateMessage(req, res, next) {
  const { content, recipientId } = req.body;
  const errors = [];

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    errors.push('Message content is required');
  } else if (content.length > 1000) {
    errors.push('Message must be 1000 characters or less');
  }

  if (!recipientId || typeof recipientId !== 'string') {
    errors.push('Recipient ID is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors
    });
  }

  next();
}

function validateMatchAction(req, res, next) {
  const { matchId, action } = req.body;
  const errors = [];

  if (!matchId || typeof matchId !== 'string') {
    errors.push('Match ID is required');
  }

  const validActions = ['accept', 'decline', 'skip'];
  if (!action || !validActions.includes(action)) {
    errors.push('Action must be one of: accept, decline, skip');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors
    });
  }

  next();
}

function sanitizeInput(req, res, next) {
  // Remove potentially dangerous HTML tags and scripts
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '')
        .trim();
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);

  next();
}

module.exports = {
  validateUserProfile,
  validateMessage,
  validateMatchAction,
  sanitizeInput
};
