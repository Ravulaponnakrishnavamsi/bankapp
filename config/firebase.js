const admin = require('firebase-admin');

/**
 * Initializes Firebase Admin SDK.
 * Expects FIREBASE_SERVICE_ACCOUNT environment variable to be a JSON string.
 */
function initFirebase() {
  if (admin.apps.length > 0) return admin.firestore();

  try {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    // Check if missing or a common placeholder string
    if (!serviceAccountVar || serviceAccountVar.includes('paste_the_entire_json')) {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT not set or invalid. Falling back to in-memory mode.');
      return null;
    }

    // Try to parse JSON but wrapped in a check
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountVar);
    } catch (parseErr) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', parseErr.message);
      return null;
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log('✅ Firebase Admin initialized successfully.');
    // Set a sync timeout on Firestore if possible (though Admin SDK is mostly async)
    return admin.firestore();
  } catch (error) {
    console.error('❌ Unexpected error during Firebase init:', error.message);
    return null;
  }
}

const db = initFirebase();

module.exports = { admin, db };
