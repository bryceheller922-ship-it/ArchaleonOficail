import { type ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-full w-full bg-dark-900 overflow-hidden">
      {/* ═══ DESKTOP: sidebar + content side by side ═══ */}
      <div className="hidden md:flex h-full">
        <div className="shrink-0">
          <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
        </div>
        <main className="flex-1 overflow-hidden relative min-w-0">
          {children}
        </main>
      </div>

      {/* ═══ MOBILE: fixed header, fixed bottom nav, content in between ═══ */}
      <div className="flex md:hidden flex-col h-full">
        {/* Fixed mobile top header */}
        <div className="h-12 bg-dark-800 border-b border-dark-500 flex items-center px-3 shrink-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-dark-100 hover:text-light-text p-2 -ml-1"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <img
            src="https://www.dropbox.com/scl/fi/3ounjvat1paeuma0ksbv8/ChatGPT_Image_Mar_19__2026__12_15_28_AM-removebg-preview.png?rlkey=dyz1ot9ozdai0q671z6vg9hyh&st=rzw374b1&raw=1"
            alt="Archaleon"
            className="w-6 h-6 opacity-90 ml-2"
          />
          <span className="font-mono text-xs text-light-text tracking-widest ml-2">ARCHALEON</span>
        </div>

        {/* Page content — fills space between header and nav */}
        <main className="flex-1 overflow-hidden relative min-w-0 min-h-0">
          {children}
        </main>

        {/* Fixed mobile bottom nav */}
        <MobileNav activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* ═══ Mobile sidebar drawer overlay (works on both but only triggers on mobile) ═══ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 animate-overlayFadeIn"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 animate-slideInLeft z-10">
            <Sidebar
              activeTab={activeTab}
              onTabChange={(tab) => {
                onTabChange(tab);
                setSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
