// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "myestate-736bd.firebaseapp.com",
  projectId: "myestate-736bd",
  storageBucket: "myestate-736bd.appspot.com",
  messagingSenderId: "524097934468",
  appId: "1:524097934468:web:05e7912fbc312ab654ded1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);