import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/storage";

// Define configuration strictly
const firebaseConfig = {
  apiKey: "AIzaSyB7rCL1G7VQR4N0QWfVXRZeOflfbZsBzmM",
  authDomain: "edu-aptek.firebaseapp.com",
  databaseURL: "https://edu-aptek-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "edu-aptek",
  storageBucket: "edu-aptek.firebasestorage.app",
  messagingSenderId: "1014517482521",
  appId: "1:1014517482521:web:55f6cab796ef88964ed688"
};

// Strict check to prevent re-initialization error
if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

export const auth = firebase.auth();
export const db = firebase.database();
export const storage = firebase.storage();
export default firebase;