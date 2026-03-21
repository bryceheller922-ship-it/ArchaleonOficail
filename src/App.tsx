import { useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/pages/AuthPage";
import Layout from "@/components/Layout";
import ChatPage from "@/pages/ChatPage";
import MarketplacePage from "@/pages/MarketplacePage";
import MessagingPage from "@/pages/MessagingPage";
import NotesPage from "@/pages/NotesPage";

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("chat");

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <img
            src="https://www.dropbox.com/scl/fi/3ounjvat1paeuma0ksbv8/ChatGPT_Image_Mar_19__2026__12_15_28_AM-removebg-preview.png?rlkey=dyz1ot9ozdai0q671z6vg9hyh&st=rzw374b1&raw=1"
            alt="Archaleon"
            className="w-16 h-16 mx-auto mb-4 opacity-70 animate-pulse"
          />
          <div className="w-6 h-6 border-2 border-accent-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-dark-200 text-xs font-mono">INITIALIZING ARCHALEON...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case "chat":
        return <ChatPage />;
      case "marketplace":
        return <MarketplacePage />;
      case "messaging":
        return <MessagingPage />;
      case "notes":
        return <NotesPage />;
      default:
        return <ChatPage />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
