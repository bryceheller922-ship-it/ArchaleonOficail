import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  title?: string;
  company?: string;
  photoURL?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, title: string, company: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Set persistence to local (survives browser close)
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {});
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Try to load full profile from Firestore
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            // Firestore profile doesn't exist yet – use Auth data
            const fallback: UserProfile = {
              uid: user.uid,
              email: user.email || "",
              displayName: user.displayName || "User",
            };
            setUserProfile(fallback);
            // Try to create the Firestore profile
            try { await setDoc(doc(db, "users", user.uid), fallback); } catch {}
          }
        } catch {
          setUserProfile({
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "User",
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function login(email: string, password: string) {
    if (!email.trim()) throw new Error("Email is required.");
    if (!password) throw new Error("Password is required.");
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function register(email: string, password: string, name: string, title: string, company: string) {
    if (!name.trim()) throw new Error("Full name is required.");
    if (!email.trim()) throw new Error("Email is required.");
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Update Firebase Auth displayName
    await updateProfile(cred.user, { displayName: name });

    const profile: UserProfile = {
      uid: cred.user.uid,
      email,
      displayName: name,
      title: title || undefined,
      company: company || undefined,
    };

    // Write profile to Firestore (don't silently swallow)
    try {
      await setDoc(doc(db, "users", cred.user.uid), profile);
    } catch (err) {
      console.error("Failed to save profile to Firestore:", err);
      // Auth account was created, profile just didn't persist to Firestore
    }

    // Set profile immediately so UI updates
    setUserProfile(profile);
  }

  async function logout() {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
