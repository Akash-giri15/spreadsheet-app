// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDz-cOHbZWatNNQrlgsdOus61wqWDepMl8",
  authDomain: "spreadsheet-app-ebfa7.firebaseapp.com",
  projectId: "spreadsheet-app-ebfa7",
  storageBucket: "spreadsheet-app-ebfa7.firebasestorage.app",
  messagingSenderId: "774331608840",
  appId: "1:774331608840:web:4525828dd0551cc4ba06bd",
  measurementId: "G-P5DF155YBR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase auth instance
export const auth = getAuth(app);