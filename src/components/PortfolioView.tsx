import { TrendingUp, DollarSign, BarChart3, Building2, PieChart, Activity } from "lucide-react";

const portfolioItems: { id: string; name: string; acquired: string; cost: string; currentVal: string; moic: string; irr: string; status: string; sector: string }[] = [];

const metrics = [
  { label: "Total Portfolio Value", value: "$0", delta: "--", icon: <DollarSign size={20} />, positive: true },
  { label: "Total Invested", value: "$0", delta: "0 holdings", icon: <BarChart3 size={20} />, positive: true },
  { label: "Blended MOIC", value: "--", delta: "--", icon: <TrendingUp size={20} />, positive: true },
  { label: "Blended IRR", value: "--", delta: "--", icon: <Activity size={20} />, positive: true },
];

const sectorAlloc: { name: string; pct: number; color: string }[] = [];

const recentActivity: { date: string; type: string; desc: string; change: string; positive: boolean }[] = [];

export default function PortfolioView() {
  return (
    <div className="h-full overflow-y-auto bg-[#0a1208] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Portfolio Overview</h1>
          <p className="text-gray-500 text-sm mt-1">No holdings yet</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => alert("Portfolio reports coming soon!")}
            className="flex items-center gap-2 bg-[#141a14] border border-[#1e2e1e] text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-[#1a241a] transition-colors"
          >
            <PieChart size={14} /> Report
          </button>
          <button
            onClick={() => alert("Add holding coming soon!")}
            className="flex items-center gap-2 bg-[#2d5a27] hover:bg-[#3a7232] text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
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
          {portfolioItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Building2 size={32} className="text-gray-700" />
              <p className="text-gray-500 text-sm">No holdings yet</p>
              <p className="text-gray-600 text-xs">Your portfolio holdings will appear here</p>
            </div>
          ) : (
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
                        <span className="text-white font-medium text-sm whitespace-nowrap">{item.name}</span>
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
          )}
        </div>

        {/* Allocation */}
        <div className="bg-[#141a14] border border-[#1e2e1e] rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">Sector Allocation</h2>
          {sectorAlloc.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <p className="text-gray-500 text-sm">No allocation data</p>
              <p className="text-gray-600 text-xs">Add holdings to see sector breakdown</p>
            </div>
          ) : (
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
          )}

          <div className="mt-6 pt-4 border-t border-[#1e2e1e]">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Geography</h3>
            <div className="space-y-2">
              <p className="text-gray-500 text-xs">No data available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-[#141a14] border border-[#1e2e1e] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e2e1e]">
          <h2 className="text-white font-bold">Recent Activity</h2>
        </div>
        {recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Activity size={24} className="text-gray-700" />
            <p className="text-gray-500 text-sm">No recent activity</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
