const express = require('express');
const router = express.Router();
const { db } = require('../../config/firebase');
const authMiddleware = require('../middleware/authMiddleware');

// This endpoint is protected by our authMiddleware
router.post('/create-profile', authMiddleware, async (req, res) => {
  try {
    const { uid, email } = req.user; // uid and email come from the decoded token
    const { name } = req.body; // name comes from the request body

    // Create a new document in the 'users' collection with the user's uid
    await db.collection('users').doc(uid).set({
      name: name,
      email: email,
    });

    res.status(201).json({ message: `User profile created for ${email}` });
  } catch (error) {
    console.error("Error creating user profile:", error);
    res.status(500).json({ error: "Failed to create user profile." });
  }
});

module.exports = router;