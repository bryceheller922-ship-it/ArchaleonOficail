import {
  collection, doc, addDoc, getDocs, onSnapshot,
  query, where, orderBy, updateDoc,
  setDoc, deleteDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { supabase } from "./supabase";
import type { Business, Conversation, Message } from "./mockData";

// --------------- Timeout helper ---------------

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
        resolve({ lat: r.geometry.location.lat(), lng: r.geometry.location.lng(), city, state, country });
      } else {
        resolve(null);
      }
    });
  });
}

// =============================================
// LOCAL STORAGE — guaranteed fallback for listings
// =============================================

const LOCAL_KEY = "archaleon_listings";

function getLocalListings(): Business[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalListings(listings: Business[]) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(listings)); } catch {}
}

function addLocalListing(listing: Business) {
  const all = getLocalListings();
  all.unshift(listing);
  saveLocalListings(all);
}

function updateLocalListing(id: string, data: Partial<Business>) {
  const all = getLocalListings().map(l => l.id === id ? { ...l, ...data } : l);
  saveLocalListings(all);
}

function deleteLocalListing(id: string) {
  saveLocalListings(getLocalListings().filter(l => l.id !== id));
}

// =============================================
// SUPABASE ROW MAPPING
// =============================================

function businessToRow(data: Omit<Business, "id">) {
  return {
    name: data.name, industry: data.industry, sector: data.sector,
    description: data.description, revenue: data.revenue, ebitda: data.ebitda,
    valuation: data.valuation, employees: data.employees, founded: data.founded,
    location: data.location, city: data.city, state: data.state, country: data.country,
    lat: data.lat, lng: data.lng, logo: data.logo, tags: data.tags, status: data.status,
    asking_price: data.askingPrice, gross_margin: data.grossMargin,
    yoy_growth: data.yoyGrowth, owner_name: data.ownerName,
    owner_title: data.ownerTitle, owner_avatar: data.ownerAvatar,
    listed_at: data.listedAt, website: data.website, deal_type: data.dealType,
    image_urls: (data.imageUrls || []) as string[],
    created_by: data.createdBy || "",
    listing_type: data.listingType || "For Sale",
  };
}

function rowToBusiness(row: Record<string, unknown>): Business {
  return {
    id: String(row.id),
    name: String(row.name || ""),
    industry: String(row.industry || ""),
    sector: String(row.sector || ""),
    description: String(row.description || ""),
    revenue: String(row.revenue || "N/A"),
    ebitda: String(row.ebitda || "N/A"),
    valuation: String(row.valuation || "N/A"),
    employees: Number(row.employees) || 0,
    founded: Number(row.founded) || 0,
    location: String(row.location || ""),
    city: String(row.city || ""),
    state: String(row.state || ""),
    country: String(row.country || ""),
    lat: Number(row.lat) || 0,
    lng: Number(row.lng) || 0,
    logo: String(row.logo || ""),
    tags: (row.tags as string[]) || [],
    status: (row.status as Business["status"]) || "Active",
    askingPrice: String(row.asking_price || "N/A"),
    grossMargin: String(row.gross_margin || "N/A"),
    yoyGrowth: String(row.yoy_growth || "N/A"),
    ownerName: String(row.owner_name || ""),
    ownerTitle: String(row.owner_title || ""),
    ownerAvatar: String(row.owner_avatar || ""),
    listedAt: String(row.listed_at || ""),
    website: String(row.website || ""),
    dealType: String(row.deal_type || ""),
    imageUrls: (row.image_urls as string[]) || [],
    createdBy: String(row.created_by || ""),
    listingType: (row.listing_type as Business["listingType"]) || "For Sale",
  };
}

// =============================================
// LISTINGS — Supabase + localStorage fallback
// Deals ALWAYS save. Supabase is tried first,
// localStorage catches anything that fails.
// =============================================

export async function createListing(data: Omit<Business, "id">): Promise<string> {
  const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Always save locally first — guaranteed to work
  const localBusiness: Business = { id: localId, ...data };
  addLocalListing(localBusiness);

  // Then try Supabase (best-effort)
  try {
    const result = await withTimeout(
      Promise.resolve(supabase.from("listings").insert(businessToRow(data)).select("id").single()),
      10000
    ) as { data: { id: string } | null; error: unknown };
    if (!result.error && result.data) {
      deleteLocalListing(localId);
      return result.data.id;
    }
  } catch (err) {
    console.warn("Supabase insert failed, listing saved locally:", err);
  }

  return localId;
}

export async function getListingById(id: string): Promise<Business | null> {
  const local = getLocalListings().find(l => l.id === id);
  if (local) return local;
  try {
    const result = await withTimeout(
      Promise.resolve(supabase.from("listings").select("*").eq("id", id).single()),
      5000
    ) as { data: Record<string, unknown> | null; error: unknown };
    if (!result.error && result.data) return rowToBusiness(result.data);
  } catch {}
  return null;
}

export async function updateListing(id: string, data: Omit<Business, "id">) {
  updateLocalListing(id, data);
  try {
    await withTimeout(
      Promise.resolve(supabase.from("listings").update(businessToRow(data)).eq("id", id)),
      8000
    );
  } catch {
    console.warn("Supabase update failed, changes saved locally");
  }
}

export async function deleteListing(id: string) {
  deleteLocalListing(id);
  try {
    await supabase.from("listings").delete().eq("id", id);
  } catch {}
}

// Subscribe: merge Supabase listings + local-only listings
export function subscribeToListings(callback: (listings: Business[]) => void) {
  let supabaseListings: Business[] = [];
  let hasFetchedSupabase = false;

  function mergeAndCallback() {
    const localOnly = getLocalListings();
    // Deduplicate: if a local listing exists in Supabase (by name+createdBy), skip the local
    const supabaseIds = new Set(supabaseListings.map(l => l.id));
    const uniqueLocal = localOnly.filter(l => !supabaseIds.has(l.id));
    callback([...uniqueLocal, ...supabaseListings]);
  }

  // Fetch from Supabase
  supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false })
    .then(({ data, error }) => {
      hasFetchedSupabase = true;
      if (!error && data) {
        supabaseListings = data.map(rowToBusiness);
      }
      mergeAndCallback();
    }, () => {
      hasFetchedSupabase = true;
      mergeAndCallback();
    });

  // Show local listings immediately while Supabase loads
  if (!hasFetchedSupabase) {
    const localOnly = getLocalListings();
    if (localOnly.length > 0) callback(localOnly);
  }

  // Realtime for live updates
  const channel = supabase
    .channel("listings-realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: "listings" }, () => {
      supabase.from("listings").select("*").order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data) {
            supabaseListings = data.map(rowToBusiness);
            mergeAndCallback();
          }
        });
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// =============================================
// CONVERSATIONS — Firebase
// =============================================

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
        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
      callback(convos);
    },
    () => callback([])
  );
}

export async function getOrCreateConversation(
  myId: string, myName: string, myAvatar: string,
  otherId: string, otherName: string, otherAvatar: string,
  businessName?: string
): Promise<string> {
  try {
    const q = query(collection(db, "conversations"), where("participants", "array-contains", myId));
    const snap = await withTimeout(getDocs(q));
    for (const d of snap.docs) {
      const data = d.data();
      if ((data.participants as string[]).includes(otherId)) return d.id;
    }
  } catch {}

  const docRef = await withTimeout(
    addDoc(collection(db, "conversations"), {
      participants: [myId, otherId],
      participantNames: [myName, otherName],
      participantAvatars: [myAvatar, otherAvatar],
      lastMessage: "", lastMessageTime: new Date().toISOString(),
      unread: 0, businessName: businessName || "",
    })
  );
  return docRef.id;
}

// =============================================
// MESSAGES — Firebase
// =============================================

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
    (snap) => { callback(snap.docs.map((d) => ({ id: d.id, conversationId, ...d.data() } as Message))); },
    () => callback([])
  );
}

export async function sendMessageToFirestore(
  conversationId: string, senderId: string, senderName: string, senderAvatar: string, text: string
) {
  await withTimeout(
    addDoc(collection(db, "conversations", conversationId, "messages"), {
      senderId, senderName, senderAvatar, text,
      timestamp: new Date().toISOString(), read: false,
    })
  );
  updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: text, lastMessageTime: new Date().toISOString(),
  }).catch(() => {});
}

// =============================================
// NETWORK / USERS — Firebase
// =============================================

export function subscribeToUsers(
  currentUserId: string,
  callback: (users: { id: string; displayName: string; email: string; title?: string; company?: string }[]) => void
) {
  return onSnapshot(
    collection(db, "users"),
    (snap) => {
      callback(snap.docs
        .filter((d) => d.id !== currentUserId)
        .map((d) => ({ id: d.id, ...d.data() } as { id: string; displayName: string; email: string; title?: string; company?: string })));
    },
    () => callback([])
  );
}

// =============================================
// PROFILE — Firebase
// =============================================

export async function updateUserProfile(uid: string, data: Record<string, unknown>) {
  try { await withTimeout(setDoc(doc(db, "users", uid), data, { merge: true })); }
  catch { console.warn("Profile update may have timed out"); }
}

// =============================================
// PORTFOLIO HOLDINGS — Firebase
// =============================================

export interface Holding {
  id: string; name: string; sector: string; acquired: string;
  costBasis: number; currentValue: number; notes: string;
}

export function subscribeToHoldings(userId: string, callback: (holdings: Holding[]) => void) {
  return onSnapshot(
    collection(db, "users", userId, "holdings"),
    (snap) => { callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Holding))); },
    () => callback([])
  );
}

export async function addHolding(userId: string, data: Omit<Holding, "id">) {
  await withTimeout(addDoc(collection(db, "users", userId, "holdings"), data));
}

export async function deleteHolding(userId: string, holdingId: string) {
  await withTimeout(deleteDoc(doc(db, "users", userId, "holdings", holdingId)));
}

export async function updateBudget(userId: string, budget: number) {
  try { await withTimeout(setDoc(doc(db, "users", userId), { budget }, { merge: true })); } catch {}
}
