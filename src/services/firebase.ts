import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA2WwS8CRQjqui05RKi9mhhszSyrp_kaig",
  authDomain: "dinamicagestiondeconocimiento.firebaseapp.com",
  databaseURL: "https://dinamicagestiondeconocimiento-default-rtdb.firebaseio.com",
  projectId: "dinamicagestiondeconocimiento",
  storageBucket: "dinamicagestiondeconocimiento.firebasestorage.app",
  messagingSenderId: "101644290794",
  appId: "1:101644290794:web:c55ded73ebcee712d76593",
  measurementId: "G-D3NFV3RDJM"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
