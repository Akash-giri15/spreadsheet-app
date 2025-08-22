// server/middleware/authMiddleware.js

// BEFORE (Incorrect):
// const { admin } = require('../../config/firebase');

// AFTER (Correct):
const admin = require('firebase-admin');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }

  try {
    // This will now work correctly because it uses the initialized admin instance
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    // This is the error you were seeing
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
  }
};

module.exports = authMiddleware;