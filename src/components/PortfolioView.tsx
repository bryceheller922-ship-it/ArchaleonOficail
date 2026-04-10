import { TrendingUp, DollarSign, BarChart3, Building2, Globe, PieChart, Activity } from "lucide-react";
import { businesses } from "../lib/mockData";

const portfolioItems = [
  { id: "4", name: "Apex Financial Technologies", acquired: "Mar 2023", cost: "$185M", currentVal: "$215M", moic: "1.16x", irr: "18.4%", status: "Active Hold", sector: "Fintech" },
  { id: "2", name: "Meridian Health Analytics", acquired: "Aug 2022", cost: "$95M", currentVal: "$130M", moic: "1.37x", irr: "23.1%", status: "Active Hold", sector: "Health Tech" },
  { id: "6", name: "Pinnacle Defense Contractors", acquired: "Jan 2021", cost: "$290M", currentVal: "$380M", moic: "1.31x", irr: "14.8%", status: "Active Hold", sector: "Defense" },
];

const metrics = [
  { label: "Total Portfolio Value", value: "$725M", delta: "+12.4%", icon: <DollarSign size={20} />, positive: true },
  { label: "Total Invested", value: "$570M", delta: "3 holdings", icon: <BarChart3 size={20} />, positive: true },
  { label: "Blended MOIC", value: "1.27x", delta: "+0.06x QoQ", icon: <TrendingUp size={20} />, positive: true },
  { label: "Blended IRR", value: "18.8%", delta: "+1.2pp YoY", icon: <Activity size={20} />, positive: true },
];

const sectorAlloc = [
  { name: "Defense", pct: 52, color: "#4ade80" },
  { name: "Health Tech", pct: 18, color: "#34d399" },
  { name: "Fintech", pct: 30, color: "#86efac" },
];

const recentActivity = [
  { date: "Feb 18, 2025", type: "Valuation Update", desc: "Apex Financial Technologies — Q4 2024 mark-to-market", change: "+$8M", positive: true },
  { date: "Feb 10, 2025", type: "Board Meeting", desc: "Meridian Health Analytics — Quarterly board review", change: "", positive: true },
  { date: "Jan 30, 2025", type: "Distribution", desc: "Pinnacle Defense Contractors — Q4 dividend", change: "+$4.2M", positive: true },
  { date: "Jan 22, 2025", type: "New Deal Signed", desc: "Meridian Health — New enterprise contract ($12M TCV)", change: "+$12M", positive: true },
  { date: "Jan 08, 2025", type: "Valuation Update", desc: "Pinnacle Defense — DoD contract renewal impact", change: "+$22M", positive: true },
];

export default function PortfolioView() {
  return (
    <div className="h-full overflow-y-auto bg-[#0a1208] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Portfolio Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Last updated: Feb 20, 2025 · Q4 2024</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-[#141a14] border border-[#1e2e1e] text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-[#1a241a] transition-colors">
            <PieChart size={14} /> Report
          </button>
          <button className="flex items-center gap-2 bg-[#2d5a27] hover:bg-[#3a7232] text-white px-4 py-2 rounded-lg text-sm transition-colors">
            <Building2 size={14} /> Add Holding
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map(m => (
          <div key={m.label} className="bg-[#141a14] border border-[#1e2e1e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#4ade80]">{m.icon}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.positive ? "bg-[#4ade80]/10 text-[#4ade80]" : "bg-red-400/10 text-red-400"}`}>
                {m.delta}
              </span>
            </div>
            <p className="text-white font-bold text-2xl">{m.value}</p>
            <p className="text-gray-500 text-xs mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Holdings Table */}
        <div className="lg:col-span-2 bg-[#141a14] border border-[#1e2e1e] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2e1e]">
            <h2 className="text-white font-bold">Holdings</h2>
            <span className="text-gray-500 text-sm">{portfolioItems.length} positions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e2e1e]">
                  {["Company", "Sector", "Acquired", "Cost Basis", "Current Val", "MOIC", "IRR", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2e1e]">
                {portfolioItems.map(item => (
                  <tr key={item.id} className="hover:bg-[#1a241a] transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#2d5a27] rounded-lg flex items-center justify-center text-xs font-bold text-[#4ade80]">
                          {businesses.find(b => b.id === item.id)?.logo || "??"}
                        </div>
                        <span className="text-white font-medium text-sm whitespace-nowrap">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-[#1e3a1e] text-[#4ade80] text-xs rounded-full">{item.sector}</span>
                    </td>
                    <td className="px-4 py-4 text-gray-400 text-sm whitespace-nowrap">{item.acquired}</td>
                    <td className="px-4 py-4 text-gray-300 text-sm font-medium">{item.cost}</td>
                    <td className="px-4 py-4 text-white text-sm font-bold">{item.currentVal}</td>
                    <td className="px-4 py-4">
                      <span className="text-[#4ade80] font-bold text-sm">{item.moic}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <TrendingUp size={12} className="text-[#4ade80]" />
                        <span className="text-[#4ade80] font-bold text-sm">{item.irr}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-[#4ade80]/10 text-[#4ade80] text-xs rounded-full border border-[#4ade80]/20">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Allocation */}
        <div className="bg-[#141a14] border border-[#1e2e1e] rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">Sector Allocation</h2>
          {/* Visual Bar Chart */}
          <div className="space-y-4">
            {sectorAlloc.map(s => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-400 text-sm">{s.name}</span>
                  <span className="text-white font-bold text-sm">{s.pct}%</span>
                </div>
                <div className="h-2 bg-[#1a241a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${s.pct}%`, background: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#1e2e1e]">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Geography</h3>
            <div className="space-y-2">
              {[
                { region: "United States", pct: 88 },
                { region: "Canada", pct: 8 },
                { region: "UK / Europe", pct: 4 },
              ].map(g => (
                <div key={g.region} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe size={12} className="text-gray-600" />
                    <span className="text-gray-400 text-xs">{g.region}</span>
                  </div>
                  <span className="text-gray-300 text-xs font-medium">{g.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-[#141a14] border border-[#1e2e1e] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e2e1e]">
          <h2 className="text-white font-bold">Recent Activity</h2>
        </div>
        <div className="divide-y divide-[#1e2e1e]">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="flex items-start gap-4 px-6 py-4 hover:bg-[#1a241a] transition-colors">
              <div className="w-8 h-8 bg-[#1e3a1e] rounded-lg flex items-center justify-center flex-shrink-0">
                {activity.type.includes("Valuation") ? <TrendingUp size={14} className="text-[#4ade80]" /> :
                 activity.type.includes("Board") ? <Building2 size={14} className="text-[#4ade80]" /> :
                 activity.type.includes("Distribution") ? <DollarSign size={14} className="text-[#4ade80]" /> :
                 <Activity size={14} className="text-[#4ade80]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#4ade80] text-xs font-medium">{activity.type}</span>
                  <span className="text-gray-600 text-xs flex-shrink-0">{activity.date}</span>
                </div>
                <p className="text-gray-300 text-sm mt-0.5">{activity.desc}</p>
              </div>
              {activity.change && (
                <span className={`text-sm font-bold flex-shrink-0 ${activity.positive ? "text-[#4ade80]" : "text-red-400"}`}>
                  {activity.change}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
