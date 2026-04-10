import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
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

// Helper: race a promise against a timeout
function raceTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Build fallback profile from Firebase Auth data
        const fallback: UserProfile = {
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "User",
        };

        // Try to load Firestore profile, but don't hang
        try {
          const docSnap = await raceTimeout(getDoc(doc(db, "users", user.uid)), 4000);
          if (docSnap && docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            setUserProfile(fallback);
          }
        } catch {
          setUserProfile(fallback);
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

    // 1. Create Firebase Auth account
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // 2. Update display name on the auth user (fire-and-forget)
    updateProfile(cred.user, { displayName: name }).catch(() => {});

    // 3. Build profile
    const profile: UserProfile = {
      uid: cred.user.uid,
      email,
      displayName: name,
      title: title || undefined,
      company: company || undefined,
    };

    // 4. Set profile in state IMMEDIATELY so UI updates
    setUserProfile(profile);

    // 5. Try to write to Firestore (fire-and-forget — don't block the UI)
    setDoc(doc(db, "users", cred.user.uid), profile).catch((err) => {
      console.warn("Firestore profile write failed:", err);
    });
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
