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
    <div className="bg-dark-800 border-t border-dark-500 shrink-0">
      <div className="flex items-center justify-around h-14 safe-bottom">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                isActive ? "text-accent-400" : "text-dark-200"
              }`}
            >
              <item.icon size={20} className={isActive ? "text-accent-400" : "text-dark-200"} />
              <span className={`text-[9px] font-mono mt-1 ${isActive ? "text-accent-300" : "text-dark-200"}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-6 h-0.5 rounded-full bg-accent-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
