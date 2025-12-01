
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDbI4eYGEA-mQvkHoR0CgTcV0GLmOyNNoo",
  authDomain: "dentaai-3d591.firebaseapp.com",
  projectId: "dentaai-3d591",
  storageBucket: "dentaai-3d591.firebasestorage.app",
  messagingSenderId: "368276947344",
  appId: "1:368276947344:web:edb124cd59027cc99b3315",
  measurementId: "G-QHKCEEWE44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
