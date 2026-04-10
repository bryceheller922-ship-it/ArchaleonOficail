import {
  collection, doc, addDoc, getDocs, onSnapshot,
  query, where, orderBy, updateDoc, serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import type { Business, Conversation, Message } from "./mockData";

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
    const storageRef = ref(storage, `listings/${listingId}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    urls.push(await getDownloadURL(storageRef));
  }
  return urls;
}

// --------------- Listings ---------------

export async function createListing(
  data: Omit<Business, "id">,
  images: File[]
): Promise<string> {
  const docRef = await addDoc(collection(db, "listings"), {
    ...data,
    imageUrls: [],
    createdAt: serverTimestamp(),
  });

  if (images.length > 0) {
    const imageUrls = await uploadImages(images, docRef.id);
    await updateDoc(docRef, { imageUrls });
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
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", myId)
  );
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    const data = d.data();
    if ((data.participants as string[]).includes(otherId)) return d.id;
  }

  // create new
  const docRef = await addDoc(collection(db, "conversations"), {
    participants: [myId, otherId],
    participantNames: [myName, otherName],
    participantAvatars: [myAvatar, otherAvatar],
    lastMessage: "",
    lastMessageTime: new Date().toISOString(),
    unread: 0,
    businessName: businessName || "",
  });
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
  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    senderId,
    senderName,
    senderAvatar,
    text,
    timestamp: new Date().toISOString(),
    read: false,
  });
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: text,
    lastMessageTime: new Date().toISOString(),
  });
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
