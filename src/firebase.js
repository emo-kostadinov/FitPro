import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAllKHHB0Vus21gPtl1ln1afVThkP76AJ8",
  authDomain: "fitpro-93a43.firebaseapp.com",
  projectId: "fitpro-93a43",
  storageBucket: "fitpro-93a43.firebasestorage.app",
  messagingSenderId: "850215566724",
  appId: "1:850215566724:web:b110acf19e9eb8b97831d1",
  measurementId: "G-XQ33XEWFBM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    console.log('Starting Google Sign-In...');
    const result = await signInWithPopup(auth, provider);
    console.log('Google Sign-In successful:', result.user);
    return result.user;
  } catch (error) {
    console.error('Error during Google Sign-In:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error during sign-out:', error);
  }
};

// Track user authentication state
export const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };