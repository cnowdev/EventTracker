// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import { getFunctions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDb_khCZmi4G7fsOWIH3-YMxUgpu8W0wew",
  authDomain: "fbla23.firebaseapp.com",
  projectId: "fbla23",
  storageBucket: "fbla23.appspot.com",
  messagingSenderId: "134644769398",
  appId: "1:134644769398:web:5bdb3020f070b852c5f557"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);
export default app