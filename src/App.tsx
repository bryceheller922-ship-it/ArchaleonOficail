import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ListingsView from "./components/ListingsView";
import MessagesView from "./components/MessagesView";
import NetworkView from "./components/NetworkView";
import PortfolioView from "./components/PortfolioView";
import SplashScreen from "./components/SplashScreen";
import { conversations } from "./lib/mockData";

type Tab = "listings" | "messages" | "network" | "portfolio";

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("listings");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSplash, setShowSplash] = useState(true);

  const totalUnread = conversations.reduce((acc, c) => acc + c.unread, 0);

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

      {/* Main Content */}
      <main className="flex-1 pt-16 flex flex-col overflow-hidden" style={{ height: "100vh" }}>
        <div className="flex-1 overflow-hidden flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
          {activeTab === "listings" && <ListingsView searchQuery={searchQuery} />}
          {activeTab === "messages" && <MessagesView />}
          {activeTab === "network" && <NetworkView />}
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
