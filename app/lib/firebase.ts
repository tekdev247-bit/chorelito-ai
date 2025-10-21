import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyCbeZVhlESwO8m1Vo1-vWj9NCbavowBxu4",
  authDomain: "chorelito-ai.firebaseapp.com",
  projectId: "chorelito-ai",
  storageBucket: "chorelito-ai.firebasestorage.app",
  messagingSenderId: "575480892777",
  appId: "1:575480892777:web:176dda4eb1d50332a4c1f8",
  measurementId: "G-R0XQ411RTT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
