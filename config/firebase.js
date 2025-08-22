const admin = require('firebase-admin');

try {
  // This path is correct because serviceAccountKey.json is in the same folder
  const serviceAccount = require('./serviceAccountKey.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();
  const auth = admin.auth();

  console.log('Firebase Connected Successfully.');

  module.exports = { db, auth, admin };

} catch (error) {
  // This will give a much clearer error message if something is wrong
  console.error("FIREBASE INITIALIZATION FAILED:", error);
  process.exit(1); // Exit the process if Firebase fails to initialize
}