import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, SlidersHorizontal, Plus, ChevronDown, X, Lock, Map, List } from "lucide-react";
import { Business } from "../lib/mockData";
import BusinessCard, { BusinessDetailModal } from "./BusinessCard";
import MapView from "./MapView";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { subscribeToListings, getOrCreateConversation } from "../lib/firestore";

interface ListingsViewProps {
  searchQuery: string;
  navigateToConversation: (convoId: string) => void;
}

const industries = ["All Industries", "Manufacturing", "Healthcare Technology", "Logistics & Supply Chain", "Fintech", "Clean Energy", "Defense", "Biotechnology", "Commercial Real Estate", "Technology", "Other"];
const dealTypes = ["All Deal Types", "Full Acquisition", "Growth Equity", "Recapitalization", "Partial Stake", "Venture / Growth", "Portfolio Sale"];
const statuses = ["All Statuses", "Active", "Seeking Capital", "Under LOI", "Acquired"];

export default function ListingsView({ searchQuery, navigateToConversation }: ListingsViewProps) {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [filterIndustry, setFilterIndustry] = useState("All Industries");
  const [filterDeal, setFilterDeal] = useState("All Deal Types");
  const [filterStatus, setFilterStatus] = useState("All Statuses");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("valuation");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const unsub = subscribeToListings(setBusinesses);
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    return businesses
      .filter(b => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
          b.name.toLowerCase().includes(q) ||
          b.industry.toLowerCase().includes(q) ||
          b.sector.toLowerCase().includes(q) ||
          b.location.toLowerCase().includes(q) ||
          b.tags.some(t => t.toLowerCase().includes(q));
        const matchesIndustry = filterIndustry === "All Industries" || b.industry === filterIndustry;
        const matchesDeal = filterDeal === "All Deal Types" || b.dealType === filterDeal;
        const matchesStatus = filterStatus === "All Statuses" || b.status === filterStatus;
        return matchesSearch && matchesIndustry && matchesDeal && matchesStatus;
      })
      .sort((a, b) => {
        const parseVal = (v: string) => parseFloat(v.replace(/[$MB,]/g, "")) || 0;
        if (sortBy === "valuation") return parseVal(b.valuation) - parseVal(a.valuation);
        if (sortBy === "revenue") return parseVal(b.revenue) - parseVal(a.revenue);
        if (sortBy === "growth") return parseFloat(b.yoyGrowth) - parseFloat(a.yoyGrowth);
        return 0;
      });
  }, [businesses, searchQuery, filterIndustry, filterDeal, filterStatus, sortBy]);

  const clearFilters = () => {
    setFilterIndustry("All Industries");
    setFilterDeal("All Deal Types");
    setFilterStatus("All Statuses");
  };

  const hasFilters = filterIndustry !== "All Industries" || filterDeal !== "All Deal Types" || filterStatus !== "All Statuses";

  function handleListBusiness() {
    if (!currentUser) {
      setShowAuthModal(true);
    } else {
      navigate("/create-listing");
    }
  }

  async function handleMessageOwner(business: Business) {
    if (!currentUser || !userProfile) {
      setShowAuthModal(true);
      return;
    }
    if (!business.createdBy) {
      alert("This listing doesn't have an owner to message yet.");
      return;
    }
    try {
      const myInitials = userProfile.displayName
        .split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
      const convoId = await getOrCreateConversation(
        currentUser.uid, userProfile.displayName, myInitials,
        business.createdBy, business.ownerName, business.ownerAvatar, business.name
      );
      setSelectedBusiness(null);
      navigateToConversation(convoId);
    } catch (err) {
      console.error("Failed to create conversation:", err);
      alert("Could not start conversation. Please try again.");
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-b border-[#1e2e1e] bg-[#0d1410] flex-shrink-0 gap-2">
        <div className="flex items-center gap-2 md:gap-3 flex-wrap min-w-0">
          <span className="text-gray-400 text-xs md:text-sm whitespace-nowrap">
            <span className="text-white font-bold">{filtered.length}</span> companies
          </span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm transition-colors ${
              showFilters || hasFilters ? "bg-[#1e3a1e] text-[#4ade80] border border-[#2d5a27]" : "bg-[#141a14] text-gray-400 border border-[#1e2e1e]"
            }`}
          >
            <Filter size={12} />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full" />}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-[#141a14] border border-[#1e2e1e] text-gray-400 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#2d5a27]"
            >
              <option value="valuation">Sort: Valuation</option>
              <option value="revenue">Sort: Revenue</option>
              <option value="growth">Sort: Growth</option>
            </select>
          </div>

          {/* Mobile: list/map toggle */}
          {isMobile && (
            <button
              onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-[#141a14] text-gray-400 border border-[#1e2e1e]"
            >
              {mobileView === "list" ? <><Map size={12} /> Map</> : <><List size={12} /> List</>}
            </button>
          )}
        </div>

        {currentUser ? (
          <button
            onClick={handleListBusiness}
            className="flex items-center gap-1.5 bg-[#2d5a27] hover:bg-[#3a7232] text-white text-xs md:text-sm font-semibold px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">List Business</span>
            <span className="sm:hidden">List</span>
          </button>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-1.5 bg-[#1a241a] border border-[#2a3a2a] text-gray-500 text-xs md:text-sm font-semibold px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
          >
            <Lock size={12} />
            <span className="hidden sm:inline">Sign in to List</span>
            <span className="sm:hidden">Sign in</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 bg-[#0d1410] border-b border-[#1e2e1e] flex-wrap flex-shrink-0">
          <FilterSelect label="Industry" value={filterIndustry} options={industries} onChange={setFilterIndustry} />
          <FilterSelect label="Deal" value={filterDeal} options={dealTypes} onChange={setFilterDeal} />
          <FilterSelect label="Status" value={filterStatus} options={statuses} onChange={setFilterStatus} />
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-gray-500 hover:text-gray-300 text-xs">
              <X size={12} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop: side-by-side | Mobile: toggle between list and map */}
        {(!isMobile || mobileView === "list") && (
          <div className={`${isMobile ? "w-full" : "w-[38%] border-r border-[#1e2e1e]"} flex flex-col overflow-hidden`}>
            <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <Filter size={32} className="text-gray-700" />
                  <p className="text-gray-500 text-sm">No companies match your filters</p>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-[#4ade80] text-xs hover:underline">Clear filters</button>
                  )}
                </div>
              ) : (
                filtered.map(b => (
                  <BusinessCard
                    key={b.id}
                    business={b}
                    isSelected={selectedBusiness?.id === b.id}
                    onClick={() => setSelectedBusiness(b)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {(!isMobile || mobileView === "map") && (
          <div className={`${isMobile ? "w-full" : "flex-1"} p-2 md:p-3 overflow-hidden`}>
            <MapView
              businesses={filtered}
              selectedBusiness={selectedBusiness}
              onSelectBusiness={(b) => setSelectedBusiness(b)}
            />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBusiness && (
        <BusinessDetailModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          onMessageOwner={() => handleMessageOwner(selectedBusiness)}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="relative flex items-center gap-1 bg-[#141a14] border border-[#1e2e1e] rounded-lg px-2 md:px-3 py-1.5">
      <span className="text-gray-600 text-xs">{label}:</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-transparent text-gray-300 text-xs focus:outline-none cursor-pointer appearance-none pr-4"
      >
        {options.map(o => <option key={o} value={o} className="bg-[#141a14]">{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2 text-gray-600 pointer-events-none" />
    </div>
  );
}
