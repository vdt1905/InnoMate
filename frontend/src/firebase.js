// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDHmIgZTJPFBkv8fhVjpULeafH0dg6jdM8",
    authDomain: "innomate-fc07b.firebaseapp.com",
    projectId: "innomate-fc07b",
    storageBucket: "innomate-fc07b.firebasestorage.app",
    messagingSenderId: "300566600312",
    appId: "1:300566600312:web:82b6abe3ac6a16933f2b8d",
    measurementId: "G-0WLY2QJ3EL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
