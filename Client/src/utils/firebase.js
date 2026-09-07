import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "shifraai-69ff4.firebaseapp.com",
  projectId: "shifraai-69ff4",
  storageBucket: "shifraai-69ff4.firebasestorage.app",
  messagingSenderId: "668277586335",
  appId: "1:668277586335:web:67b22d456ce9f647f7a5aa",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
