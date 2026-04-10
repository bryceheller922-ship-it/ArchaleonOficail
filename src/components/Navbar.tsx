import { useState } from "react";
import { Building2, Search, Bell, ChevronDown, LogOut, User, Settings, MessageSquare, Network, LayoutGrid, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

type Tab = "listings" | "messages" | "network" | "portfolio";

interface NavbarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  totalUnread: number;
}

export default function Navbar({ activeTab, setActiveTab, searchQuery, setSearchQuery, totalUnread }: NavbarProps) {
  const { currentUser, userProfile, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "listings", label: "Deal Flow", icon: <LayoutGrid size={16} /> },
    { id: "network", label: "Network", icon: <Network size={16} /> },
    { id: "messages", label: "Messages", icon: <MessageSquare size={16} /> },
    { id: "portfolio", label: "Portfolio", icon: <Building2 size={16} /> },
  ];

  const initials = userProfile?.displayName
    ? userProfile.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0d1410]/95 backdrop-blur-md border-b border-[#1e2e1e]">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0 cursor-pointer" onClick={() => setActiveTab("listings")}>
            <div className="w-8 h-8 bg-[#2d5a27] rounded-lg flex items-center justify-center shadow-lg shadow-green-900/30">
              <Building2 size={16} className="text-[#4ade80]" />
            </div>
            <span className="text-lg font-bold text-white tracking-[0.2em] hidden sm:block">ARCHALEON</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:flex">
            <div className="relative w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search companies, sectors, regions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#141a14] border border-[#1e2e1e] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#2d5a27] transition-colors"
              />
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                  activeTab === item.id
                    ? "bg-[#1e3a1e] text-[#4ade80]"
                    : "text-gray-400 hover:text-gray-200 hover:bg-[#141a14]"
                }`}
              >
                {item.icon}
                {item.label}
                {item.id === "messages" && totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#4ade80] text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {totalUnread}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 ml-4">
            {/* Notifications */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#4ade80] rounded-full"></span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#141a14] border border-[#2a3a2a] rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 border-b border-[#2a3a2a]">
                    <p className="text-white font-semibold text-sm">Notifications</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-gray-500 text-sm">No new notifications</p>
                  </div>
                </div>
              )}
            </div>

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-[#1a241a] hover:bg-[#1e2e1e] border border-[#2a3a2a] rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="w-7 h-7 bg-[#2d5a27] rounded-full flex items-center justify-center text-xs font-bold text-[#4ade80]">
                    {initials}
                  </div>
                  <span className="text-sm text-gray-300 hidden sm:block max-w-24 truncate">
                    {userProfile?.displayName || "User"}
                  </span>
                  <ChevronDown size={14} className="text-gray-500 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#141a14] border border-[#2a3a2a] rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-3 border-b border-[#2a3a2a]">
                      <p className="text-white font-medium text-sm truncate">{userProfile?.displayName}</p>
                      <p className="text-gray-500 text-xs truncate">{userProfile?.title || ""}</p>
                      <p className="text-gray-600 text-xs truncate">{userProfile?.company || ""}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => { alert("Profile settings coming soon!"); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#1a241a] rounded-lg transition-colors"
                      >
                        <User size={14} /> Profile
                      </button>
                      <button
                        onClick={() => { alert("Settings coming soon!"); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#1a241a] rounded-lg transition-colors"
                      >
                        <Settings size={14} /> Settings
                      </button>
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[#1a241a] rounded-lg transition-colors"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="bg-[#2d5a27] hover:bg-[#3a7232] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-[#1e2e1e] bg-[#0d1410] p-3 space-y-1">
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#141a14] border border-[#1e2e1e] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none"
              />
            </div>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setShowMobileMenu(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id ? "bg-[#1e3a1e] text-[#4ade80]" : "text-gray-400 hover:bg-[#141a14]"
                }`}
              >
                {item.icon}
                {item.label}
                {item.id === "messages" && totalUnread > 0 && (
                  <span className="ml-auto w-5 h-5 bg-[#4ade80] text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {totalUnread}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showUserMenu && <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />}
      {showNotifications && <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />}
    </>
  );
}
