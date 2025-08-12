// src/firebase-config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // Аналитика вам пока не нужна, можно закомментировать

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbCfIdiRetHH2j5aTjSBqeYH7tD9_U3Cs", // Ваш ключ будет другим
  authDomain: "lolab-d6486.firebaseapp.com",
  projectId: "lolab-d6486",
  storageBucket: "lolab-d6486.appspot.com",
  messagingSenderId: "781648830164",
  appId: "1:781648830164:web:e20d7030a66171b0426541",
  measurementId: "G-6L1NWETH05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Тоже пока не нужно

// Экспортируем нужные нам сервисы для использования в других компонентах
export const auth = getAuth(app);
export const db = getFirestore(app);