import {
  collection, doc, addDoc, getDocs, onSnapshot,
  query, where, orderBy, updateDoc, serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import type { Business, Conversation, Message } from "./mockData";

// --------------- Timeout helper ---------------
// Firestore can hang if rules block writes. This ensures we never wait forever.

function withTimeout<T>(promise: Promise<T>, ms = 8000, fallback?: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve, reject) =>
      setTimeout(() => (fallback !== undefined ? resolve(fallback) : reject(new Error("Operation timed out"))), ms)
    ),
  ]);
}

// --------------- Geocoding ---------------

export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number; city: string; state: string; country: string } | null> {
  return new Promise((resolve) => {
    if (!window.google?.maps) { resolve(null); return; }
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const r = results[0];
        let city = "", state = "", country = "";
        for (const c of r.address_components) {
          if (c.types.includes("locality")) city = c.long_name;
          if (c.types.includes("administrative_area_level_1")) state = c.short_name;
          if (c.types.includes("country")) country = c.long_name;
        }
        resolve({
          lat: r.geometry.location.lat(),
          lng: r.geometry.location.lng(),
          city, state, country,
        });
      } else {
        resolve(null);
      }
    });
  });
}

// --------------- Image Upload ---------------

export async function uploadImages(files: File[], listingId: string): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    try {
      const storageRef = ref(storage, `listings/${listingId}/${Date.now()}_${file.name}`);
      await withTimeout(uploadBytes(storageRef, file));
      urls.push(await withTimeout(getDownloadURL(storageRef)));
    } catch {
      console.warn("Failed to upload image:", file.name);
    }
  }
  return urls;
}

// --------------- Listings ---------------

export async function createListing(
  data: Omit<Business, "id">,
  images: File[]
): Promise<string> {
  const docRef = await withTimeout(
    addDoc(collection(db, "listings"), {
      ...data,
      imageUrls: [],
      createdAt: serverTimestamp(),
    })
  );

  if (images.length > 0) {
    try {
      const imageUrls = await uploadImages(images, docRef.id);
      if (imageUrls.length > 0) {
        await withTimeout(updateDoc(docRef, { imageUrls }));
      }
    } catch {
      console.warn("Image upload failed, listing created without images");
    }
  }

  return docRef.id;
}

export function subscribeToListings(callback: (listings: Business[]) => void) {
  const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Business)));
    },
    () => callback([])
  );
}

// --------------- Conversations ---------------

export function subscribeToConversations(
  userId: string,
  callback: (convos: Conversation[]) => void
) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const convos = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Conversation))
        .sort(
          (a, b) =>
            new Date(b.lastMessageTime).getTime() -
            new Date(a.lastMessageTime).getTime()
        );
      callback(convos);
    },
    () => callback([])
  );
}

export async function getOrCreateConversation(
  myId: string,
  myName: string,
  myAvatar: string,
  otherId: string,
  otherName: string,
  otherAvatar: string,
  businessName?: string
): Promise<string> {
  // look for existing conversation between these two users
  try {
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", myId)
    );
    const snap = await withTimeout(getDocs(q));
    for (const d of snap.docs) {
      const data = d.data();
      if ((data.participants as string[]).includes(otherId)) return d.id;
    }
  } catch {
    // If query fails/times out, just create a new one
  }

  // create new
  const docRef = await withTimeout(
    addDoc(collection(db, "conversations"), {
      participants: [myId, otherId],
      participantNames: [myName, otherName],
      participantAvatars: [myAvatar, otherAvatar],
      lastMessage: "",
      lastMessageTime: new Date().toISOString(),
      unread: 0,
      businessName: businessName || "",
    })
  );
  return docRef.id;
}

// --------------- Messages ---------------

export function subscribeToMessages(
  conversationId: string,
  callback: (msgs: Message[]) => void
) {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("timestamp", "asc")
  );
  return onSnapshot(
    q,
    (snap) => {
      callback(
        snap.docs.map((d) => ({
          id: d.id,
          conversationId,
          ...d.data(),
        } as Message))
      );
    },
    () => callback([])
  );
}

export async function sendMessageToFirestore(
  conversationId: string,
  senderId: string,
  senderName: string,
  senderAvatar: string,
  text: string
) {
  await withTimeout(
    addDoc(collection(db, "conversations", conversationId, "messages"), {
      senderId,
      senderName,
      senderAvatar,
      text,
      timestamp: new Date().toISOString(),
      read: false,
    })
  );
  // Update conversation last message (fire-and-forget)
  updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: text,
    lastMessageTime: new Date().toISOString(),
  }).catch(() => {});
}

// --------------- Network / Users ---------------

export function subscribeToUsers(
  currentUserId: string,
  callback: (users: { id: string; displayName: string; email: string; title?: string; company?: string }[]) => void
) {
  return onSnapshot(
    collection(db, "users"),
    (snap) => {
      const users = snap.docs
        .filter((d) => d.id !== currentUserId)
        .map((d) => ({ id: d.id, ...d.data() } as { id: string; displayName: string; email: string; title?: string; company?: string }));
      callback(users);
    },
    () => callback([])
  );
}

// --------------- Fire-and-forget profile write ---------------
export function saveUserProfile(uid: string, profile: Record<string, unknown>) {
  // Don't await - just try to write and move on
  const { setDoc: sd } = { setDoc: () => import("firebase/firestore").then(m => m.setDoc(doc(db, "users", uid), profile)) };
  sd().catch(() => {});
}
