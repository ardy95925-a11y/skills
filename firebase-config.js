// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, where, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBsFs1qrmojBkuwIynMrFUYmt5NovALDoo",
  authDomain: "pyro-scroll.firebaseapp.com",
  projectId: "pyro-scroll",
  storageBucket: "pyro-scroll.firebasestorage.app",
  messagingSenderId: "422391668810",
  appId: "1:422391668810:web:847b8f56e3aedc8430c6b3",
  measurementId: "G-TW76D61P81"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.addScope('profile');
googleProvider.addScope('email');

export { signInWithPopup, signOut, onAuthStateChanged, collection, addDoc, query, orderBy, limit, getDocs, where, updateDoc, doc };
