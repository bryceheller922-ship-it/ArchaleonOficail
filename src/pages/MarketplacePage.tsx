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
  AlertTriangle,
  Map,
  List,
  ChevronLeft,
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
  { featureType: "road.highway", elementType: "all", stylers: [{ visibility: "on" }, { lightness: -65 }, { gamma: 0.76 }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#334d33" }] },
  { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#1d281d" }, { lightness: 17 }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#334d33" }, { lightness: 29 }, { weight: 0.2 }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#000000" }, { lightness: 18 }] },
  { featureType: "road.local", elementType: "all", stylers: [{ visibility: "on" }] },
  { featureType: "road.local", elementType: "geometry", stylers: [{ lightness: 16 }, { color: "#334d33" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#000000" }, { lightness: 19 }] },
  { featureType: "water", elementType: "all", stylers: [{ visibility: "on" }, { color: "#3b527d" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }, { lightness: 17 }] },
];

/* ─── Hook to load Google Maps JS API directly ─── */
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
      setError("Failed to load Google Maps JavaScript API. Check your API key and ensure the Maps JavaScript API is enabled in Google Cloud Console.");
      delete w[callbackName];
    };

    document.head.appendChild(script);

    return () => {
      delete w[callbackName];
    };
  }, [apiKey]);

  return { loaded, error };
}

/* ─── Map component using direct Google Maps API ─── */
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
            <div style="background:#1a1a1a;color:#ccc;padding:8px 12px;border-radius:8px;font-family:'JetBrains Mono',monospace;min-width:180px;border:1px solid #2d6a2d;">
              <p style="font-size:12px;font-weight:bold;margin:0 0 4px 0;color:#e0e0e0;">${listing.name}</p>
              <p style="font-size:10px;color:#777;margin:0 0 4px 0;">${listing.location}</p>
              <p style="font-size:13px;color:#4da64d;margin:0;font-weight:600;">${formatCurrency(listing.price)}</p>
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

export default function MarketplacePage() {
  const [detailPanel, setDetailPanel] = useState<BusinessListing | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  // Mobile view toggle: "list" or "map"
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const { loaded: mapsLoaded, error: mapsError } = useGoogleMaps(GOOGLE_MAPS_API_KEY);

  const handleListingClick = useCallback((listing: BusinessListing) => {
    setDetailPanel(listing);
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(mockListings.map((l) => l.category))),
  ];

  const filteredListings = mockListings.filter((l) => {
    const matchesSearch =
      !searchQuery ||
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || l.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-full bg-dark-900 relative">
      {/* ─── Desktop Left Panel - Listings (hidden on mobile) ─── */}
      <div className="hidden md:flex w-96 bg-dark-800 border-r border-dark-500 flex-col shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-dark-500">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={16} className="text-accent-500" />
            <h2 className="font-mono text-sm text-light-text">MARKETPLACE</h2>
            <span className="text-xs font-mono text-dark-200 ml-auto">
              {filteredListings.length} listings
            </span>
          </div>

          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-200"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search businesses..."
              className="w-full bg-dark-700 border border-dark-400 rounded pl-9 pr-3 py-2 text-xs font-mono text-light-text placeholder-dark-200 focus:outline-none focus:border-accent-600 transition-colors"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
                  selectedCategory === cat
                    ? "bg-accent-800 text-accent-200 border border-accent-700"
                    : "bg-dark-600 text-dark-100 border border-dark-400 hover:bg-dark-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Listing List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredListings.map((listing) => (
            <button
              key={listing.id}
              onClick={() => handleListingClick(listing)}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                detailPanel?.id === listing.id
                  ? "bg-accent-900/40 border-accent-700"
                  : "bg-dark-700 border-dark-500 hover:border-dark-300"
              }`}
            >
              <div className="flex items-start justify-between mb-1.5">
                <h3 className="text-sm font-medium text-light-text font-mono leading-tight pr-2">
                  {listing.name}
                </h3>
                <span className="text-[10px] font-mono text-accent-400 bg-accent-900/50 px-1.5 py-0.5 rounded shrink-0">
                  {listing.category}
                </span>
              </div>

              <div className="flex items-center gap-1 mb-2">
                <MapPin size={10} className="text-dark-200" />
                <span className="text-[11px] text-dark-100 font-mono">
                  {listing.location}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <DollarSign size={12} className="text-accent-400" />
                  <span className="text-sm font-semibold text-accent-300 font-mono">
                    {formatCurrency(listing.price)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp size={10} className="text-dark-200" />
                  <span className="text-[10px] text-dark-100 font-mono">
                    Rev: {formatCurrency(listing.revenue)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Mobile View ─── */}
      <div className="flex-1 flex flex-col md:hidden">
        {/* Mobile Header */}
        <div className="p-3 bg-dark-800 border-b border-dark-500">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={14} className="text-accent-500" />
            <h2 className="font-mono text-xs text-light-text">MARKETPLACE</h2>
            <span className="text-[10px] font-mono text-dark-200 ml-auto">
              {filteredListings.length} listings
            </span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-200"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-dark-700 border border-dark-400 rounded pl-8 pr-3 py-2 text-[11px] font-mono text-light-text placeholder-dark-200 focus:outline-none focus:border-accent-600 transition-colors"
              />
            </div>
            {/* List/Map toggle */}
            <div className="flex bg-dark-700 rounded border border-dark-400 overflow-hidden">
              <button
                onClick={() => setMobileView("list")}
                className={`px-3 py-2 flex items-center gap-1 text-[10px] font-mono transition-colors ${
                  mobileView === "list"
                    ? "bg-accent-800 text-accent-200"
                    : "text-dark-200"
                }`}
              >
                <List size={12} />
              </button>
              <button
                onClick={() => setMobileView("map")}
                className={`px-3 py-2 flex items-center gap-1 text-[10px] font-mono transition-colors ${
                  mobileView === "map"
                    ? "bg-accent-800 text-accent-200"
                    : "text-dark-200"
                }`}
              >
                <Map size={12} />
              </button>
            </div>
          </div>

          {/* Category pills - horizontal scroll */}
          <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 -mx-1 px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? "bg-accent-800 text-accent-200 border border-accent-700"
                    : "bg-dark-600 text-dark-100 border border-dark-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile List View */}
        {mobileView === "list" && (
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredListings.map((listing) => (
              <button
                key={listing.id}
                onClick={() => handleListingClick(listing)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                  detailPanel?.id === listing.id
                    ? "bg-accent-900/40 border-accent-700"
                    : "bg-dark-700 border-dark-500"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-xs font-medium text-light-text font-mono leading-tight pr-2">
                    {listing.name}
                  </h3>
                  <span className="text-[9px] font-mono text-accent-400 bg-accent-900/50 px-1.5 py-0.5 rounded shrink-0">
                    {listing.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-1.5">
                  <MapPin size={9} className="text-dark-200" />
                  <span className="text-[10px] text-dark-100 font-mono">{listing.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <DollarSign size={11} className="text-accent-400" />
                    <span className="text-xs font-semibold text-accent-300 font-mono">
                      {formatCurrency(listing.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={9} className="text-dark-200" />
                    <span className="text-[9px] text-dark-100 font-mono">
                      Rev: {formatCurrency(listing.revenue)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Mobile Map View */}
        {mobileView === "map" && (
          <div className="flex-1 relative bg-dark-900">
            {mapsLoaded ? (
              <GoogleMapView
                listings={filteredListings}
                selectedId={detailPanel?.id || null}
                onSelectListing={handleListingClick}
              />
            ) : mapsError ? (
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center">
                  <AlertTriangle size={24} className="text-yellow-500/60 mx-auto mb-2" />
                  <p className="text-xs text-light-text font-mono mb-1">Map Loading Issue</p>
                  <p className="text-[10px] text-dark-200 font-mono">{mapsError}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Loader2 size={20} className="text-accent-500 animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Desktop Map ─── */}
      <div className="hidden md:block flex-1 relative bg-dark-900">
        {mapsLoaded ? (
          <GoogleMapView
            listings={filteredListings}
            selectedId={detailPanel?.id || null}
            onSelectListing={handleListingClick}
          />
        ) : mapsError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center floating-panel rounded-2xl p-8 max-w-md">
              <AlertTriangle
                size={32}
                className="text-yellow-500/60 mx-auto mb-3"
              />
              <p className="text-sm text-light-text font-mono mb-2">
                Map Loading Issue
              </p>
              <p className="text-xs text-dark-200 font-mono mb-4 leading-relaxed">
                {mapsError}
              </p>
              <p className="text-[10px] text-dark-300 font-mono mb-3 uppercase tracking-widest">Listings Overview</p>
              <div className="grid grid-cols-2 gap-2">
                {filteredListings.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleListingClick(l)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      detailPanel?.id === l.id
                        ? "bg-accent-900/40 border-accent-700"
                        : "bg-dark-700 border-dark-400 hover:border-accent-600"
                    }`}
                  >
                    <p className="text-[10px] font-mono text-light-text truncate">
                      {l.name}
                    </p>
                    <p className="text-[9px] font-mono text-dark-200 mt-0.5">
                      {l.location}
                    </p>
                    <p className="text-[11px] font-mono text-accent-400 mt-1">
                      {formatCurrency(l.price)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2
                size={24}
                className="text-accent-500 animate-spin mx-auto mb-3"
              />
              <p className="text-dark-200 text-xs font-mono">
                Loading Google Maps...
              </p>
              <p className="text-dark-300 text-[10px] font-mono mt-1">
                Initializing JavaScript API
              </p>
            </div>
          </div>
        )}

        {/* Map overlay info */}
        {mapsLoaded && (
          <div className="absolute bottom-4 left-4 z-10">
            <div className="floating-panel rounded-lg px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-500" />
              <span className="text-[10px] font-mono text-dark-200">
                {filteredListings.length} pins · Google Maps JS API
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Detail Panel - Desktop side panel ─── */}
      {detailPanel && (
        <>
          {/* Desktop detail panel */}
          <div className="hidden md:flex w-96 bg-dark-800 border-l border-dark-500 flex-col shrink-0 animate-slideIn">
            <div className="p-4 border-b border-dark-500 flex items-center justify-between">
              <h3 className="font-mono text-sm text-light-text">
                BUSINESS DETAILS
              </h3>
              <button
                onClick={() => setDetailPanel(null)}
                className="text-dark-200 hover:text-light-text transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <DetailContent listing={detailPanel} />
            </div>

            <DetailActions />
          </div>

          {/* Mobile detail overlay */}
          <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-dark-900 animate-slideInRight">
            <div className="h-12 bg-dark-800 border-b border-dark-500 flex items-center px-3 shrink-0">
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

/* ─── Shared Detail Content ─── */
function DetailContent({ listing }: { listing: BusinessListing }) {
  return (
    <>
      <div>
        <h2 className="text-base md:text-lg font-semibold text-white-text font-mono mb-1">
          {listing.name}
        </h2>
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-accent-500" />
          <span className="text-xs text-gray-text font-mono">
            {listing.location}
          </span>
        </div>
      </div>

      <div className="bg-accent-900/30 border border-accent-800/50 rounded-lg p-3 md:p-4">
        <p className="text-[10px] text-accent-400 font-mono uppercase tracking-wider mb-1">
          Asking Price
        </p>
        <p className="text-xl md:text-2xl font-bold text-accent-300 font-mono">
          {formatCurrency(listing.price)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-3">
        <div className="bg-dark-700 border border-dark-400 rounded-lg p-3">
          <p className="text-[10px] text-dark-100 font-mono uppercase tracking-wider mb-1">
            Annual Revenue
          </p>
          <p className="text-xs md:text-sm font-semibold text-light-text font-mono">
            {formatCurrency(listing.revenue)}
          </p>
        </div>
        <div className="bg-dark-700 border border-dark-400 rounded-lg p-3">
          <p className="text-[10px] text-dark-100 font-mono uppercase tracking-wider mb-1">
            Annual Profit
          </p>
          <p className="text-xs md:text-sm font-semibold text-light-text font-mono">
            {formatCurrency(listing.profit)}
          </p>
        </div>
        <div className="bg-dark-700 border border-dark-400 rounded-lg p-3">
          <p className="text-[10px] text-dark-100 font-mono uppercase tracking-wider mb-1">
            Price Multiple
          </p>
          <p className="text-xs md:text-sm font-semibold text-light-text font-mono">
            {(listing.price / listing.revenue).toFixed(1)}x Rev
          </p>
        </div>
        <div className="bg-dark-700 border border-dark-400 rounded-lg p-3">
          <p className="text-[10px] text-dark-100 font-mono uppercase tracking-wider mb-1">
            Profit Margin
          </p>
          <p className="text-xs md:text-sm font-semibold text-light-text font-mono">
            {((listing.profit / listing.revenue) * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      <div>
        <p className="text-[10px] text-dark-100 font-mono uppercase tracking-wider mb-2">
          Description
        </p>
        <p className="text-xs text-gray-text font-mono leading-relaxed">
          {listing.description}
        </p>
      </div>

      <div className="bg-dark-700 border border-accent-800/30 rounded-lg p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain size={14} className="text-accent-400" />
          <p className="text-[10px] text-accent-400 font-mono uppercase tracking-wider">
            AI Quick Analysis
          </p>
        </div>
        <p className="text-xs text-gray-text font-mono leading-relaxed">
          {listing.profit / listing.price > 0.15
            ? `Strong ROI potential at ${((listing.profit / listing.price) * 100).toFixed(1)}% annual return. Revenue multiple of ${(listing.price / listing.revenue).toFixed(1)}x is ${listing.price / listing.revenue < 3 ? "below" : "at"} market average. Recommend deeper financial due diligence.`
            : `Moderate ROI at ${((listing.profit / listing.price) * 100).toFixed(1)}% annual return. Consider negotiating price or identifying operational efficiencies to improve margins. Full analysis recommended.`}
        </p>
      </div>

      <div className="bg-dark-700 border border-dark-400 rounded-lg p-3">
        <p className="text-[10px] text-dark-100 font-mono uppercase tracking-wider mb-1">
          Listed By
        </p>
        <p className="text-sm text-light-text font-mono">
          {listing.ownerName}
        </p>
      </div>
    </>
  );
}

/* ─── Shared Detail Actions ─── */
function DetailActions() {
  return (
    <div className="p-3 md:p-4 border-t border-dark-500 space-y-2 safe-bottom">
      <button className="w-full flex items-center justify-center gap-2 bg-accent-700 hover:bg-accent-600 text-white-text font-mono text-xs py-2.5 rounded-lg transition-colors">
        <Brain size={14} />
        Analyze Deal
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button className="flex items-center justify-center gap-2 bg-dark-600 hover:bg-dark-500 text-light-text font-mono text-xs py-2.5 rounded-lg transition-colors border border-dark-400">
          <MessageSquare size={12} />
          Message
        </button>
        <button className="flex items-center justify-center gap-2 bg-dark-600 hover:bg-dark-500 text-light-text font-mono text-xs py-2.5 rounded-lg transition-colors border border-dark-400">
          <BookmarkPlus size={12} />
          Add to Notes
        </button>
      </div>
    </div>
  );
}
