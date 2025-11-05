// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7qt2GvvP65Z7L5xXKoWHvZfFJ9AXQ29Y",
  authDomain: "help-66e2c.firebaseapp.com",
  projectId: "help-66e2c",
  storageBucket: "help-66e2c.firebasestorage.app",
  messagingSenderId: "992898284975",
  appId: "1:992898284975:web:954250ee78e0b218f4c35a",
  measurementId: "G-HTTLDR7J1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
