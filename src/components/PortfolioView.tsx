import { useState, useEffect, useMemo } from "react";
import { TrendingUp, DollarSign, BarChart3, Building2, PieChart, Activity, Plus, X, Trash2, Loader2, Copy, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatDollar, parseFormatted } from "../utils/format";
import AuthModal from "./AuthModal";
import { subscribeToHoldings, addHolding, deleteHolding, updateBudget, type Holding } from "../lib/firestore";

const sectorOptions = ["Fintech", "Health Tech", "Defense", "Industrials", "Energy", "Real Estate", "Technology", "Biotechnology", "Other"];

export default function PortfolioView() {
  const { currentUser, userProfile } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [budget, setBudget] = useState(0);
  const [budgetInput, setBudgetInput] = useState("");
  const [editingBudget, setEditingBudget] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToHoldings(currentUser.uid, setHoldings);
    return unsub;
  }, [currentUser]);

  // Computed metrics
  const metrics = useMemo(() => {
    const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
    const totalCost = holdings.reduce((s, h) => s + h.costBasis, 0);
    const moic = totalCost > 0 ? (totalValue / totalCost) : 0;
    const irr = totalCost > 0 ? ((totalValue / totalCost - 1) * 100) : 0;
    return { totalValue, totalCost, moic, irr };
  }, [holdings]);

  // Sector allocation
  const sectorAlloc = useMemo(() => {
    if (holdings.length === 0) return [];
    const totals: Record<string, number> = {};
    const totalVal = holdings.reduce((s, h) => s + h.currentValue, 0);
    holdings.forEach(h => { totals[h.sector] = (totals[h.sector] || 0) + h.currentValue; });
    return Object.entries(totals)
      .map(([name, val]) => ({ name, pct: totalVal > 0 ? Math.round((val / totalVal) * 100) : 0 }))
      .sort((a, b) => b.pct - a.pct);
  }, [holdings]);

  const fmt = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return `$${n.toLocaleString()}`;
  };

  function saveBudget() {
    const val = parseFloat(parseFormatted(budgetInput)) || 0;
    setBudget(val);
    setEditingBudget(false);
    if (currentUser) updateBudget(currentUser.uid, val);
  }

  async function handleDeleteHolding(id: string) {
    if (!currentUser) return;
    try { await deleteHolding(currentUser.uid, id); } catch {}
  }

  function generateReport() {
    const lines = [
      `ARCHALEON PORTFOLIO REPORT`,
      `Generated: ${new Date().toLocaleDateString()}`,
      `Investor: ${userProfile?.displayName || "—"}`,
      ``,
      `SUMMARY`,
      `Total Portfolio Value: ${fmt(metrics.totalValue)}`,
      `Total Invested: ${fmt(metrics.totalCost)}`,
      `Blended MOIC: ${metrics.moic.toFixed(2)}x`,
      `Blended IRR: ${metrics.irr.toFixed(1)}%`,
      `Holdings: ${holdings.length}`,
      budget > 0 ? `Budget: ${fmt(budget)} | Allocated: ${fmt(metrics.totalCost)} | Remaining: ${fmt(Math.max(0, budget - metrics.totalCost))}` : "",
      ``,
      `HOLDINGS`,
      ...holdings.map(h => `  ${h.name} (${h.sector}) — Cost: ${fmt(h.costBasis)}, Value: ${fmt(h.currentValue)}, MOIC: ${h.costBasis > 0 ? (h.currentValue / h.costBasis).toFixed(2) : "—"}x`),
      ``,
      `SECTOR ALLOCATION`,
      ...sectorAlloc.map(s => `  ${s.name}: ${s.pct}%`),
    ].filter(Boolean);
    return lines.join("\n");
  }

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <BarChart3 size={32} className="text-gray-600" />
        <p className="text-white font-semibold">Sign in to track your portfolio</p>
        <button onClick={() => setShowAuth(true)} className="bg-[#2d5a27] hover:bg-[#3a7232] text-white font-semibold px-6 py-2.5 rounded-lg text-sm">Sign In</button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  const budgetUsedPct = budget > 0 ? Math.min(100, Math.round((metrics.totalCost / budget) * 100)) : 0;

  return (
    <div className="h-full overflow-y-auto bg-[#0a1208] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Portfolio Overview</h1>
          <p className="text-gray-500 text-sm mt-1">{holdings.length} holding{holdings.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowReport(true)} className="flex items-center gap-2 bg-[#141a14] border border-[#1e2e1e] text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-[#1a241a]">
            <PieChart size={14} /> Report
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#2d5a27] hover:bg-[#3a7232] text-white px-4 py-2 rounded-lg text-sm">
            <Plus size={14} /> Add Holding
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { label: "Total Portfolio Value", value: fmt(metrics.totalValue), delta: `${holdings.length} holdings`, icon: <DollarSign size={20} /> },
          { label: "Total Invested", value: fmt(metrics.totalCost), delta: budget > 0 ? `${budgetUsedPct}% of budget` : "—", icon: <BarChart3 size={20} /> },
          { label: "Blended MOIC", value: metrics.moic > 0 ? `${metrics.moic.toFixed(2)}x` : "—", delta: metrics.moic > 1 ? "Positive" : "—", icon: <TrendingUp size={20} /> },
          { label: "Blended IRR", value: metrics.irr > 0 ? `${metrics.irr.toFixed(1)}%` : "—", delta: metrics.irr > 0 ? "Annualized" : "—", icon: <Activity size={20} /> },
        ].map(m => (
          <div key={m.label} className="bg-[#141a14] border border-[#1e2e1e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#4ade80]">{m.icon}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#4ade80]/10 text-[#4ade80]">{m.delta}</span>
            </div>
            <p className="text-white font-bold text-2xl">{m.value}</p>
            <p className="text-gray-500 text-xs mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Budget Tracker */}
      <div className="bg-[#141a14] border border-[#1e2e1e] rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold">Investment Budget</h2>
          {!editingBudget ? (
            <button onClick={() => { setBudgetInput(budget > 0 ? String(budget) : ""); setEditingBudget(true); }} className="text-[#4ade80] text-xs hover:underline">
              {budget > 0 ? "Edit" : "Set Budget"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                value={budgetInput}
                onChange={e => setBudgetInput(formatDollar(e.target.value))}
                placeholder="e.g. $5,000,000"
                className="bg-[#1a241a] border border-[#2a3a2a] rounded px-2 py-1 text-white text-xs w-36 focus:outline-none focus:border-[#4ade80]"
              />
              <button onClick={saveBudget} className="text-[#4ade80] text-xs font-semibold">Save</button>
              <button onClick={() => setEditingBudget(false)} className="text-gray-500 text-xs">Cancel</button>
            </div>
          )}
        </div>
        {budget > 0 ? (
          <>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Allocated: {fmt(metrics.totalCost)}</span>
              <span className="text-gray-400">Remaining: {fmt(Math.max(0, budget - metrics.totalCost))}</span>
            </div>
            <div className="h-3 bg-[#1a241a] rounded-full overflow-hidden">
              <div className="h-full bg-[#4ade80] rounded-full" style={{ width: `${budgetUsedPct}%` }} />
            </div>
            <p className="text-gray-600 text-xs mt-1">Total budget: {fmt(budget)}</p>
          </>
        ) : (
          <p className="text-gray-500 text-sm">Set an investment budget to track your allocation</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Holdings Table */}
        <div className="lg:col-span-2 bg-[#141a14] border border-[#1e2e1e] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2e1e]">
            <h2 className="text-white font-bold">Holdings</h2>
            <span className="text-gray-500 text-sm">{holdings.length} positions</span>
          </div>
          {holdings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Building2 size={32} className="text-gray-700" />
              <p className="text-gray-500 text-sm">No holdings yet</p>
              <button onClick={() => setShowAddModal(true)} className="text-[#4ade80] text-xs hover:underline">Add your first holding</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e2e1e]">
                    {["Company", "Sector", "Acquired", "Cost", "Value", "MOIC", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2e1e]">
                  {holdings.map(h => {
                    const moic = h.costBasis > 0 ? (h.currentValue / h.costBasis) : 0;
                    return (
                      <tr key={h.id} className="hover:bg-[#1a241a]">
                        <td className="px-4 py-3 text-white font-medium text-sm">{h.name}</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-[#1e3a1e] text-[#4ade80] text-xs rounded-full">{h.sector}</span></td>
                        <td className="px-4 py-3 text-gray-400 text-sm">{h.acquired}</td>
                        <td className="px-4 py-3 text-gray-300 text-sm">{fmt(h.costBasis)}</td>
                        <td className="px-4 py-3 text-white font-bold text-sm">{fmt(h.currentValue)}</td>
                        <td className="px-4 py-3"><span className={`font-bold text-sm ${moic >= 1 ? "text-[#4ade80]" : "text-red-400"}`}>{moic.toFixed(2)}x</span></td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteHolding(h.id)} className="text-gray-600 hover:text-red-400"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Allocation */}
        <div className="bg-[#141a14] border border-[#1e2e1e] rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">Sector Allocation</h2>
          {sectorAlloc.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">Add holdings to see sector breakdown</p>
          ) : (
            <div className="space-y-4">
              {sectorAlloc.map((s, i) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-gray-400 text-sm">{s.name}</span>
                    <span className="text-white font-bold text-sm">{s.pct}%</span>
                  </div>
                  <div className="h-2 bg-[#1a241a] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: ["#4ade80", "#34d399", "#86efac", "#a3e635", "#fbbf24", "#60a5fa"][i % 6] }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Holding Modal */}
      {showAddModal && <AddHoldingModal userId={currentUser.uid} onClose={() => setShowAddModal(false)} />}

      {/* Report Modal */}
      {showReport && <ReportModal report={generateReport()} onClose={() => setShowReport(false)} />}
    </div>
  );
}

// ——— Add Holding Modal ———

function AddHoldingModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [name, setName] = useState("");
  const [sector, setSector] = useState("Fintech");
  const [acquired, setAcquired] = useState("");
  const [costBasis, setCostBasis] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!name.trim()) { setError("Company name is required."); return; }
    if (!costBasis) { setError("Cost basis is required."); return; }
    setSaving(true);
    try {
      await addHolding(userId, {
        name: name.trim(),
        sector,
        acquired: acquired || new Date().toISOString().split("T")[0],
        costBasis: parseFloat(parseFormatted(costBasis)) || 0,
        currentValue: parseFloat(parseFormatted(currentValue)) || parseFloat(parseFormatted(costBasis)) || 0,
        notes,
      });
      onClose();
    } catch {
      setError("Failed to add holding. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#141a14] border border-[#2a3a2a] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#1e2e1e]">
          <h2 className="text-white font-bold text-lg">Add Holding</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
        </div>
        {error && <div className="mx-6 mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">{error}</div>}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Company Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Apex Financial" className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80]" />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Sector</label>
            <select value={sector} onChange={e => setSector(e.target.value)} className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80]">
              {sectorOptions.map(s => <option key={s} value={s} className="bg-[#1a241a]">{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Acquisition Date</label>
            <input type="date" value={acquired} onChange={e => setAcquired(e.target.value)} className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Cost Basis *</label>
              <input value={costBasis} onChange={e => setCostBasis(formatDollar(e.target.value))} placeholder="e.g. $5,000,000" className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80]" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Current Value</label>
              <input value={currentValue} onChange={e => setCurrentValue(formatDollar(e.target.value))} placeholder="e.g. $7,000,000" className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80]" />
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes..." className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80] resize-none" />
          </div>
        </div>
        <div className="p-6 border-t border-[#1e2e1e]">
          <button onClick={handleSubmit} disabled={saving} className="w-full bg-[#2d5a27] hover:bg-[#3a7232] text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Adding...</> : <><Plus size={16} /> Add Holding</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ——— Report Modal ———

function ReportModal({ report, onClose }: { report: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(report).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#141a14] border border-[#2a3a2a] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#1e2e1e]">
          <h2 className="text-white font-bold text-lg">Portfolio Report</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <pre className="text-gray-300 text-xs font-mono whitespace-pre-wrap leading-relaxed bg-[#0d1410] border border-[#1e2e1e] rounded-xl p-4">{report}</pre>
        </div>
        <div className="p-6 border-t border-[#1e2e1e]">
          <button onClick={handleCopy} className="w-full bg-[#2d5a27] hover:bg-[#3a7232] text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
            {copied ? <><CheckCircle size={16} /> Copied!</> : <><Copy size={16} /> Copy to Clipboard</>}
          </button>
        </div>
      </div>
    </div>
  );
}
