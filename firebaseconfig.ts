import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDhJrRiafXTYNBJfVlaTlZSg0Y6fs_BMaI",
  authDomain: "mobile-full-stack.firebaseapp.com",
  projectId: "mobile-full-stack",
  storageBucket: "mobile-full-stack.firebasestorage.app",
  messagingSenderId: "1090776404231",
  appId: "1090776404231:web:b50f23af6315165e71b5a2"
};

const app = initializeApp(firebaseConfig);

// Dynamic require to bypass TypeScript checking
const { getReactNativePersistence } = require("firebase/auth");

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const storage = getStorage(app);
export const db = getFirestore(app);