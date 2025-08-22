const admin = require('firebase-admin');

// Make sure the path to your service account key is correct
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
console.log('Firebase Connected...');

module.exports = { admin, db };