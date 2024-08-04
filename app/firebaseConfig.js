import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC14J6_VT7uU7rJetKL9RsNqQrATfHsMP0",
  authDomain: "pantry-vibe.firebaseapp.com",
  projectId: "pantry-vibe",
  storageBucket: "pantry-vibe.appspot.com",
  messagingSenderId: "1059362299101",
  appId: "1:1059362299101:web:4931a3356f5e703c4dcf34",
  measurementId: "G-KSNDTYQX1F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {auth, db, storage };
