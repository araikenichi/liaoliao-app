const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');

// Firebase Admin SDK initialization (for server-side)
let adminApp;
try {
  adminApp = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  // For local development without service account
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️ Running in development mode without Firebase Admin credentials');
  }
}

// Firebase Client SDK configuration (for client-side operations)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase Client SDK
const clientApp = initializeApp(firebaseConfig);

// Export Firestore, Auth, Storage instances
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

// Firestore settings
db.settings({
  ignoreUndefinedProperties: true,
  timestampsInSnapshots: true
});

module.exports = {
  admin,
  adminApp,
  clientApp,
  db,
  auth,
  storage,
  firebaseConfig
};
