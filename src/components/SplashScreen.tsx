import { useEffect, useState } from "react";
import { Building2, TrendingUp, Network, Shield, ChevronRight, BarChart3, Globe } from "lucide-react";

interface SplashScreenProps {
  onEnter: () => void;
}

const stats = [
  { label: "Active Listings", value: "$1.4B+", sub: "in deal flow" },
  { label: "Verified Investors", value: "2,400+", sub: "institutional & family office" },
  { label: "Avg. Time to LOI", value: "47 days", sub: "vs. 180 industry avg" },
];

const features = [
  {
    icon: <Building2 size={20} />,
    title: "Business Marketplace",
    desc: "Browse 1,400+ verified business listings with full financial profiles, maps, and deal terms"
  },
  {
    icon: <Network size={20} />,
    title: "Investor Network",
    desc: "Connect with MDs, CIOs, and family office principals from the world's top PE firms"
  },
  {
    icon: <TrendingUp size={20} />,
    title: "Portfolio Intelligence",
    desc: "Track your holdings, monitor performance, and get AI-powered market insights"
  },
  {
    icon: <Shield size={20} />,
    title: "Secure & Confidential",
    desc: "Bank-grade security with NDA management, watermarked CIMs, and audit trails"
  },
];

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  const [visible, setVisible] = useState(false);
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    const interval = setInterval(() => {
      setLineCount(n => Math.min(n + 1, 8));
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] bg-[#060e06] flex flex-col overflow-hidden transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
      {/* Animated Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(74, 222, 128, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74, 222, 128, 0.04) 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }} />
        {/* Animated scan lines */}
        {Array.from({ length: lineCount }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4ade80]/20 to-transparent"
            style={{
              top: `${10 + i * 12}%`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#4ade80]/20" />
        <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[#4ade80]/20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-[#4ade80]/20" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#4ade80]/20" />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#4ade80]/3 blur-3xl" />
      </div>

      {/* Nav bar */}
      <div className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-[#1a2a1a]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2d5a27] rounded-xl flex items-center justify-center shadow-lg shadow-green-900/40">
            <Building2 size={18} className="text-[#4ade80]" />
          </div>
          <span className="text-xl font-bold text-white tracking-[0.2em]">ARCHALEON</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-xs">
          <Globe size={12} />
          <span>Private & Institutional Access Only</span>
        </div>
      </div>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Badge */}
        <div className="flex items-center gap-2 bg-[#1a2a1a] border border-[#2a4a2a] rounded-full px-4 py-2 mb-8">
          <div className="w-1.5 h-1.5 bg-[#4ade80] rounded-full animate-pulse" />
          <span className="text-[#4ade80] text-xs font-medium tracking-wider">INSTITUTIONAL GRADE DEAL INTELLIGENCE</span>
        </div>

        <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4 leading-tight tracking-tight">
          Private Markets.<br />
          <span className="text-[#4ade80]">Reimagined.</span>
        </h1>

        <p className="text-gray-400 text-lg lg:text-xl max-w-2xl mb-10 leading-relaxed">
          The first institutional-grade marketplace for private business acquisitions.
          Discover verified deals, connect with top investors, and close faster.
        </p>

        {/* Stats */}
        <div className="flex items-center gap-8 mb-12">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-[#4ade80] font-bold text-2xl lg:text-3xl">{s.value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={onEnter}
            className="group flex items-center gap-3 bg-[#2d5a27] hover:bg-[#3a7232] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-green-900/30 hover:shadow-green-900/50 text-lg"
          >
            <BarChart3 size={20} />
            Access Deal Flow
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onEnter}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-200 font-medium px-6 py-4 transition-colors"
          >
            List Your Business <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Features Row */}
      <div className="relative z-10 border-t border-[#1a2a1a] bg-[#0d1410]/80 backdrop-blur-sm">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#1a2a1a]">
          {features.map(f => (
            <div key={f.title} className="flex items-start gap-3 px-6 py-5">
              <div className="text-[#4ade80] mt-0.5 flex-shrink-0">{f.icon}</div>
              <div>
                <p className="text-white font-semibold text-sm mb-0.5">{f.title}</p>
                <p className="text-gray-600 text-xs leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
