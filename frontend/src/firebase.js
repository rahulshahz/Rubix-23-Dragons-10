import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDHeqRC5b10xzP2jpeusMPVnhToVmnDAwk",
  authDomain: "shareme-authentication.firebaseapp.com",
  projectId: "shareme-authentication",
  storageBucket: "shareme-authentication.appspot.com",
  messagingSenderId: "182661584887",
  appId: "1:182661584887:web:6162ae9f12408f427780f2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, provider);

export const signOutWithGoogle = () => signOut(auth);
