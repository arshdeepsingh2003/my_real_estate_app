// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "estate-app-565f6.firebaseapp.com",
  projectId: "estate-app-565f6",
  storageBucket: "estate-app-565f6.appspot.com",
  messagingSenderId: "437751688855",
  appId: "1:437751688855:web:37d4866550cf5729b643d2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);