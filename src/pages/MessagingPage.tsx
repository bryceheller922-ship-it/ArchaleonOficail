import { useState } from "react";
import { Send, Search, User, Circle, Paperclip, MoreVertical, ChevronLeft } from "lucide-react";

interface MockThread {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatar: string;
}

interface MockMessage {
  id: string;
  senderId: string;
  content: string;
  time: string;
  isMine: boolean;
}

const mockThreads: MockThread[] = [
  {
    id: "t1",
    name: "Tech Ventures LLC",
    lastMessage: "The financials look strong. Can we schedule a call?",
    time: "2m ago",
    unread: 2,
    online: true,
    avatar: "T",
  },
  {
    id: "t2",
    name: "Green Holdings",
    lastMessage: "I've attached the updated P&L statement.",
    time: "1h ago",
    unread: 0,
    online: true,
    avatar: "G",
  },
  {
    id: "t3",
    name: "Pulse Enterprises",
    lastMessage: "Due diligence package is ready for review.",
    time: "3h ago",
    unread: 1,
    online: false,
    avatar: "P",
  },
  {
    id: "t4",
    name: "Core Fitness Group",
    lastMessage: "We can negotiate on the lease terms.",
    time: "1d ago",
    unread: 0,
    online: false,
    avatar: "C",
  },
  {
    id: "t5",
    name: "Forge Creative Inc",
    lastMessage: "Portfolio materials have been sent.",
    time: "2d ago",
    unread: 0,
    online: false,
    avatar: "F",
  },
];

const mockMessages: Record<string, MockMessage[]> = {
  t1: [
    { id: "m1", senderId: "other", content: "Hi, I saw you were interested in CloudSync SaaS Platform.", time: "10:30 AM", isMine: false },
    { id: "m2", senderId: "me", content: "Yes, I'd like to learn more about the customer retention metrics and churn rate.", time: "10:32 AM", isMine: true },
    { id: "m3", senderId: "other", content: "Our monthly churn is under 2%. We have strong annual contracts with enterprise clients. Happy to share the detailed metrics.", time: "10:35 AM", isMine: false },
    { id: "m4", senderId: "me", content: "That's impressive. What about the technology stack? Any technical debt?", time: "10:38 AM", isMine: true },
    { id: "m5", senderId: "other", content: "Built on modern cloud-native architecture. We recently completed a major refactor. The codebase is clean and well-documented.", time: "10:41 AM", isMine: false },
    { id: "m6", senderId: "other", content: "The financials look strong. Can we schedule a call?", time: "10:45 AM", isMine: false },
  ],
  t2: [
    { id: "m1", senderId: "other", content: "Thanks for your interest in GreenLeaf.", time: "9:00 AM", isMine: false },
    { id: "m2", senderId: "me", content: "Can you share the traffic analytics and conversion rates?", time: "9:15 AM", isMine: true },
    { id: "m3", senderId: "other", content: "I've attached the updated P&L statement.", time: "9:30 AM", isMine: false },
  ],
  t3: [
    { id: "m1", senderId: "me", content: "I'd like to proceed with due diligence on DataPulse.", time: "2:00 PM", isMine: true },
    { id: "m2", senderId: "other", content: "Due diligence package is ready for review.", time: "5:00 PM", isMine: false },
  ],
};

export default function MessagingPage() {
  const [selectedThread, setSelectedThread] = useState<MockThread | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [searchQuery, setSearchQuery] = useState("");

  // On mobile: when a thread is selected, show chat; otherwise show thread list
  const isMobileChatView = selectedThread !== null;

  const handleSend = () => {
    if (!messageInput.trim() || !selectedThread) return;
    const newMessage: MockMessage = {
      id: `m${Date.now()}`,
      senderId: "me",
      content: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMine: true,
    };
    setMessages((prev) => ({
      ...prev,
      [selectedThread.id]: [...(prev[selectedThread.id] || []), newMessage],
    }));
    setMessageInput("");
  };

  const currentMessages = selectedThread ? messages[selectedThread.id] || [] : [];

  const filteredThreads = mockThreads.filter(
    (t) =>
      !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectThread = (thread: MockThread) => {
    setSelectedThread(thread);
  };

  const handleBackToList = () => {
    setSelectedThread(null);
  };

  return (
    <div className="flex h-full bg-dark-900">
      {/* ─── Thread List ─── */}
      {/* Desktop: always show. Mobile: only show when no thread selected */}
      <div className={`${
        isMobileChatView ? "hidden" : "flex"
      } md:flex w-full md:w-80 bg-dark-800 md:border-r border-dark-500 flex-col shrink-0`}>
        <div className="p-3 md:p-4 border-b border-dark-500">
          <div className="flex items-center gap-2 mb-3">
            <Send size={16} className="text-accent-500" />
            <h2 className="font-mono text-sm text-light-text">MESSAGES</h2>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-200" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-dark-700 border border-dark-400 rounded pl-9 pr-3 py-2 text-xs font-mono text-light-text placeholder-dark-200 focus:outline-none focus:border-accent-600 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredThreads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => handleSelectThread(thread)}
              className={`w-full text-left p-3 md:p-4 border-b border-dark-600 transition-all duration-200 ${
                selectedThread?.id === thread.id
                  ? "bg-accent-900/30 border-l-2 border-l-accent-600"
                  : "hover:bg-dark-700 border-l-2 border-l-transparent"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-mono shrink-0 ${
                      selectedThread?.id === thread.id
                        ? "bg-accent-800 text-accent-300 border border-accent-700"
                        : "bg-dark-500 text-dark-100 border border-dark-400"
                    }`}
                  >
                    {thread.avatar}
                  </div>
                  {thread.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-500 rounded-full border-2 border-dark-800" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs md:text-sm font-medium text-light-text font-mono truncate">
                      {thread.name}
                    </span>
                    <span className="text-[10px] text-dark-200 font-mono shrink-0 ml-2">
                      {thread.time}
                    </span>
                  </div>
                  <p className="text-[11px] md:text-xs text-dark-100 font-mono truncate">{thread.lastMessage}</p>
                </div>
                {thread.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-accent-600 text-white text-[10px] font-mono flex items-center justify-center shrink-0">
                    {thread.unread}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Chat Area ─── */}
      {/* Desktop: always show. Mobile: only show when thread selected */}
      {selectedThread ? (
        <div className={`${
          !isMobileChatView ? "hidden" : "flex"
        } md:flex flex-1 flex-col`}>
          {/* Chat Header */}
          <div className="h-12 md:h-14 bg-dark-800 border-b border-dark-500 flex items-center px-3 md:px-4 shrink-0">
            {/* Mobile back button */}
            <button
              onClick={handleBackToList}
              className="md:hidden text-dark-200 hover:text-light-text transition-colors p-1 mr-2"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-accent-800 text-accent-300 border border-accent-700 flex items-center justify-center text-xs font-mono">
                {selectedThread.avatar}
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-light-text font-mono">
                  {selectedThread.name}
                </p>
                <p className="text-[10px] text-dark-100 font-mono flex items-center gap-1">
                  {selectedThread.online ? (
                    <>
                      <Circle size={6} fill="#2d6a2d" className="text-accent-500" />
                      Online
                    </>
                  ) : (
                    "Offline"
                  )}
                </p>
              </div>
            </div>
            <div className="flex-1" />
            <button className="text-dark-200 hover:text-light-text transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
            <div className="text-center">
              <span className="text-[10px] text-dark-300 font-mono bg-dark-700 px-3 py-1 rounded-full">
                Today
              </span>
            </div>
            {currentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] md:max-w-md px-3 md:px-4 py-2 md:py-2.5 rounded-lg ${
                    msg.isMine
                      ? "bg-accent-800/60 border border-accent-700/50 text-accent-100"
                      : "bg-dark-700 border border-dark-400 text-light-text"
                  }`}
                >
                  <p className="text-[11px] md:text-xs font-mono leading-relaxed">{msg.content}</p>
                  <p
                    className={`text-[10px] font-mono mt-1 md:mt-1.5 ${
                      msg.isMine ? "text-accent-400" : "text-dark-200"
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-3 md:p-4 bg-dark-800 border-t border-dark-500 safe-bottom">
            <div className="flex gap-2 md:gap-3 items-center">
              <button className="text-dark-200 hover:text-light-text transition-colors shrink-0">
                <Paperclip size={16} />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-dark-700 border border-dark-400 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-xs font-mono text-light-text placeholder-dark-200 focus:outline-none focus:border-accent-600 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!messageInput.trim()}
                className="bg-accent-700 hover:bg-accent-600 text-white-text p-2 md:p-2.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center">
            <User size={48} className="text-dark-400 mx-auto mb-4" />
            <p className="text-dark-200 font-mono text-sm">Select a conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}
