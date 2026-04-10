import { useState, useEffect } from "react";
import { Search, UserPlus, Check, Clock, MessageSquare, ExternalLink, Network, TrendingUp, Filter } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { subscribeToUsers, subscribeToListings, getOrCreateConversation } from "../lib/firestore";

interface NetworkUser {
  id: string;
  displayName: string;
  email: string;
  title?: string;
  company?: string;
}

interface NetworkViewProps {
  navigateToConversation: (convoId: string) => void;
}

export default function NetworkView({ navigateToConversation }: NetworkViewProps) {
  const { currentUser, userProfile } = useAuth();
  const [users, setUsers] = useState<NetworkUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<NetworkUser | null>(null);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [showAuth, setShowAuth] = useState(false);
  const [listingCount, setListingCount] = useState(0);

  // subscribe to users
  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToUsers(currentUser.uid, setUsers);
    return unsub;
  }, [currentUser]);

  // subscribe to listings for stats
  useEffect(() => {
    const unsub = subscribeToListings((listings) => {
      setListingCount(listings.length);
    });
    return unsub;
  }, []);

  const filtered = users.filter(p => {
    const q = searchQuery.toLowerCase();
    return !q ||
      p.displayName.toLowerCase().includes(q) ||
      (p.company?.toLowerCase().includes(q)) ||
      (p.title?.toLowerCase().includes(q));
  });

  const connected = users.filter(p => connectedIds.has(p.id));
  const pending = users.filter(p => pendingIds.has(p.id));

  function handleConnect(id: string) {
    setPendingIds(prev => new Set(prev).add(id));
    // Simulate acceptance after 2 seconds
    setTimeout(() => {
      setPendingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      setConnectedIds(prev => new Set(prev).add(id));
    }, 2000);
  }

  async function handleMessage(user: NetworkUser) {
    if (!currentUser || !userProfile) {
      setShowAuth(true);
      return;
    }
    const myInitials = userProfile.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    const otherInitials = user.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    try {
      const convoId = await getOrCreateConversation(
        currentUser.uid,
        userProfile.displayName,
        myInitials,
        user.id,
        user.displayName,
        otherInitials
      );
      navigateToConversation(convoId);
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  }

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-[#1a241a] rounded-2xl flex items-center justify-center">
          <Network size={28} className="text-[#4ade80]" />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold mb-1">Sign in to explore the network</p>
          <p className="text-gray-500 text-sm mb-4">Connect with investors and business owners</p>
          <button onClick={() => setShowAuth(true)} className="bg-[#2d5a27] hover:bg-[#3a7232] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
            Sign In
          </button>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel - hidden on mobile */}
      <div className="hidden md:flex w-72 flex-col border-r border-[#1e2e1e] bg-[#0d1410] overflow-y-auto flex-shrink-0">
        {/* Stats */}
        <div className="p-4 border-b border-[#1e2e1e]">
          <h2 className="text-white font-bold text-lg mb-4">Your Network</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#141a14] border border-[#1e2e1e] rounded-xl p-3">
              <p className="text-gray-500 text-xs">Connections</p>
              <p className="text-white font-bold text-xl">{connected.length}</p>
            </div>
            <div className="bg-[#141a14] border border-[#1e2e1e] rounded-xl p-3">
              <p className="text-gray-500 text-xs">Pending</p>
              <p className="text-amber-400 font-bold text-xl">{pending.length}</p>
            </div>
          </div>
        </div>

        {/* My Connections */}
        {connected.length > 0 && (
          <div className="p-4 border-b border-[#1e2e1e]">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">My Connections</h3>
            <div className="space-y-2">
              {connected.map(p => {
                const initials = p.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPerson(p)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-[#141a14] rounded-lg transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-[#2d5a27] rounded-full flex items-center justify-center text-xs font-bold text-[#4ade80] flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{p.displayName}</p>
                      <p className="text-gray-500 text-xs truncate">{p.title || "Member"}</p>
                    </div>
                    <div className="w-2 h-2 bg-[#4ade80] rounded-full flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Market Activity */}
        <div className="p-4">
          <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Platform Stats</h3>
          <div className="space-y-2">
            {[
              { label: "Active Listings", value: String(listingCount), icon: <TrendingUp size={12} />, color: "text-[#4ade80]" },
              { label: "Members", value: String(users.length + 1), icon: <Network size={12} />, color: "text-blue-400" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between bg-[#141a14] border border-[#1e2e1e] rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={item.color}>{item.icon}</span>
                  <span className="text-gray-400 text-xs">{item.label}</span>
                </div>
                <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1e2e1e] bg-[#0d1410] flex-shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#141a14] border border-[#1e2e1e] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#2d5a27] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-500" />
            <span className="text-gray-500 text-xs">{filtered.length} members</span>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* People Grid */}
          <div className={`flex-1 overflow-y-auto p-6 ${selectedPerson ? "max-w-xl" : ""}`}>
            <div className="mb-4">
              <h2 className="text-white font-bold text-xl">Members</h2>
              <p className="text-gray-500 text-sm mt-1">{filtered.length} people on the platform</p>
            </div>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <Network size={32} className="text-gray-700" />
                <p className="text-gray-500 text-sm">
                  {users.length === 0 ? "No other members yet. Invite others to join!" : "No members match your search"}
                </p>
              </div>
            ) : (
              <div className={`grid gap-4 ${selectedPerson ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2"}`}>
                {filtered.map(person => {
                  const initials = person.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                  const isConnected = connectedIds.has(person.id);
                  const isPending = pendingIds.has(person.id);
                  return (
                    <div
                      key={person.id}
                      onClick={() => setSelectedPerson(selectedPerson?.id === person.id ? null : person)}
                      className={`cursor-pointer rounded-xl border transition-all duration-200 p-5 ${
                        selectedPerson?.id === person.id
                          ? "bg-[#1a2e1a] border-[#4ade80]/50 shadow-lg shadow-[#4ade80]/5"
                          : "bg-[#141a14] border-[#1e2e1e] hover:border-[#2a3a2a]"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 bg-gradient-to-br from-[#2d5a27] to-[#1a3a1a] rounded-2xl flex items-center justify-center text-lg font-bold text-[#4ade80] shadow-lg shadow-green-900/20">
                            {initials}
                          </div>
                          {isConnected && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#4ade80] rounded-full flex items-center justify-center border-2 border-[#141a14]">
                              <Check size={10} className="text-black" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-sm">{person.displayName}</h3>
                          {person.title && <p className="text-[#4ade80] text-xs font-medium">{person.title}</p>}
                          {person.company && <p className="text-gray-500 text-xs">{person.company}</p>}

                          <div className="flex items-center justify-between mt-3">
                            <span className="text-gray-600 text-xs">{person.email}</span>
                            <button
                              onClick={e => { e.stopPropagation(); handleConnect(person.id); }}
                              disabled={isConnected || isPending}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                isConnected
                                  ? "bg-[#1e3a1e] text-[#4ade80] cursor-default"
                                  : isPending
                                  ? "bg-[#2a3a2a] text-amber-400 cursor-default"
                                  : "bg-[#2d5a27] hover:bg-[#3a7232] text-white"
                              }`}
                            >
                              {isConnected ? <><Check size={12} /> Connected</> :
                               isPending ? <><Clock size={12} /> Pending</> :
                               <><UserPlus size={12} /> Connect</>}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Person Detail - sidebar on desktop, overlay on mobile */}
          {selectedPerson && (
            <div className="fixed inset-0 z-40 bg-black/60 md:relative md:inset-auto md:z-auto md:bg-transparent flex justify-end" onClick={() => setSelectedPerson(null)}>
            <div className="w-[85%] max-w-sm md:w-80 border-l border-[#1e2e1e] bg-[#0d1410] overflow-y-auto p-6 flex-shrink-0 h-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold">Profile</h3>
                <button onClick={() => setSelectedPerson(null)} className="text-gray-500 hover:text-gray-300 transition-colors">
                  <ExternalLink size={16} />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#2d5a27] to-[#1a3a1a] rounded-3xl flex items-center justify-center text-2xl font-bold text-[#4ade80] mx-auto mb-3 shadow-xl shadow-green-900/30">
                  {selectedPerson.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <h3 className="text-white font-bold text-lg">{selectedPerson.displayName}</h3>
                {selectedPerson.title && <p className="text-[#4ade80] text-sm font-medium">{selectedPerson.title}</p>}
                {selectedPerson.company && <p className="text-gray-500 text-sm">{selectedPerson.company}</p>}
                <p className="text-gray-600 text-xs mt-1">{selectedPerson.email}</p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleConnect(selectedPerson.id)}
                  disabled={connectedIds.has(selectedPerson.id) || pendingIds.has(selectedPerson.id)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors ${
                    connectedIds.has(selectedPerson.id)
                      ? "bg-[#1e3a1e] text-[#4ade80] cursor-default border border-[#2d5a27]"
                      : pendingIds.has(selectedPerson.id)
                      ? "bg-[#2a3a2a] text-amber-400 cursor-default"
                      : "bg-[#2d5a27] hover:bg-[#3a7232] text-white"
                  }`}
                >
                  {connectedIds.has(selectedPerson.id) ? <><Check size={16} /> Connected</> :
                   pendingIds.has(selectedPerson.id) ? <><Clock size={16} /> Request Pending</> :
                   <><UserPlus size={16} /> Connect</>}
                </button>
                <button
                  onClick={() => handleMessage(selectedPerson)}
                  className="w-full flex items-center justify-center gap-2 bg-[#141a14] hover:bg-[#1a241a] border border-[#2a3a2a] text-gray-300 py-3 rounded-xl font-semibold text-sm transition-colors"
                >
                  <MessageSquare size={16} /> Send Message
                </button>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
