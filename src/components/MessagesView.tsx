import { useState, useRef, useEffect } from "react";
import { Send, Search, MoreVertical, Phone, Video, Building2, ArrowLeft } from "lucide-react";
import { conversations, messageHistory, Conversation, Message } from "../lib/mockData";
import { formatDistanceToNow } from "date-fns";

export default function MessagesView() {
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(messageHistory);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvo, messages]);

  const filteredConvos = conversations.filter(c =>
    c.participantNames.some(n => n.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.businessName?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sendMessage = () => {
    if (!newMessage.trim() || !activeConvo) return;
    const msg: Message = {
      id: `m_${Date.now()}`,
      conversationId: activeConvo.id,
      senderId: "user",
      senderName: "You",
      senderAvatar: "U",
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: true
    };
    setMessages(prev => ({
      ...prev,
      [activeConvo.id]: [...(prev[activeConvo.id] || []), msg]
    }));
    setNewMessage("");
  };

  const totalUnread = conversations.reduce((acc, c) => acc + c.unread, 0);

  const otherParticipant = (c: Conversation) => {
    const idx = c.participants.indexOf("user");
    const otherIdx = idx === 0 ? 1 : 0;
    return {
      name: c.participantNames[otherIdx],
      avatar: c.participantAvatars[otherIdx]
    };
  };

  const currentMessages = activeConvo ? (messages[activeConvo.id] || []) : [];

  const showList = !isMobile || !activeConvo;
  const showChat = !isMobile || activeConvo;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversations Sidebar */}
      {showList && (
        <div className={`${isMobile ? "w-full" : "w-80"} flex flex-col border-r border-[#1e2e1e] bg-[#0d1410]`}>
          {/* Header */}
          <div className="p-4 border-b border-[#1e2e1e]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold text-lg">Messages</h2>
              {totalUnread > 0 && (
                <span className="bg-[#4ade80] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalUnread} new
                </span>
              )}
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

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <p className="text-gray-500 text-sm">No conversations found</p>
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
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 bg-[#2d5a27] rounded-full flex items-center justify-center text-sm font-bold text-[#4ade80]">
                        {other.avatar}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#4ade80] rounded-full border-2 border-[#0d1410]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold text-sm ${convo.unread > 0 ? "text-white" : "text-gray-300"}`}>
                          {other.name}
                        </span>
                        <span className="text-gray-600 text-xs flex-shrink-0">
                          {formatDistanceToNow(new Date(convo.lastMessageTime), { addSuffix: true })}
                        </span>
                      </div>
                      {convo.businessName && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Building2 size={10} className="text-[#4ade80]" />
                          <span className="text-[#4ade80] text-xs truncate">{convo.businessName}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs truncate max-w-44 ${convo.unread > 0 ? "text-gray-300" : "text-gray-600"}`}>
                          {convo.lastMessage}
                        </p>
                        {convo.unread > 0 && (
                          <span className="w-5 h-5 bg-[#4ade80] text-black text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                            {convo.unread}
                          </span>
                        )}
                      </div>
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
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2e1e] bg-[#0d1410]">
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
                  <button className="p-2 text-gray-500 hover:text-gray-300 hover:bg-[#1a241a] rounded-lg transition-colors">
                    <Phone size={16} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-300 hover:bg-[#1a241a] rounded-lg transition-colors">
                    <Video size={16} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-300 hover:bg-[#1a241a] rounded-lg transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {currentMessages.map((msg) => {
                  const isMe = msg.senderId === "user";
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
                        <span className="text-gray-600 text-xs">
                          {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[#1e2e1e] bg-[#0d1410]">
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
