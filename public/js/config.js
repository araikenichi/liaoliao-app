// Firebase Configuration
// NOTE: Replace these with your actual Firebase config values
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export config
window.config = {
    firebaseConfig,
    API_BASE_URL,
    auth,
    db
};
