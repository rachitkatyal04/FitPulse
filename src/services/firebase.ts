import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";

// Safely access config and throw a clear error if missing
const extra = Constants.expoConfig?.extra;
if (!extra) {
  throw new Error(
    "Expo extra config is missing. Make sure you have set up app.config.js and .env correctly."
  );
}

const firebaseConfig = {
  apiKey: extra.FIREBASE_API_KEY,
  authDomain: extra.FIREBASE_AUTH_DOMAIN,
  projectId: extra.FIREBASE_PROJECT_ID,
  storageBucket: extra.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID,
  appId: extra.FIREBASE_APP_ID,
  measurementId: extra.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth (persistence is automatic in React Native)
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app;
