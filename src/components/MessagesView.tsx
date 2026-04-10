import { useState, useRef, useEffect } from "react";
import { Send, Search, MoreVertical, Phone, Video, Building2, ArrowLeft, MessageSquare } from "lucide-react";
import { Conversation, Message } from "../lib/mockData";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { subscribeToConversations, subscribeToMessages, sendMessageToFirestore } from "../lib/firestore";
import { formatDistanceToNow } from "date-fns";

interface MessagesViewProps {
  pendingConvoId: string | null;
  clearPendingConvo: () => void;
}

export default function MessagesView({ pendingConvoId, clearPendingConvo }: MessagesViewProps) {
  const { currentUser, userProfile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // responsive check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // subscribe to conversations
  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToConversations(currentUser.uid, setConversations);
    return unsub;
  }, [currentUser]);

  // handle pending conversation navigation (from "Message Owner")
  useEffect(() => {
    if (pendingConvoId && conversations.length > 0) {
      const found = conversations.find(c => c.id === pendingConvoId);
      if (found) {
        setActiveConvo(found);
        clearPendingConvo();
      }
    }
  }, [pendingConvoId, conversations, clearPendingConvo]);

  // subscribe to messages for active conversation
  useEffect(() => {
    if (!activeConvo) { setMessages([]); return; }
    const unsub = subscribeToMessages(activeConvo.id, setMessages);
    return unsub;
  }, [activeConvo]);

  // auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredConvos = conversations.filter(c =>
    c.participantNames.some(n => n.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.businessName?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  async function sendMessage() {
    if (!newMessage.trim() || !activeConvo || !currentUser || !userProfile) return;
    const initials = userProfile.displayName
      .split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    try {
      await sendMessageToFirestore(
        activeConvo.id,
        currentUser.uid,
        userProfile.displayName,
        initials,
        newMessage.trim()
      );
    } catch (err) {
      console.error("Failed to send message:", err);
    }
    setNewMessage("");
  }

  const otherParticipant = (c: Conversation) => {
    if (!currentUser) return { name: c.participantNames[1] || "User", avatar: c.participantAvatars[1] || "U" };
    const idx = c.participants.indexOf(currentUser.uid);
    const otherIdx = idx === 0 ? 1 : 0;
    return {
      name: c.participantNames[otherIdx] || "User",
      avatar: c.participantAvatars[otherIdx] || "U",
    };
  };

  // not logged in
  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-[#1a241a] rounded-2xl flex items-center justify-center">
          <MessageSquare size={28} className="text-[#4ade80]" />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold mb-1">Sign in to view messages</p>
          <p className="text-gray-500 text-sm mb-4">You need an account to send and receive messages</p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-[#2d5a27] hover:bg-[#3a7232] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Sign In
          </button>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  const showList = !isMobile || !activeConvo;
  const showChat = !isMobile || activeConvo;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversations Sidebar */}
      {showList && (
        <div className={`${isMobile ? "w-full" : "w-80"} flex flex-col border-r border-[#1e2e1e] bg-[#0d1410] overflow-hidden`}>
          {/* Header */}
          <div className="p-4 border-b border-[#1e2e1e] flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold text-lg">Messages</h2>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#141a14] border border-[#1e2e1e] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#2d5a27] transition-colors"
              />
            </div>
          </div>

          {/* Conversation List - scrollable */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <p className="text-gray-500 text-sm">
                  {conversations.length === 0 ? "No conversations yet" : "No conversations found"}
                </p>
                {conversations.length === 0 && (
                  <p className="text-gray-600 text-xs">Message a listing owner to start a conversation</p>
                )}
              </div>
            ) : (
              filteredConvos.map(convo => {
                const other = otherParticipant(convo);
                const isActive = activeConvo?.id === convo.id;
                return (
                  <button
                    key={convo.id}
                    onClick={() => setActiveConvo(convo)}
                    className={`w-full flex items-start gap-3 px-4 py-4 border-b border-[#1e2e1e] text-left transition-colors ${
                      isActive ? "bg-[#1a2e1a]" : "hover:bg-[#141a14]"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 bg-[#2d5a27] rounded-full flex items-center justify-center text-sm font-bold text-[#4ade80]">
                        {other.avatar}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#4ade80] rounded-full border-2 border-[#0d1410]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-300">{other.name}</span>
                        {convo.lastMessageTime && (
                          <span className="text-gray-600 text-xs flex-shrink-0">
                            {formatDistanceToNow(new Date(convo.lastMessageTime), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      {convo.businessName && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Building2 size={10} className="text-[#4ade80]" />
                          <span className="text-[#4ade80] text-xs truncate">{convo.businessName}</span>
                        </div>
                      )}
                      {convo.lastMessage && (
                        <p className="text-xs truncate max-w-44 text-gray-600 mt-1">{convo.lastMessage}</p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Chat Area */}
      {showChat && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a1208]">
          {activeConvo ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2e1e] bg-[#0d1410] flex-shrink-0">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <button onClick={() => setActiveConvo(null)} className="text-gray-400 hover:text-gray-200 mr-1">
                      <ArrowLeft size={20} />
                    </button>
                  )}
                  <div className="relative">
                    <div className="w-10 h-10 bg-[#2d5a27] rounded-full flex items-center justify-center text-sm font-bold text-[#4ade80]">
                      {otherParticipant(activeConvo).avatar}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#4ade80] rounded-full border-2 border-[#0d1410]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{otherParticipant(activeConvo).name}</p>
                    {activeConvo.businessName && (
                      <div className="flex items-center gap-1">
                        <Building2 size={10} className="text-[#4ade80]" />
                        <span className="text-[#4ade80] text-xs">{activeConvo.businessName}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert("Voice calls coming soon!")}
                    className="p-2 text-gray-500 hover:text-gray-300 hover:bg-[#1a241a] rounded-lg transition-colors"
                  >
                    <Phone size={16} />
                  </button>
                  <button
                    onClick={() => alert("Video calls coming soon!")}
                    className="p-2 text-gray-500 hover:text-gray-300 hover:bg-[#1a241a] rounded-lg transition-colors"
                  >
                    <Video size={16} />
                  </button>
                  <button
                    onClick={() => alert("More options coming soon!")}
                    className="p-2 text-gray-500 hover:text-gray-300 hover:bg-[#1a241a] rounded-lg transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Messages - scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 gap-2">
                    <p className="text-gray-500 text-sm">No messages yet. Say hello!</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.uid;
                  return (
                    <div key={msg.id} className={`flex items-end gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isMe ? "bg-[#2d5a27] text-[#4ade80]" : "bg-[#1e3a1e] text-[#4ade80]"
                      }`}>
                        {msg.senderAvatar}
                      </div>
                      <div className={`max-w-xs lg:max-w-md ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? "bg-[#2d5a27] text-white rounded-br-sm"
                            : "bg-[#1a241a] border border-[#2a3a2a] text-gray-200 rounded-bl-sm"
                        }`}>
                          {msg.text}
                        </div>
                        {msg.timestamp && (
                          <span className="text-gray-600 text-xs">
                            {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input - fixed at bottom */}
              <div className="p-4 border-t border-[#1e2e1e] bg-[#0d1410] flex-shrink-0">
                <div className="flex items-center gap-3 bg-[#141a14] border border-[#1e2e1e] rounded-xl px-4 py-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="w-8 h-8 bg-[#2d5a27] hover:bg-[#3a7232] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-[#1a241a] rounded-2xl flex items-center justify-center">
                <Send size={28} className="text-[#4ade80]" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold mb-1">Your Messages</p>
                <p className="text-gray-500 text-sm">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
