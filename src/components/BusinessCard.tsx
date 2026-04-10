import { MapPin, TrendingUp, Users, Calendar, ExternalLink, Building2, ChevronRight } from "lucide-react";
import { Business } from "../lib/mockData";

interface BusinessCardProps {
  business: Business;
  isSelected: boolean;
  onClick: () => void;
}

const statusConfig = {
  "Active": { dot: "bg-[#4ade80]", text: "text-[#4ade80]", bg: "bg-[#4ade80]/10" },
  "Under LOI": { dot: "bg-amber-400", text: "text-amber-400", bg: "bg-amber-400/10" },
  "Acquired": { dot: "bg-blue-400", text: "text-blue-400", bg: "bg-blue-400/10" },
  "Seeking Capital": { dot: "bg-violet-400", text: "text-violet-400", bg: "bg-violet-400/10" },
};

const sectorColors: Record<string, string> = {
  "Technology": "text-[#4ade80] bg-[#4ade80]/10",
  "Healthcare": "text-emerald-400 bg-emerald-400/10",
  "Financial Services": "text-lime-400 bg-lime-400/10",
  "Industrials": "text-green-300 bg-green-300/10",
  "Transportation": "text-teal-400 bg-teal-400/10",
  "Energy": "text-amber-400 bg-amber-400/10",
  "Real Estate": "text-blue-400 bg-blue-400/10",
  "Biotechnology": "text-purple-400 bg-purple-400/10",
};

export default function BusinessCard({ business, isSelected, onClick }: BusinessCardProps) {
  const status = statusConfig[business.status] || statusConfig["Active"];
  const sectorColor = sectorColors[business.sector] || "text-[#4ade80] bg-[#4ade80]/10";
  const growthPositive = business.yoyGrowth.startsWith("+");

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded-xl border transition-all duration-200 p-4 ${
        isSelected
          ? "bg-[#1a2e1a] border-[#4ade80]/50 shadow-lg shadow-[#4ade80]/5"
          : "bg-[#141a14] border-[#1e2e1e] hover:border-[#2a3a2a] hover:bg-[#171f17]"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className="w-11 h-11 bg-[#2d5a27] rounded-xl flex items-center justify-center text-sm font-bold text-[#4ade80] flex-shrink-0 shadow-lg shadow-green-900/20">
          {business.logo}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-white font-semibold text-sm leading-tight truncate group-hover:text-[#4ade80] transition-colors">
                {business.name}
              </h3>
              <p className="text-gray-500 text-xs mt-0.5">{business.industry}</p>
            </div>
            <ChevronRight size={14} className={`text-gray-600 flex-shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5 ${isSelected ? "text-[#4ade80]" : ""}`} />
          </div>

          {/* Status & Sector */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {business.status}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sectorColor}`}>
              {business.sector}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="bg-[#1a241a] rounded-lg p-2">
          <p className="text-gray-600 text-xs">Revenue</p>
          <p className="text-white font-bold text-sm">{business.revenue}</p>
        </div>
        <div className="bg-[#1a241a] rounded-lg p-2">
          <p className="text-gray-600 text-xs">EBITDA</p>
          <p className="text-white font-bold text-sm">{business.ebitda}</p>
        </div>
        <div className="bg-[#1a241a] rounded-lg p-2">
          <p className="text-gray-600 text-xs">Ask</p>
          <p className="text-[#4ade80] font-bold text-sm">{business.askingPrice}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1e2e1e]">
        <div className="flex items-center gap-1 text-gray-500 text-xs">
          <MapPin size={11} />
          <span>{business.location}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Users size={11} className="text-gray-600" />
            <span className="text-gray-500 text-xs">{business.employees.toLocaleString()}</span>
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium ${growthPositive ? "text-[#4ade80]" : "text-red-400"}`}>
            <TrendingUp size={11} />
            {business.yoyGrowth}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BusinessDetailPanel({ business, onClose }: { business: Business; onClose: () => void }) {
  const status = statusConfig[business.status] || statusConfig["Active"];
  const growthPositive = business.yoyGrowth.startsWith("+");

  return (
    <div className="h-full overflow-y-auto bg-[#0d1410] p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#2d5a27] rounded-xl flex items-center justify-center text-lg font-bold text-[#4ade80] shadow-lg shadow-green-900/30">
            {business.logo}
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">{business.name}</h2>
            <p className="text-gray-400 text-sm">{business.industry} · {business.location}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {business.status}
              </span>
              <span className="text-gray-600 text-xs">{business.dealType}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
          <ExternalLink size={18} />
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: "Revenue", value: business.revenue, color: "text-white" },
          { label: "EBITDA", value: business.ebitda, color: "text-white" },
          { label: "Asking Price", value: business.askingPrice, color: "text-[#4ade80]" },
          { label: "Gross Margin", value: business.grossMargin, color: "text-white" },
          { label: "YoY Growth", value: business.yoyGrowth, color: growthPositive ? "text-[#4ade80]" : "text-red-400" },
          { label: "Employees", value: business.employees.toLocaleString(), color: "text-white" },
        ].map(m => (
          <div key={m.label} className="bg-[#141a14] border border-[#1e2e1e] rounded-xl p-3">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{m.label}</p>
            <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="bg-[#141a14] border border-[#1e2e1e] rounded-xl p-4 mb-4">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Business Overview</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{business.description}</p>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <h3 className="text-gray-500 text-xs uppercase tracking-wider mb-2">Key Attributes</h3>
        <div className="flex flex-wrap gap-2">
          {business.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-[#1e3a1e] text-[#4ade80] text-xs rounded-full border border-[#2a4a2a]">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-[#141a14] border border-[#1e2e1e] rounded-xl p-4 mb-4">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Company Details</h3>
        <div className="space-y-2">
          {[
            { icon: <Building2 size={14} />, label: "Sector", value: business.sector },
            { icon: <MapPin size={14} />, label: "HQ", value: business.location },
            { icon: <Calendar size={14} />, label: "Founded", value: business.founded },
            { icon: <Users size={14} />, label: "Employees", value: business.employees.toLocaleString() },
            { icon: <ExternalLink size={14} />, label: "Website", value: business.website },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-gray-600">{item.icon}</span>
              <span className="text-gray-500 text-sm w-20">{item.label}</span>
              <span className="text-gray-300 text-sm">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-[#141a14] border border-[#1e2e1e] rounded-xl p-4 mb-4">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Listed By</h3>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2d5a27] rounded-full flex items-center justify-center text-sm font-bold text-[#4ade80]">
            {business.ownerAvatar}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{business.ownerName}</p>
            <p className="text-gray-500 text-xs">{business.ownerTitle}</p>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-2">
        <button className="w-full bg-[#2d5a27] hover:bg-[#3a7232] text-white font-semibold py-3 rounded-xl transition-colors text-sm">
          Request CIM / NDА
        </button>
        <button className="w-full bg-[#141a14] hover:bg-[#1a241a] border border-[#2a3a2a] text-gray-300 font-semibold py-3 rounded-xl transition-colors text-sm">
          Message Owner
        </button>
      </div>
    </div>
  );
}
