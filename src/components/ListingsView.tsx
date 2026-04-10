import { useState, useMemo } from "react";
import { Filter, SlidersHorizontal, Plus, ChevronDown, X } from "lucide-react";
import { businesses, Business } from "../lib/mockData";
import BusinessCard, { BusinessDetailPanel } from "./BusinessCard";
import MapView from "./MapView";

interface ListingsViewProps {
  searchQuery: string;
}

const industries = ["All Industries", "Manufacturing", "Healthcare Technology", "Logistics & Supply Chain", "Fintech", "Clean Energy", "Defense", "Biotechnology", "Commercial Real Estate"];
const dealTypes = ["All Deal Types", "Full Acquisition", "Growth Equity", "Recapitalization", "Partial Stake", "Venture / Growth", "Portfolio Sale"];
const statuses = ["All Statuses", "Active", "Seeking Capital", "Under LOI", "Acquired"];

export default function ListingsView({ searchQuery }: ListingsViewProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [filterIndustry, setFilterIndustry] = useState("All Industries");
  const [filterDeal, setFilterDeal] = useState("All Deal Types");
  const [filterStatus, setFilterStatus] = useState("All Statuses");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("valuation");
  const [showListModal, setShowListModal] = useState(false);

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
        const parseVal = (v: string) => parseFloat(v.replace(/[$MB,]/g, "").replace("M", "000000").replace("B", "000000000")) || 0;
        if (sortBy === "valuation") return parseVal(b.valuation) - parseVal(a.valuation);
        if (sortBy === "revenue") return parseVal(b.revenue) - parseVal(a.revenue);
        if (sortBy === "growth") return parseFloat(b.yoyGrowth) - parseFloat(a.yoyGrowth);
        return 0;
      });
  }, [searchQuery, filterIndustry, filterDeal, filterStatus, sortBy]);

  const clearFilters = () => {
    setFilterIndustry("All Industries");
    setFilterDeal("All Deal Types");
    setFilterStatus("All Statuses");
  };

  const hasFilters = filterIndustry !== "All Industries" || filterDeal !== "All Deal Types" || filterStatus !== "All Statuses";

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2e1e] bg-[#0d1410]">
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
          onClick={() => setShowListModal(true)}
          className="flex items-center gap-2 bg-[#2d5a27] hover:bg-[#3a7232] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={14} />
          List Business
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#0d1410] border-b border-[#1e2e1e] flex-wrap">
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

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Listings */}
        <div className={`flex flex-col border-r border-[#1e2e1e] overflow-hidden transition-all duration-300 ${
          selectedBusiness ? "w-[35%]" : "w-[40%]"
        }`}>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <Filter size={32} className="text-gray-700" />
                <p className="text-gray-500 text-sm">No companies match your filters</p>
                <button onClick={clearFilters} className="text-[#4ade80] text-xs hover:underline">Clear filters</button>
              </div>
            ) : (
              filtered.map(b => (
                <BusinessCard
                  key={b.id}
                  business={b}
                  isSelected={selectedBusiness?.id === b.id}
                  onClick={() => setSelectedBusiness(selectedBusiness?.id === b.id ? null : b)}
                />
              ))
            )}
          </div>
        </div>

        {/* Center: Detail Panel (conditional) */}
        {selectedBusiness && (
          <div className="w-[30%] border-r border-[#1e2e1e] overflow-hidden">
            <BusinessDetailPanel
              business={selectedBusiness}
              onClose={() => setSelectedBusiness(null)}
            />
          </div>
        )}

        {/* Right: Map */}
        <div className="flex-1 p-3 overflow-hidden">
          <MapView
            businesses={filtered}
            selectedBusiness={selectedBusiness}
            onSelectBusiness={(b) => setSelectedBusiness(selectedBusiness?.id === b.id ? null : b)}
          />
        </div>
      </div>

      {/* List Business Modal */}
      {showListModal && <ListBusinessModal onClose={() => setShowListModal(false)} />}
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

function ListBusinessModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", industry: "", revenue: "", ebitda: "", employees: "", location: "", description: "", askingPrice: "", dealType: "Full Acquisition", website: ""
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

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

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {step === 1 ? (
            <>
              <Input label="Company Name" value={form.name} onChange={v => update("name", v)} placeholder="e.g. Vertex Industrial Solutions" />
              <Input label="Industry" value={form.industry} onChange={v => update("industry", v)} placeholder="e.g. Manufacturing" />
              <Input label="Headquarters Location" value={form.location} onChange={v => update("location", v)} placeholder="e.g. Dallas, TX" />
              <Input label="Number of Employees" value={form.employees} onChange={v => update("employees", v)} placeholder="e.g. 312" type="number" />
              <Input label="Website" value={form.website} onChange={v => update("website", v)} placeholder="yourcompany.com" />
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
            </>
          ) : (
            <>
              <Input label="Annual Revenue" value={form.revenue} onChange={v => update("revenue", v)} placeholder="e.g. $42.8M" />
              <Input label="EBITDA" value={form.ebitda} onChange={v => update("ebitda", v)} placeholder="e.g. $9.6M" />
              <Input label="Asking Price / Valuation" value={form.askingPrice} onChange={v => update("askingPrice", v)} placeholder="e.g. $86M" />
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
              <div className="bg-[#1a241a] border border-[#2a3a2a] rounded-lg p-4">
                <p className="text-gray-400 text-xs mb-2">📋 <strong className="text-gray-300">What happens next?</strong></p>
                <ul className="text-gray-500 text-xs space-y-1">
                  <li>• Our team reviews your listing within 24 hours</li>
                  <li>• Verified investors will be able to view your profile</li>
                  <li>• You'll be notified of all investor inquiries</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-[#1e2e1e]">
          {step === 2 && (
            <button onClick={() => setStep(1)} className="flex-1 bg-[#1a241a] hover:bg-[#1e2e1e] border border-[#2a3a2a] text-gray-300 font-semibold py-3 rounded-xl transition-colors text-sm">
              Back
            </button>
          )}
          <button
            onClick={() => step === 1 ? setStep(2) : onClose()}
            className="flex-1 bg-[#2d5a27] hover:bg-[#3a7232] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {step === 1 ? "Continue" : "Submit Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
      />
    </div>
  );
}
