// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyCosgtpTjSI97MUiAn28pYmZXlASj_2CT8",
  authDomain: "trends-anycard.firebaseapp.com",
  projectId: "trends-anycard",
  storageBucket: "trends-anycard.firebasestorage.app",
  messagingSenderId: "336775827875",
  appId: "1:336775827875:web:7c7077957b0fb4bd5e4a16",
  measurementId: "G-7V363LEVK2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

const db = getFirestore(app);

export { db, auth };
