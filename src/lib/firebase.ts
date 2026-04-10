import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBadBNC_esX2Y7i_5weizvUWUThJRIuF8Y",
  authDomain: "archaleon-40cb9.firebaseapp.com",
  projectId: "archaleon-40cb9",
  storageBucket: "archaleon-40cb9.firebasestorage.app",
  messagingSenderId: "859479218624",
  appId: "1:859479218624:web:9a750b074ba5463fae5025",
  measurementId: "G-5PTK4ZLRQN"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
