import { Cpu, Store, Mail, FileText } from "lucide-react";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "chat", label: "Chat", icon: Cpu },
  { id: "marketplace", label: "Market", icon: Store },
  { id: "messaging", label: "Messages", icon: Mail },
  { id: "notes", label: "Notes", icon: FileText },
];

export default function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <div className="bg-dark-800/90 border-t border-dark-500/40 shrink-0 backdrop-blur-panel">
      <div className="flex items-center justify-around h-14 safe-bottom">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${
                isActive ? "text-accent-400" : "text-dark-200"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? "bg-accent-900/40" : ""
                }`}
              >
                <item.icon
                  size={18}
                  className={
                    isActive ? "text-accent-400" : "text-dark-200"
                  }
                />
              </div>
              <span
                className={`text-[8px] font-mono mt-0.5 ${
                  isActive ? "text-accent-300" : "text-dark-300"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-5 h-0.5 rounded-full bg-accent-500/60" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
