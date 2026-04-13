import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDSoCQ-ZXnYRKRiZVwXZBM_MVC3bzRw4IU",
  authDomain: "endodoctordirectory.firebaseapp.com",
  projectId: "endodoctordirectory",
  storageBucket: "endodoctordirectory.firebasestorage.app",
  messagingSenderId: "58708731962",
  appId: "1:58708731962:web:f44b0426542e0f1d2d6d03"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
