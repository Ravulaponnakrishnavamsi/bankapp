const admin = require('firebase-admin');

/**
 * Initializes Firebase Admin SDK.
 * Expects FIREBASE_SERVICE_ACCOUNT environment variable to be a JSON string.
 */
function initFirebase() {
  if (admin.apps.length > 0) return admin.firestore();

  try {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountVar) {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT not found. Falling back to in-memory (dev only).');
      return null;
    }

    // Parse the JSON string
    const serviceAccount = JSON.parse(serviceAccountVar);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log('✅ Firebase Admin initialized successfully.');
    return admin.firestore();
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    return null;
  }
}

const db = initFirebase();

module.exports = { admin, db };
