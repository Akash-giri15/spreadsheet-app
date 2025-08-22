const express = require('express');
const router = express.Router();
const { db, admin } = require('../../config/firebase');
const authMiddleware = require('../middleware/authMiddleware');
const { recalculateSheet } = require('../calculationEngine');

// Helper to generate a flattened grid for Firestore
const generateInitialGrid = (rows, cols) => {
  const grid = Array(rows * cols).fill({ value: '', displayValue: '' });
  grid[0] = { value: '5', displayValue: '5' };
  grid[1] = { value: '10', displayValue: '10' };
  grid[2] = { value: '=A1+B1', displayValue: '' };
  return { grid, rows, cols };
};

// POST /api/spreadsheets/create
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { uid } = req.user;
    const { title } = req.body;
    const newSheetRef = db.collection('spreadsheets').doc();
    await newSheetRef.set({
      title: title || 'Untitled Spreadsheet',
      owner: uid,
      collaborators: [],
      collaboratorIds: [], // Add the new field for efficient queries
      sheetData: generateInitialGrid(50, 30)
    });
    const newDoc = await newSheetRef.get();
    res.status(201).json({ id: newDoc.id, ...newDoc.data() });
  } catch (error) {
    console.error("Error creating spreadsheet:", error);
    res.status(500).json({ error: 'Failed to create spreadsheet' });
  }
});

// GET /api/spreadsheets
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { uid } = req.user;
    const spreadsheetsRef = db.collection('spreadsheets');

    // Query 1: Get sheets the user owns
    const ownedSheetsPromise = spreadsheetsRef.where('owner', '==', uid).get();
    
    // --- ✅ FIXED: Use a more efficient query for shared sheets ---
    // Query 2: Get sheets where the user's ID is in the collaboratorIds array
    const sharedSheetsPromise = spreadsheetsRef.where('collaboratorIds', 'array-contains', uid).get();

    const [ownedSnapshot, sharedSnapshot] = await Promise.all([
      ownedSheetsPromise,
      sharedSheetsPromise
    ]);

    const spreadsheetsMap = new Map();

    ownedSnapshot.forEach(doc => {
      spreadsheetsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });
    sharedSnapshot.forEach(doc => {
      spreadsheetsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    res.status(200).json(Array.from(spreadsheetsMap.values()));

  } catch (error) {
    console.error("Error fetching spreadsheets:", error);
    res.status(500).json({ error: 'Failed to fetch spreadsheets' });
  }
});

// GET /api/spreadsheets/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const doc = await db.collection('spreadsheets').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Spreadsheet not found' });
    const data = doc.data();
    const isOwner = data.owner === uid;
    const isCollaborator = data.collaboratorIds?.includes(uid); // Check the simple array
    if (!isOwner && !isCollaborator) return res.status(403).json({ error: 'Forbidden' });
    res.status(200).json({ id: doc.id, ...data });
  } catch (error) {
    console.error("Error fetching spreadsheet:", error);
    res.status(500).json({ error: 'Failed to fetch spreadsheet' });
  }
});

// PUT /api/spreadsheets/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const { rowIndex, colIndex, newValue, currentGrid } = req.body;
    const docRef = db.collection('spreadsheets').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Spreadsheet not found' });
    const data = doc.data();
    const isOwner = data.owner === uid;
    const isEditor = data.collaborators?.some(c => c.user === uid && c.role === 'editor');
    if (!isOwner && !isEditor) return res.status(403).json({ error: 'Forbidden' });
    currentGrid[rowIndex][colIndex].value = newValue;
    const recalculatedGrid = recalculateSheet(currentGrid);
    const flatGrid = recalculatedGrid.flat();
    await docRef.update({ 'sheetData.grid': flatGrid });
    res.status(200).json(recalculatedGrid);
  } catch (error) {
    console.error("Error updating spreadsheet:", error);
    res.status(500).json({ error: 'Failed to update spreadsheet' });
  }
});

// POST /api/spreadsheets/:id/share
router.post('/:id/share', authMiddleware, async (req, res) => {
  try {
    const { uid: ownerUid } = req.user;
    const { id: spreadsheetId } = req.params;
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ error: 'Email and role are required.' });
    const docRef = db.collection('spreadsheets').doc(spreadsheetId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Spreadsheet not found.' });
    const data = doc.data();
    if (data.owner !== ownerUid) return res.status(403).json({ error: 'Forbidden: Only the owner can share this sheet.' });
    const normalizedEmail = email.trim().toLowerCase();
    let userToShareWith;
    try {
      userToShareWith = await admin.auth().getUserByEmail(normalizedEmail);
    } catch (error) {
      return res.status(404).json({ error: 'User with that email not found.' });
    }
    
    // --- ✅ FIXED: Update both the detailed collaborators array and the simple ID array ---
    await docRef.update({
      collaborators: admin.firestore.FieldValue.arrayUnion({
        user: userToShareWith.uid,
        email: userToShareWith.email,
        role: role
      }),
      collaboratorIds: admin.firestore.FieldValue.arrayUnion(userToShareWith.uid)
    });

    res.status(200).json({ message: `Successfully shared with ${userToShareWith.email}.` });
  } catch (error) {
    console.error("Error sharing spreadsheet:", error);
    res.status(500).json({ error: 'Failed to share spreadsheet.' });
  }
});

module.exports = router;
