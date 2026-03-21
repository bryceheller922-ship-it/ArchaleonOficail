import { useState, useCallback, useRef, useEffect } from "react";
import {
  MapPin,
  DollarSign,
  TrendingUp,
  X,
  Brain,
  MessageSquare,
  BookmarkPlus,
  Search,
  Building2,
  Loader2,
  Map,
  List,
  ChevronLeft,
  BarChart3,
  Filter,
} from "lucide-react";
import { mockListings, formatCurrency } from "@/data/mockListings";
import type { BusinessListing } from "@/types";

const GOOGLE_MAPS_API_KEY = "AIzaSyDZZSls5hZKtcHDWIC9LM-IaMIh6X3s0bU";

const MAP_STYLES = [
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ saturation: 36 }, { color: "#000000" }, { lightness: 40 }] },
  { featureType: "all", elementType: "labels.text.stroke", stylers: [{ visibility: "on" }, { color: "#000000" }, { lightness: 16 }] },
  { featureType: "all", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.fill", stylers: [{ color: "#000000" }, { lightness: 20 }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#000000" }, { lightness: 17 }, { weight: 1.2 }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#000000" }, { lightness: 20 }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#000000" }, { lightness: 21 }] },
  { featureType: "poi.business", elementType: "all", stylers: [{ visibility: "on" }, { color: "#3d4a3d" }] },
  { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#1d281d" }, { lightness: 17 }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#334d33" }, { lightness: 29 }, { weight: 0.2 }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#000000" }, { lightness: 18 }] },
  { featureType: "road.local", elementType: "geometry", stylers: [{ lightness: 16 }, { color: "#334d33" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#000000" }, { lightness: 19 }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0d1a2d" }, { lightness: 10 }] },
];

/* ─── Google Maps Loading Hook ─── */
function useGoogleMaps(apiKey: string) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const w = window as any;

    if (w.google?.maps) {
      setLoaded(true);
      return;
    }

    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com"]`
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => setLoaded(true));
      existingScript.addEventListener("error", () =>
        setError("Failed to load Google Maps")
      );
      return;
    }

    const callbackName = "__gmapsInit" + Date.now();
    w[callbackName] = () => {
      setLoaded(true);
      delete w[callbackName];
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setError(
        "Google Maps API could not be loaded. The API key may need Maps JavaScript API enabled in Google Cloud Console."
      );
      delete w[callbackName];
    };

    document.head.appendChild(script);

    return () => {
      delete w[callbackName];
    };
  }, [apiKey]);

  return { loaded, error };
}

/* ─── Google Maps Component ─── */
function GoogleMapView({
  listings,
  selectedId,
  onSelectListing,
}: {
  listings: BusinessListing[];
  selectedId: string | null;
  onSelectListing: (listing: BusinessListing) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  useEffect(() => {
    const g = (window as any).google;
    if (!mapContainerRef.current || !g?.maps) return;
    if (mapRef.current) return;

    const map = new g.maps.Map(mapContainerRef.current, {
      center: { lat: 39.8283, lng: -98.5795 },
      zoom: 4,
      styles: MAP_STYLES,
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: {
        position: g.maps.ControlPosition.RIGHT_CENTER,
      },
      backgroundColor: "#0a0a0a",
    });

    mapRef.current = map;
    infoWindowRef.current = new g.maps.InfoWindow();

    const newMarkers = listings.map((listing) => {
      const marker = new g.maps.Marker({
        position: { lat: listing.lat, lng: listing.lng },
        map,
        icon: {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
          fillColor: "#2d6a2d",
          fillOpacity: 0.8,
          strokeColor: "#1a3a1a",
          strokeWeight: 1.5,
          scale: 1.5,
          anchor: new g.maps.Point(12, 22),
        },
        title: listing.name,
      });

      marker.addListener("click", () => {
        onSelectListing(listing);
      });

      return marker;
    });

    markersRef.current = newMarkers;

    return () => {
      newMarkers.forEach((m: any) => m.setMap(null));
    };
  }, [listings, onSelectListing]);

  useEffect(() => {
    const g = (window as any).google;
    if (!mapRef.current || !g?.maps) return;

    markersRef.current.forEach((marker: any, i: number) => {
      const listing = listings[i];
      if (!listing) return;

      const isSelected = listing.id === selectedId;
      marker.setIcon({
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
        fillColor: isSelected ? "#4da64d" : "#2d6a2d",
        fillOpacity: isSelected ? 1 : 0.7,
        strokeColor: isSelected ? "#6bbf6b" : "#1a3a1a",
        strokeWeight: isSelected ? 2.5 : 1.5,
        scale: isSelected ? 2 : 1.5,
        anchor: new g.maps.Point(12, 22),
      });

      if (isSelected && mapRef.current) {
        mapRef.current.panTo({ lat: listing.lat, lng: listing.lng });
        mapRef.current.setZoom(8);

        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div style="background:#111;color:#ccc;padding:10px 14px;border-radius:10px;font-family:'JetBrains Mono',monospace;min-width:200px;border:1px solid #2d6a2d;">
              <p style="font-size:12px;font-weight:600;margin:0 0 4px 0;color:#e0e0e0;">${listing.name}</p>
              <p style="font-size:10px;color:#777;margin:0 0 6px 0;">${listing.location}</p>
              <p style="font-size:14px;color:#4da64d;margin:0;font-weight:700;">${formatCurrency(listing.price)}</p>
            </div>
          `);
          infoWindowRef.current.open(mapRef.current, marker);
        }
      }
    });
  }, [selectedId, listings]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ minHeight: "100%" }}
    />
  );
}

/* ─── Fallback Map (when Google Maps fails) ─── */
function FallbackMap({
  listings,
  selectedId,
  onSelectListing,
}: {
  listings: BusinessListing[];
  selectedId: string | null;
  onSelectListing: (listing: BusinessListing) => void;
}) {
  // Simple SVG-based US map with positioned dots
  const latLngToXY = (lat: number, lng: number) => {
    // Approximate projection for continental US
    const x = ((lng + 130) / 65) * 100;
    const y = ((50 - lat) / 25) * 100;
    return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
  };

  return (
    <div className="w-full h-full bg-dark-900 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 dotted-grid opacity-40" />

      {/* US outline approximation */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {Array.from({ length: 10 }).map((_, i) => (
          <g key={i}>
            <line x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="#1a3a1a" strokeWidth="0.2" strokeDasharray="1 3" />
            <line x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#1a3a1a" strokeWidth="0.2" strokeDasharray="1 3" />
          </g>
        ))}

        {/* Listing markers */}
        {listings.map((listing) => {
          const pos = latLngToXY(listing.lat, listing.lng);
          const isSelected = listing.id === selectedId;
          return (
            <g
              key={listing.id}
              onClick={() => onSelectListing(listing)}
              className="cursor-pointer"
            >
              {/* Pulse ring for selected */}
              {isSelected && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="3"
                  fill="none"
                  stroke="#4da64d"
                  strokeWidth="0.3"
                  opacity="0.5"
                >
                  <animate attributeName="r" from="2" to="5" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Marker dot */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? "1.8" : "1.2"}
                fill={isSelected ? "#4da64d" : "#2d6a2d"}
                stroke={isSelected ? "#6bbf6b" : "#1a3a1a"}
                strokeWidth="0.3"
                className="transition-all duration-300"
              />
              {/* Label */}
              {isSelected && (
                <g>
                  <rect
                    x={pos.x - 12}
                    y={pos.y - 5.5}
                    width="24"
                    height="4"
                    rx="1"
                    fill="#111"
                    stroke="#2d6a2d"
                    strokeWidth="0.2"
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 3}
                    textAnchor="middle"
                    fontSize="1.8"
                    fontFamily="monospace"
                    fill="#ccc"
                  >
                    {listing.name.length > 18 ? listing.name.slice(0, 18) + "..." : listing.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 floating-panel rounded-lg px-3 py-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent-500" />
        <span className="text-[9px] font-mono text-dark-200">
          {listings.length} locations
        </span>
      </div>
    </div>
  );
}

/* ─── Listing Card ─── */
function ListingCard({
  listing,
  isSelected,
  onClick,
  compact,
}: {
  listing: BusinessListing;
  isSelected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border transition-all duration-200 group ${
        compact ? "p-2.5" : "p-3.5"
      } ${
        isSelected
          ? "bg-accent-900/30 border-accent-700/60 shadow-[0_0_20px_rgba(45,106,45,0.1)]"
          : "bg-dark-700/40 border-dark-500/50 hover:border-dark-400 hover:bg-dark-700/60"
      }`}
    >
      <div className="flex items-start justify-between mb-1.5">
        <h3
          className={`font-medium text-light-text font-mono leading-tight pr-2 ${
            compact ? "text-[11px]" : "text-xs md:text-sm"
          }`}
        >
          {listing.name}
        </h3>
        <span
          className={`font-mono text-accent-400 bg-accent-900/40 border border-accent-800/30 px-2 py-0.5 rounded-md shrink-0 ${
            compact ? "text-[8px]" : "text-[9px]"
          }`}
        >
          {listing.category}
        </span>
      </div>

      <div className="flex items-center gap-1.5 mb-2">
        <MapPin size={compact ? 9 : 10} className="text-dark-200" />
        <span
          className={`text-dark-100 font-mono ${compact ? "text-[9px]" : "text-[10px]"}`}
        >
          {listing.location}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <DollarSign
            size={compact ? 10 : 12}
            className="text-accent-400"
          />
          <span
            className={`font-semibold text-accent-300 font-mono ${
              compact ? "text-[11px]" : "text-xs md:text-sm"
            }`}
          >
            {formatCurrency(listing.price)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp
            size={compact ? 8 : 10}
            className="text-dark-200"
          />
          <span
            className={`text-dark-100 font-mono ${compact ? "text-[8px]" : "text-[10px]"}`}
          >
            Rev: {formatCurrency(listing.revenue)}
          </span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <BarChart3
            size={compact ? 8 : 10}
            className="text-dark-200"
          />
          <span
            className={`text-dark-100 font-mono ${compact ? "text-[8px]" : "text-[10px]"}`}
          >
            {((listing.profit / listing.revenue) * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </button>
  );
}

/* ─── Detail Content ─── */
function DetailContent({ listing }: { listing: BusinessListing }) {
  return (
    <>
      <div>
        <h2 className="text-base md:text-lg font-semibold text-white-text font-mono mb-1.5">
          {listing.name}
        </h2>
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-accent-500" />
          <span className="text-xs text-gray-text font-mono">
            {listing.location}
          </span>
        </div>
      </div>

      {/* Price card */}
      <div className="bg-gradient-to-br from-accent-900/40 to-accent-900/20 border border-accent-800/40 rounded-xl p-4">
        <p className="text-[10px] text-accent-400 font-mono uppercase tracking-wider mb-1">
          Asking Price
        </p>
        <p className="text-2xl md:text-3xl font-bold text-accent-300 font-mono">
          {formatCurrency(listing.price)}
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          {
            label: "Annual Revenue",
            value: formatCurrency(listing.revenue),
          },
          {
            label: "Annual Profit",
            value: formatCurrency(listing.profit),
          },
          {
            label: "Price Multiple",
            value: `${(listing.price / listing.revenue).toFixed(1)}x Rev`,
          },
          {
            label: "Profit Margin",
            value: `${((listing.profit / listing.revenue) * 100).toFixed(0)}%`,
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="bg-dark-700/50 border border-dark-500/40 rounded-xl p-3"
          >
            <p className="text-[9px] text-dark-200 font-mono uppercase tracking-wider mb-1">
              {metric.label}
            </p>
            <p className="text-xs md:text-sm font-semibold text-light-text font-mono">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* Description */}
      <div>
        <p className="text-[10px] text-dark-200 font-mono uppercase tracking-wider mb-2">
          Description
        </p>
        <p className="text-xs text-gray-text font-mono leading-relaxed">
          {listing.description}
        </p>
      </div>

      {/* AI Analysis */}
      <div className="bg-gradient-to-br from-accent-900/20 to-dark-700/40 border border-accent-800/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <Brain size={14} className="text-accent-400" />
          <p className="text-[10px] text-accent-400 font-mono uppercase tracking-wider">
            AI Quick Analysis
          </p>
        </div>
        <p className="text-xs text-gray-text font-mono leading-relaxed">
          {listing.profit / listing.price > 0.15
            ? `Strong ROI potential at ${((listing.profit / listing.price) * 100).toFixed(1)}% annual return. Revenue multiple of ${(listing.price / listing.revenue).toFixed(1)}x is ${listing.price / listing.revenue < 3 ? "below" : "at"} market average. Recommend deeper financial due diligence.`
            : `Moderate ROI at ${((listing.profit / listing.price) * 100).toFixed(1)}% annual return. Consider negotiating price or identifying operational efficiencies to improve margins.`}
        </p>
      </div>

      {/* Listed by */}
      <div className="bg-dark-700/50 border border-dark-500/40 rounded-xl p-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-dark-600 border border-dark-400 flex items-center justify-center text-xs font-mono text-accent-400">
          {listing.ownerName.charAt(0)}
        </div>
        <div>
          <p className="text-[9px] text-dark-200 font-mono uppercase tracking-wider">
            Listed By
          </p>
          <p className="text-sm text-light-text font-mono">
            {listing.ownerName}
          </p>
        </div>
      </div>
    </>
  );
}

/* ─── Detail Actions ─── */
function DetailActions() {
  return (
    <div className="p-3 md:p-4 border-t border-dark-500/50 space-y-2 safe-bottom bg-dark-800/80 backdrop-blur-panel">
      <button className="w-full flex items-center justify-center gap-2 bg-accent-700 hover:bg-accent-600 text-white font-mono text-xs py-3 rounded-xl transition-colors shadow-lg shadow-accent-900/30">
        <Brain size={14} />
        Analyze with AI
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button className="flex items-center justify-center gap-2 bg-dark-600/60 hover:bg-dark-500 text-light-text font-mono text-xs py-2.5 rounded-xl transition-colors border border-dark-400/50">
          <MessageSquare size={12} />
          Message
        </button>
        <button className="flex items-center justify-center gap-2 bg-dark-600/60 hover:bg-dark-500 text-light-text font-mono text-xs py-2.5 rounded-xl transition-colors border border-dark-400/50">
          <BookmarkPlus size={12} />
          Save
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function MarketplacePage() {
  const [detailPanel, setDetailPanel] = useState<BusinessListing | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [showFilters, setShowFilters] = useState(false);

  const { loaded: mapsLoaded, error: mapsError } =
    useGoogleMaps(GOOGLE_MAPS_API_KEY);

  const handleListingClick = useCallback(
    (listing: BusinessListing) => {
      setDetailPanel(listing);
    },
    []
  );

  const categories = [
    "All",
    ...Array.from(new Set(mockListings.map((l) => l.category))),
  ];

  const filteredListings = mockListings.filter((l) => {
    const matchesSearch =
      !searchQuery ||
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || l.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderMap = () => {
    if (mapsLoaded) {
      return (
        <GoogleMapView
          listings={filteredListings}
          selectedId={detailPanel?.id || null}
          onSelectListing={handleListingClick}
        />
      );
    }
    if (mapsError) {
      return (
        <FallbackMap
          listings={filteredListings}
          selectedId={detailPanel?.id || null}
          onSelectListing={handleListingClick}
        />
      );
    }
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2
            size={24}
            className="text-accent-500 animate-spin mx-auto mb-3"
          />
          <p className="text-dark-200 text-xs font-mono">
            Loading Maps...
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full bg-dark-900 relative">
      {/* ─── Desktop Left Panel ─── */}
      <div className="hidden md:flex w-96 bg-dark-800/80 border-r border-dark-500/50 flex-col shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-dark-500/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-accent-900/50 border border-accent-700/30 flex items-center justify-center">
              <Building2 size={14} className="text-accent-400" />
            </div>
            <h2 className="font-mono text-sm text-light-text">
              MARKETPLACE
            </h2>
            <span className="text-[10px] font-mono text-dark-200 ml-auto bg-dark-600 px-2 py-0.5 rounded-full">
              {filteredListings.length}
            </span>
          </div>

          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search businesses..."
              className="w-full bg-dark-700/60 border border-dark-400/50 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono text-light-text placeholder-dark-300 focus:outline-none focus:border-accent-600/60 transition-colors"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-all ${
                  selectedCategory === cat
                    ? "bg-accent-800/60 text-accent-200 border border-accent-700/50 shadow-sm"
                    : "bg-dark-600/40 text-dark-100 border border-dark-500/30 hover:bg-dark-500/40 hover:text-light-text"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Listings */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isSelected={detailPanel?.id === listing.id}
              onClick={() => handleListingClick(listing)}
            />
          ))}
          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <Search size={24} className="text-dark-400 mx-auto mb-2" />
              <p className="text-xs font-mono text-dark-200">No listings found</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Mobile View ─── */}
      <div className="flex-1 flex flex-col md:hidden">
        {/* Mobile Header */}
        <div className="p-3 bg-dark-800/80 border-b border-dark-500/50 backdrop-blur-panel">
          <div className="flex items-center gap-2 mb-2.5">
            <Building2 size={14} className="text-accent-400" />
            <h2 className="font-mono text-xs text-light-text">
              MARKETPLACE
            </h2>
            <span className="text-[10px] font-mono text-dark-200 ml-auto bg-dark-600 px-2 py-0.5 rounded-full">
              {filteredListings.length}
            </span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-300"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-dark-700/60 border border-dark-400/50 rounded-xl pl-8 pr-3 py-2 text-[11px] font-mono text-light-text placeholder-dark-300 focus:outline-none focus:border-accent-600/60 transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-xl border text-[10px] font-mono transition-colors ${
                showFilters
                  ? "bg-accent-800/40 text-accent-200 border-accent-700/40"
                  : "bg-dark-700/60 text-dark-200 border-dark-400/50"
              }`}
            >
              <Filter size={12} />
            </button>
            <div className="flex bg-dark-700/60 rounded-xl border border-dark-400/50 overflow-hidden">
              <button
                onClick={() => setMobileView("list")}
                className={`px-3 py-2 transition-colors ${
                  mobileView === "list"
                    ? "bg-accent-800/50 text-accent-200"
                    : "text-dark-200"
                }`}
              >
                <List size={12} />
              </button>
              <button
                onClick={() => setMobileView("map")}
                className={`px-3 py-2 transition-colors ${
                  mobileView === "map"
                    ? "bg-accent-800/50 text-accent-200"
                    : "text-dark-200"
                }`}
              >
                <Map size={12} />
              </button>
            </div>
          </div>

          {/* Category pills */}
          {showFilters && (
            <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-1 -mx-1 px-1 animate-fadeIn">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-all whitespace-nowrap shrink-0 ${
                    selectedCategory === cat
                      ? "bg-accent-800/60 text-accent-200 border border-accent-700/50"
                      : "bg-dark-600/40 text-dark-100 border border-dark-500/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile List */}
        {mobileView === "list" && (
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isSelected={detailPanel?.id === listing.id}
                onClick={() => handleListingClick(listing)}
                compact
              />
            ))}
          </div>
        )}

        {/* Mobile Map */}
        {mobileView === "map" && (
          <div className="flex-1 relative bg-dark-900">
            {renderMap()}
          </div>
        )}
      </div>

      {/* ─── Desktop Map ─── */}
      <div className="hidden md:block flex-1 relative bg-dark-900">
        {renderMap()}

        {/* Map overlay info */}
        {(mapsLoaded || mapsError) && (
          <div className="absolute bottom-4 left-4 z-10">
            <div className="floating-panel rounded-lg px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-500" />
              <span className="text-[10px] font-mono text-dark-200">
                {filteredListings.length} locations
                {mapsError ? " (Interactive Fallback)" : ""}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Detail Panel ─── */}
      {detailPanel && (
        <>
          {/* Desktop */}
          <div className="hidden md:flex w-[420px] bg-dark-800/90 border-l border-dark-500/50 flex-col shrink-0 animate-slideIn backdrop-blur-panel">
            <div className="p-4 border-b border-dark-500/50 flex items-center justify-between">
              <h3 className="font-mono text-sm text-light-text">
                DETAILS
              </h3>
              <button
                onClick={() => setDetailPanel(null)}
                className="text-dark-200 hover:text-light-text transition-colors p-1 rounded-lg hover:bg-dark-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <DetailContent listing={detailPanel} />
            </div>

            <DetailActions />
          </div>

          {/* Mobile overlay */}
          <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-dark-900 animate-slideInRight">
            <div className="h-12 bg-dark-800 border-b border-dark-500/50 flex items-center px-3 shrink-0">
              <button
                onClick={() => setDetailPanel(null)}
                className="text-dark-200 hover:text-light-text transition-colors p-1 mr-2"
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-mono text-xs text-light-text">
                BUSINESS DETAILS
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <DetailContent listing={detailPanel} />
            </div>

            <DetailActions />
          </div>
        </>
      )}
    </div>
  );
}
