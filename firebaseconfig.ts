// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhJrRiafXTYNBJfVlaTlZSg0Y6fs_BMaI",
  authDomain: "mobile-full-stack.firebaseapp.com",
  projectId: "mobile-full-stack",
  storageBucket: "mobile-full-stack.firebasestorage.app",
  messagingSenderId: "1090776404231",
  appId: "1:1090776404231:web:b50f23af6315165e71b5a2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app);