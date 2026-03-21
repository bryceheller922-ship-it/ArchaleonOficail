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
  { id: "chat", label: "Chat", icon: Cpu, description: "AI Agent" },
  { id: "marketplace", label: "Marketplace", icon: Store, description: "Business Listings" },
  { id: "messaging", label: "Messaging", icon: Mail, description: "Conversations" },
  { id: "notes", label: "Notes", icon: FileText, description: "Projects & Notes" },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { signOut, profile } = useAuth();

  return (
    <div className="w-64 md:w-64 bg-dark-800 border-r border-dark-500 flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-dark-500">
        <div className="flex items-center gap-3">
          <img
            src="https://www.dropbox.com/scl/fi/3ounjvat1paeuma0ksbv8/ChatGPT_Image_Mar_19__2026__12_15_28_AM-removebg-preview.png?rlkey=dyz1ot9ozdai0q671z6vg9hyh&st=rzw374b1&raw=1"
            alt="Archaleon"
            className="w-9 h-9 opacity-90"
          />
          <div>
            <h1 className="text-sm font-bold text-white-text font-mono tracking-widest">
              ARCHALEON
            </h1>
            <p className="text-[10px] text-dark-100 font-mono">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[10px] text-dark-200 font-mono uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all duration-200 group ${
                isActive
                  ? "bg-accent-900 border border-accent-700 text-accent-200"
                  : "text-gray-text hover:bg-dark-600 hover:text-light-text border border-transparent"
              }`}
            >
              <item.icon
                size={18}
                className={isActive ? "text-accent-400" : "text-dark-200 group-hover:text-gray-text"}
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium font-mono block">{item.label}</span>
                <span className={`text-[10px] font-mono ${isActive ? "text-accent-300" : "text-dark-200"}`}>
                  {item.description}
                </span>
              </div>
              {isActive && <ChevronRight size={14} className="text-accent-500" />}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-dark-500">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-dark-500 flex items-center justify-center text-xs font-mono text-accent-400 border border-dark-400">
            {profile?.displayName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-light-text font-mono truncate">
              {profile?.displayName || "User"}
            </p>
            <p className="text-[10px] text-dark-200 font-mono">
              {profile?.credits ?? 100} credits
            </p>
          </div>
          <button
            onClick={signOut}
            className="text-dark-200 hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
