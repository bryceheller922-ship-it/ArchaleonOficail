import { useAuth } from "@/contexts/AuthContext";
import {
  Store,
  Mail,
  FileText,
  LogOut,
  Cpu,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "chat", label: "AI Chat", icon: Cpu, description: "Agent & Browsing" },
  { id: "marketplace", label: "Marketplace", icon: Store, description: "Business Listings" },
  { id: "messaging", label: "Messages", icon: Mail, description: "Conversations" },
  { id: "notes", label: "Notes", icon: FileText, description: "Projects & Docs" },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { signOut, profile } = useAuth();

  return (
    <div className="w-64 bg-dark-800/90 border-r border-dark-500/50 flex flex-col h-full shrink-0 backdrop-blur-panel">
      {/* Logo */}
      <div className="p-4 border-b border-dark-500/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="https://www.dropbox.com/scl/fi/3ounjvat1paeuma0ksbv8/ChatGPT_Image_Mar_19__2026__12_15_28_AM-removebg-preview.png?rlkey=dyz1ot9ozdai0q671z6vg9hyh&st=rzw374b1&raw=1"
              alt="Archaleon"
              className="w-9 h-9 opacity-90"
            />
            <div className="absolute -inset-1 rounded-full bg-accent-500/10 blur-md" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white-text font-mono tracking-[0.15em]">
              ARCHALEON
            </h1>
            <p className="text-[10px] text-dark-200 font-mono">
              v1.0.0
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[9px] text-dark-300 font-mono uppercase tracking-[0.2em] px-3 mb-3">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                isActive
                  ? "bg-accent-900/40 border border-accent-700/40 text-accent-200 shadow-sm"
                  : "text-gray-text hover:bg-dark-600/50 hover:text-light-text border border-transparent"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isActive
                    ? "bg-accent-800/50 border border-accent-700/30"
                    : "bg-dark-600/30 border border-dark-500/30 group-hover:bg-dark-500/30"
                }`}
              >
                <item.icon
                  size={14}
                  className={
                    isActive
                      ? "text-accent-400"
                      : "text-dark-200 group-hover:text-gray-text"
                  }
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium font-mono block">
                  {item.label}
                </span>
                <span
                  className={`text-[9px] font-mono ${
                    isActive ? "text-accent-400/60" : "text-dark-300"
                  }`}
                >
                  {item.description}
                </span>
              </div>
              {isActive && (
                <ChevronRight
                  size={14}
                  className="text-accent-500/60"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-dark-500/50">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-600/30 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-accent-900/30 flex items-center justify-center text-xs font-mono text-accent-400 border border-accent-800/30">
            {profile?.displayName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-light-text font-mono truncate">
              {profile?.displayName || "User"}
            </p>
            <p className="text-[9px] text-dark-300 font-mono">
              {profile?.credits ?? 100} credits
            </p>
          </div>
          <button
            onClick={signOut}
            className="text-dark-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-dark-600/30"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
