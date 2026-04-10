import { useState, useMemo, useEffect, useRef } from "react";
import { Filter, SlidersHorizontal, Plus, ChevronDown, X, Upload, Image as ImageIcon, MapPin, Loader2 } from "lucide-react";
import { Business } from "../lib/mockData";
import BusinessCard, { BusinessDetailModal } from "./BusinessCard";
import MapView from "./MapView";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { subscribeToListings, createListing, geocodeAddress, getOrCreateConversation } from "../lib/firestore";

interface ListingsViewProps {
  searchQuery: string;
  navigateToConversation: (convoId: string) => void;
}

const industries = ["All Industries", "Manufacturing", "Healthcare Technology", "Logistics & Supply Chain", "Fintech", "Clean Energy", "Defense", "Biotechnology", "Commercial Real Estate", "Technology", "Other"];
const dealTypes = ["All Deal Types", "Full Acquisition", "Growth Equity", "Recapitalization", "Partial Stake", "Venture / Growth", "Portfolio Sale"];
const statuses = ["All Statuses", "Active", "Seeking Capital", "Under LOI", "Acquired"];

export default function ListingsView({ searchQuery, navigateToConversation }: ListingsViewProps) {
  const { currentUser, userProfile } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [filterIndustry, setFilterIndustry] = useState("All Industries");
  const [filterDeal, setFilterDeal] = useState("All Deal Types");
  const [filterStatus, setFilterStatus] = useState("All Statuses");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("valuation");
  const [showListModal, setShowListModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
      setShowListModal(true);
    }
  }

  async function handleMessageOwner(business: Business) {
    if (!currentUser || !userProfile) {
      setShowAuthModal(true);
      return;
    }
    if (!business.createdBy) {
      alert("Cannot message this listing owner.");
      return;
    }
    const myInitials = userProfile.displayName
      .split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    const convoId = await getOrCreateConversation(
      currentUser.uid,
      userProfile.displayName,
      myInitials,
      business.createdBy,
      business.ownerName,
      business.ownerAvatar,
      business.name
    );
    setSelectedBusiness(null);
    navigateToConversation(convoId);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2e1e] bg-[#0d1410] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">
            <span className="text-white font-bold">{filtered.length}</span> companies
          </span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showFilters || hasFilters ? "bg-[#1e3a1e] text-[#4ade80] border border-[#2d5a27]" : "bg-[#141a14] text-gray-400 border border-[#1e2e1e] hover:border-[#2a3a2a]"
            }`}
          >
            <Filter size={14} />
            Filters
            {hasFilters && <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full" />}
          </button>

          <div className="flex items-center gap-2">
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
        </div>

        <button
          onClick={handleListBusiness}
          className="flex items-center gap-2 bg-[#2d5a27] hover:bg-[#3a7232] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={14} />
          List Business
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#0d1410] border-b border-[#1e2e1e] flex-wrap flex-shrink-0">
          <FilterSelect label="Industry" value={filterIndustry} options={industries} onChange={setFilterIndustry} />
          <FilterSelect label="Deal Type" value={filterDeal} options={dealTypes} onChange={setFilterDeal} />
          <FilterSelect label="Status" value={filterStatus} options={statuses} onChange={setFilterStatus} />
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-gray-500 hover:text-gray-300 text-xs transition-colors">
              <X size={12} /> Clear all
            </button>
          )}
        </div>
      )}

      {/* Main Split Layout - listings scroll, map fills */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Scrollable Listings */}
        <div className="w-[38%] flex flex-col border-r border-[#1e2e1e] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
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

        {/* Right: Map fills remaining space */}
        <div className="flex-1 p-3 overflow-hidden">
          <MapView
            businesses={filtered}
            selectedBusiness={selectedBusiness}
            onSelectBusiness={(b) => setSelectedBusiness(b)}
          />
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBusiness && (
        <BusinessDetailModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          onMessageOwner={() => handleMessageOwner(selectedBusiness)}
        />
      )}

      {/* List Business Modal */}
      {showListModal && <ListBusinessModal onClose={() => setShowListModal(false)} />}

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => {
        setShowAuthModal(false);
        // if user just signed in and wanted to list, open the list modal
        if (currentUser) setShowListModal(true);
      }} />}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative flex items-center gap-1.5 bg-[#141a14] border border-[#1e2e1e] rounded-lg px-3 py-1.5">
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

// ————————————————————————————————————————
// List Business Modal - creates listing in Firestore
// ————————————————————————————————————————

function ListBusinessModal({ onClose }: { onClose: () => void }) {
  const { currentUser, userProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", industry: "Manufacturing", revenue: "", ebitda: "", employees: "",
    location: "", address: "", description: "", askingPrice: "", dealType: "Full Acquisition",
    website: "", grossMargin: "", yoyGrowth: "", sector: "Industrials", status: "Active" as const,
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    if (!currentUser || !userProfile) return;
    if (!form.name.trim() || !form.address.trim()) {
      setError("Company name and address are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // geocode address
      const geo = await geocodeAddress(form.address);
      if (!geo) {
        setError("Could not find that address. Please try a more specific address.");
        setSaving(false);
        return;
      }

      const initials = userProfile.displayName
        .split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

      const logoInitials = form.name
        .split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();

      const listingData: Omit<Business, "id"> = {
        name: form.name,
        industry: form.industry,
        sector: form.sector,
        description: form.description,
        revenue: form.revenue || "N/A",
        ebitda: form.ebitda || "N/A",
        valuation: form.askingPrice || "N/A",
        employees: parseInt(form.employees) || 0,
        founded: new Date().getFullYear(),
        location: `${geo.city || ""}, ${geo.state || ""}`.replace(/^, |, $/g, "") || form.address,
        city: geo.city,
        state: geo.state,
        country: geo.country,
        lat: geo.lat,
        lng: geo.lng,
        logo: logoInitials,
        tags: form.industry ? [form.industry] : [],
        status: form.status,
        askingPrice: form.askingPrice || "N/A",
        grossMargin: form.grossMargin || "N/A",
        yoyGrowth: form.yoyGrowth || "N/A",
        ownerName: userProfile.displayName,
        ownerTitle: userProfile.title || "",
        ownerAvatar: initials,
        listedAt: new Date().toISOString().split("T")[0],
        website: form.website,
        dealType: form.dealType,
        imageUrls: [],
        createdBy: currentUser.uid,
      };

      await createListing(listingData, images);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create listing. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#141a14] border border-[#2a3a2a] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1e2e1e]">
          <div>
            <h2 className="text-white font-bold text-lg">List Your Business</h2>
            <p className="text-gray-500 text-sm">Step {step} of 2 — {step === 1 ? "Company Info" : "Financial Details"}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="h-1 bg-[#1e2e1e]">
          <div className="h-full bg-[#4ade80] transition-all duration-300" style={{ width: `${step * 50}%` }} />
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {step === 1 ? (
            <>
              <FormInput label="Company Name" value={form.name} onChange={v => update("name", v)} placeholder="e.g. Vertex Industrial Solutions" required />
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Industry</label>
                <select
                  value={form.industry}
                  onChange={e => update("industry", e.target.value)}
                  className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
                >
                  {industries.slice(1).map(d => <option key={d} value={d} className="bg-[#1a241a]">{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                  <MapPin size={12} /> Address
                </label>
                <input
                  value={form.address}
                  onChange={e => update("address", e.target.value)}
                  placeholder="e.g. 1234 Main St, Dallas, TX 75201"
                  className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
                />
                <p className="text-gray-600 text-xs mt-1">This address will be geocoded and shown on the map</p>
              </div>
              <FormInput label="Number of Employees" value={form.employees} onChange={v => update("employees", v)} placeholder="e.g. 312" type="number" />
              <FormInput label="Website" value={form.website} onChange={v => update("website", v)} placeholder="yourcompany.com" />
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Business Description</label>
                <textarea
                  value={form.description}
                  onChange={e => update("description", e.target.value)}
                  placeholder="Describe your business, key strengths, competitive advantages..."
                  rows={3}
                  className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#4ade80] transition-colors resize-none"
                />
              </div>
              {/* Image Upload */}
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                  <ImageIcon size={12} /> Business Images
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 bg-[#1a241a] border border-dashed border-[#2a3a2a] rounded-lg py-4 text-gray-500 hover:text-gray-300 hover:border-[#4ade80] transition-colors text-sm"
                >
                  <Upload size={16} />
                  Click to upload images
                </button>
                {previews.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {previews.map((src, i) => (
                      <div key={i} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-[#2a3a2a]">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <FormInput label="Annual Revenue" value={form.revenue} onChange={v => update("revenue", v)} placeholder="e.g. $42.8M" />
              <FormInput label="EBITDA" value={form.ebitda} onChange={v => update("ebitda", v)} placeholder="e.g. $9.6M" />
              <FormInput label="Asking Price / Valuation" value={form.askingPrice} onChange={v => update("askingPrice", v)} placeholder="e.g. $86M" />
              <FormInput label="Gross Margin" value={form.grossMargin} onChange={v => update("grossMargin", v)} placeholder="e.g. 38.2%" />
              <FormInput label="YoY Growth" value={form.yoyGrowth} onChange={v => update("yoyGrowth", v)} placeholder="e.g. +14.7%" />
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Deal Type</label>
                <select
                  value={form.dealType}
                  onChange={e => update("dealType", e.target.value)}
                  className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
                >
                  {dealTypes.slice(1).map(d => <option key={d} value={d} className="bg-[#1a241a]">{d}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-[#1e2e1e]">
          {step === 2 && (
            <button onClick={() => setStep(1)} disabled={saving} className="flex-1 bg-[#1a241a] hover:bg-[#1e2e1e] border border-[#2a3a2a] text-gray-300 font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-50">
              Back
            </button>
          )}
          <button
            onClick={() => step === 1 ? setStep(2) : handleSubmit()}
            disabled={saving}
            className="flex-1 bg-[#2d5a27] hover:bg-[#3a7232] text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Creating Listing...</>
            ) : step === 1 ? "Continue" : "Submit Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = "text", required }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
      />
    </div>
  );
}
