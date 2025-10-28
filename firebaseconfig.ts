import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDhJrRiafXTYNBJfVlaTlZSg0Y6fs_BMaI",
  authDomain: "mobile-full-stack.firebaseapp.com",
  projectId: "mobile-full-stack",
  storageBucket: "mobile-full-stack.firebasestorage.app",
  messagingSenderId: "1090776404231",
  appId: "1:1090776404231:web:b50f23af6315165e71b5a2"
};

const app = initializeApp(firebaseConfig);

// Use getAuth instead of initializeAuth - it handles React Native persistence automatically
export const auth = getAuth(app);