import { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ListingsView from "./components/ListingsView";
import MessagesView from "./components/MessagesView";
import NetworkView from "./components/NetworkView";
import PortfolioView from "./components/PortfolioView";
import SplashScreen from "./components/SplashScreen";
import CreateListingPage from "./components/CreateListingPage";
import ProfilePage from "./components/ProfilePage";
import { subscribeToConversations } from "./lib/firestore";

// Search context so ListingsView can access the navbar search
const SearchContext = createContext({ searchQuery: "", setSearchQuery: (_q: string) => {} });
export function useSearch() { return useContext(SearchContext); }

/** Layout wrapper: Navbar + full-height content */
function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [totalUnread, setTotalUnread] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) { setTotalUnread(0); return; }
    const unsub = subscribeToConversations(currentUser.uid, (convos) => {
      setTotalUnread(convos.reduce((n, c) => n + (c.unread || 0), 0));
    });
    return unsub;
  }, [currentUser]);

  const path = location.pathname;
  const activeTab = path.startsWith("/messages") ? "messages"
    : path.startsWith("/network") ? "network"
    : path.startsWith("/portfolio") ? "portfolio"
    : "listings";

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a1208]">
        <div className="w-8 h-8 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <div className="h-full flex flex-col bg-[#0a1208] text-white overflow-hidden">
        <Navbar
          activeTab={activeTab as "listings" | "messages" | "network" | "portfolio"}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalUnread={totalUnread}
        />
        <main className="flex-1 min-h-0 mt-16 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </SearchContext.Provider>
  );
}

function AppRoutes() {
  const navigate = useNavigate();

  function navigateToConversation(convoId: string) {
    navigate("/messages", { state: { convoId } });
  }

  return (
    <Routes>
      {/* Onboarding / Landing */}
      <Route path="/" element={
        <SplashScreen
          onEnter={() => navigate("/listings")}
          onListBusiness={() => navigate("/create-listing")}
        />
      } />

      {/* Main pages */}
      <Route path="/listings" element={<AppLayout><ListingsPage navigateToConversation={navigateToConversation} /></AppLayout>} />
      <Route path="/messages" element={<AppLayout><MessagesPage /></AppLayout>} />
      <Route path="/network" element={<AppLayout><NetworkView navigateToConversation={navigateToConversation} /></AppLayout>} />
      <Route path="/portfolio" element={<AppLayout><PortfolioView /></AppLayout>} />

      {/* Dedicated pages */}
      <Route path="/create-listing" element={<AppLayout><CreateListingPage /></AppLayout>} />
      <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ListingsPage({ navigateToConversation }: { navigateToConversation: (id: string) => void }) {
  const { searchQuery } = useSearch();
  return <ListingsView searchQuery={searchQuery} navigateToConversation={navigateToConversation} />;
}

function MessagesPage() {
  const location = useLocation();
  const state = location.state as { convoId?: string } | null;
  const [pendingConvoId, setPendingConvoId] = useState<string | null>(null);

  useEffect(() => {
    if (state?.convoId) {
      setPendingConvoId(state.convoId);
      window.history.replaceState({}, document.title);
    }
  }, [state]);

  return (
    <MessagesView
      pendingConvoId={pendingConvoId}
      clearPendingConvo={() => setPendingConvoId(null)}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
