import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ListingsView from "./components/ListingsView";
import MessagesView from "./components/MessagesView";
import NetworkView from "./components/NetworkView";
import PortfolioView from "./components/PortfolioView";
import SplashScreen from "./components/SplashScreen";
import { subscribeToConversations } from "./lib/firestore";

type Tab = "listings" | "messages" | "network" | "portfolio";

function AppContent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("listings");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);
  const [pendingConvoId, setPendingConvoId] = useState<string | null>(null);

  // subscribe to conversations for unread badge
  useEffect(() => {
    if (!currentUser) { setTotalUnread(0); return; }
    const unsub = subscribeToConversations(currentUser.uid, (convos) => {
      setTotalUnread(convos.reduce((n, c) => n + (c.unread || 0), 0));
    });
    return unsub;
  }, [currentUser]);

  // navigate to a specific conversation in Messages tab
  function navigateToConversation(convoId: string) {
    setPendingConvoId(convoId);
    setActiveTab("messages");
  }

  if (showSplash) {
    return <SplashScreen onEnter={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#0a1208] text-white flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalUnread={totalUnread}
      />

      <main className="flex-1 pt-16 flex flex-col overflow-hidden" style={{ height: "100vh" }}>
        <div className="flex-1 overflow-hidden flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
          {activeTab === "listings" && (
            <ListingsView
              searchQuery={searchQuery}
              navigateToConversation={navigateToConversation}
            />
          )}
          {activeTab === "messages" && (
            <MessagesView
              pendingConvoId={pendingConvoId}
              clearPendingConvo={() => setPendingConvoId(null)}
            />
          )}
          {activeTab === "network" && (
            <NetworkView navigateToConversation={navigateToConversation} />
          )}
          {activeTab === "portfolio" && <PortfolioView />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
