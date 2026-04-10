import { useState } from "react";
import { Search, UserPlus, Check, Clock, MessageSquare, ExternalLink, Network, Star, TrendingUp, Filter } from "lucide-react";
import { professionals, Professional } from "../lib/mockData";

export default function NetworkView() {
  const [people, setPeople] = useState<Professional[]>(professionals);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("All");
  const [selectedPerson, setSelectedPerson] = useState<Professional | null>(null);

  const industries = ["All", "Private Equity", "Growth Equity", "Alternative Investments", "Family Office"];

  const filtered = people.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.company.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q));
    const matchIndustry = filterIndustry === "All" || p.industry === filterIndustry;
    return matchSearch && matchIndustry;
  });

  const connected = people.filter(p => p.isConnected);
  const pending = people.filter(p => p.isPending);

  const handleConnect = (id: string) => {
    setPeople(prev => prev.map(p =>
      p.id === id ? { ...p, isPending: true } : p
    ));
    if (selectedPerson?.id === id) {
      setSelectedPerson(prev => prev ? { ...prev, isPending: true } : null);
    }
  };

  const handleMessage = () => {
    // In production, this would open a message thread
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel */}
      <div className="w-72 flex flex-col border-r border-[#1e2e1e] bg-[#0d1410] overflow-y-auto">
        {/* Stats */}
        <div className="p-4 border-b border-[#1e2e1e]">
          <h2 className="text-white font-bold text-lg mb-4">Your Network</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#141a14] border border-[#1e2e1e] rounded-xl p-3">
              <p className="text-gray-500 text-xs">Connections</p>
              <p className="text-white font-bold text-xl">{connected.length}</p>
            </div>
            <div className="bg-[#141a14] border border-[#1e2e1e] rounded-xl p-3">
              <p className="text-gray-500 text-xs">Pending</p>
              <p className="text-amber-400 font-bold text-xl">{pending.length}</p>
            </div>
          </div>
        </div>

        {/* My Connections */}
        {connected.length > 0 && (
          <div className="p-4 border-b border-[#1e2e1e]">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">My Connections</h3>
            <div className="space-y-2">
              {connected.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPerson(p)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-[#141a14] rounded-lg transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-[#2d5a27] rounded-full flex items-center justify-center text-xs font-bold text-[#4ade80] flex-shrink-0">
                    {p.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{p.name}</p>
                    <p className="text-gray-500 text-xs truncate">{p.title}</p>
                  </div>
                  <div className="w-2 h-2 bg-[#4ade80] rounded-full flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <div className="p-4 border-b border-[#1e2e1e]">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Pending Requests</h3>
            <div className="space-y-2">
              {pending.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2">
                  <div className="w-8 h-8 bg-[#2d3a2d] rounded-full flex items-center justify-center text-xs font-bold text-[#4ade80] flex-shrink-0">
                    {p.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-300 text-sm font-medium truncate">{p.name}</p>
                    <p className="text-gray-600 text-xs truncate">{p.company}</p>
                  </div>
                  <Clock size={14} className="text-amber-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Deals */}
        <div className="p-4">
          <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Market Activity</h3>
          <div className="space-y-2">
            {[
              { label: "Active Listings", value: "0", icon: <TrendingUp size={12} />, color: "text-[#4ade80]" },
              { label: "Under LOI", value: "0", icon: <Star size={12} />, color: "text-amber-400" },
              { label: "Total AUM Visible", value: "$0", icon: <Network size={12} />, color: "text-blue-400" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between bg-[#141a14] border border-[#1e2e1e] rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={item.color}>{item.icon}</span>
                  <span className="text-gray-400 text-xs">{item.label}</span>
                </div>
                <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1e2e1e] bg-[#0d1410]">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search investors, executives, advisors..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#141a14] border border-[#1e2e1e] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#2d5a27] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-500" />
            <div className="flex gap-1">
              {industries.map(ind => (
                <button
                  key={ind}
                  onClick={() => setFilterIndustry(ind)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterIndustry === ind
                      ? "bg-[#1e3a1e] text-[#4ade80] border border-[#2d5a27]"
                      : "text-gray-500 hover:text-gray-300 hover:bg-[#141a14]"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* People Grid */}
          <div className={`flex-1 overflow-y-auto p-6 ${selectedPerson ? "max-w-xl" : ""}`}>
            <div className="mb-4">
              <h2 className="text-white font-bold text-xl">Professionals to Know</h2>
              <p className="text-gray-500 text-sm mt-1">{filtered.length} profiles in your industry</p>
            </div>
            <div className={`grid gap-4 ${selectedPerson ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2"}`}>
              {filtered.map(person => (
                <ProfessionalCard
                  key={person.id}
                  person={person}
                  isSelected={selectedPerson?.id === person.id}
                  onClick={() => setSelectedPerson(selectedPerson?.id === person.id ? null : person)}
                  onConnect={() => handleConnect(person.id)}
                />
              ))}
            </div>
          </div>

          {/* Person Detail */}
          {selectedPerson && (
            <div className="w-80 border-l border-[#1e2e1e] bg-[#0d1410] overflow-y-auto p-6">
              <PersonDetail
                person={selectedPerson}
                onClose={() => setSelectedPerson(null)}
                onConnect={() => handleConnect(selectedPerson.id)}
                onMessage={handleMessage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfessionalCard({
  person, isSelected, onClick, onConnect
}: {
  person: Professional;
  isSelected: boolean;
  onClick: () => void;
  onConnect: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border transition-all duration-200 p-5 ${
        isSelected
          ? "bg-[#1a2e1a] border-[#4ade80]/50 shadow-lg shadow-[#4ade80]/5"
          : "bg-[#141a14] border-[#1e2e1e] hover:border-[#2a3a2a]"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 bg-gradient-to-br from-[#2d5a27] to-[#1a3a1a] rounded-2xl flex items-center justify-center text-lg font-bold text-[#4ade80] shadow-lg shadow-green-900/20">
            {person.avatar}
          </div>
          {person.isConnected && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#4ade80] rounded-full flex items-center justify-center border-2 border-[#141a14]">
              <Check size={10} className="text-black" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-white font-bold text-sm">{person.name}</h3>
              <p className="text-[#4ade80] text-xs font-medium">{person.title}</p>
              <p className="text-gray-500 text-xs">{person.company}</p>
            </div>
          </div>

          <p className="text-gray-500 text-xs mt-2 line-clamp-2">{person.bio}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {person.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-[#1e3a1e] text-[#4ade80] text-xs rounded-full border border-[#2a4a2a]">
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-gray-600">
              <Network size={12} />
              <span className="text-xs">{person.connections.toLocaleString()} connections</span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onConnect(); }}
              disabled={person.isConnected || person.isPending}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                person.isConnected
                  ? "bg-[#1e3a1e] text-[#4ade80] cursor-default"
                  : person.isPending
                  ? "bg-[#2a3a2a] text-amber-400 cursor-default"
                  : "bg-[#2d5a27] hover:bg-[#3a7232] text-white"
              }`}
            >
              {person.isConnected ? (
                <><Check size={12} /> Connected</>
              ) : person.isPending ? (
                <><Clock size={12} /> Pending</>
              ) : (
                <><UserPlus size={12} /> Connect</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonDetail({
  person, onClose, onConnect, onMessage
}: {
  person: Professional;
  onClose: () => void;
  onConnect: () => void;
  onMessage: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold">Profile</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
          <ExternalLink size={16} />
        </button>
      </div>

      {/* Avatar & Identity */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-[#2d5a27] to-[#1a3a1a] rounded-3xl flex items-center justify-center text-2xl font-bold text-[#4ade80] mx-auto mb-3 shadow-xl shadow-green-900/30">
          {person.avatar}
        </div>
        <h3 className="text-white font-bold text-lg">{person.name}</h3>
        <p className="text-[#4ade80] text-sm font-medium">{person.title}</p>
        <p className="text-gray-500 text-sm">{person.company}</p>
        <p className="text-gray-600 text-xs mt-1">{person.location}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <div className="bg-[#141a14] border border-[#1e2e1e] rounded-xl p-3 text-center">
          <p className="text-white font-bold text-lg">{person.connections.toLocaleString()}</p>
          <p className="text-gray-500 text-xs">Connections</p>
        </div>
        <div className="bg-[#141a14] border border-[#1e2e1e] rounded-xl p-3 text-center">
          <p className="text-[#4ade80] font-bold text-lg">{person.industry === "Private Equity" ? "PE" : person.industry === "Family Office" ? "FO" : "GE"}</p>
          <p className="text-gray-500 text-xs">Specialty</p>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-[#141a14] border border-[#1e2e1e] rounded-xl p-4 mb-4">
        <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-2">About</h4>
        <p className="text-gray-300 text-sm leading-relaxed">{person.bio}</p>
      </div>

      {/* Expertise */}
      <div className="mb-6">
        <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Areas of Focus</h4>
        <div className="flex flex-wrap gap-2">
          {person.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-[#1e3a1e] text-[#4ade80] text-xs rounded-full border border-[#2a4a2a]">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={onConnect}
          disabled={person.isConnected || person.isPending}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors ${
            person.isConnected
              ? "bg-[#1e3a1e] text-[#4ade80] cursor-default border border-[#2d5a27]"
              : person.isPending
              ? "bg-[#2a3a2a] text-amber-400 cursor-default"
              : "bg-[#2d5a27] hover:bg-[#3a7232] text-white"
          }`}
        >
          {person.isConnected ? (
            <><Check size={16} /> Connected</>
          ) : person.isPending ? (
            <><Clock size={16} /> Request Pending</>
          ) : (
            <><UserPlus size={16} /> Connect</>
          )}
        </button>
        <button
          onClick={onMessage}
          className="w-full flex items-center justify-center gap-2 bg-[#141a14] hover:bg-[#1a241a] border border-[#2a3a2a] text-gray-300 py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          <MessageSquare size={16} /> Send Message
        </button>
      </div>
    </div>
  );
}
