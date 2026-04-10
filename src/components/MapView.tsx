import { useEffect, useRef, useState, useCallback } from "react";
import { Business } from "../lib/mockData";
import { MapPin } from "lucide-react";

interface MapViewProps {
  businesses: Business[];
  selectedBusiness: Business | null;
  onSelectBusiness: (b: Business) => void;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

// Zillow-style: price pill SVG for zoomed-in view
function makePricePill(price: string, isSelected: boolean): string {
  const bg = isSelected ? "#4ade80" : "#1e3a1e";
  const border = isSelected ? "#4ade80" : "#4ade80";
  const textColor = isSelected ? "#000000" : "#4ade80";
  const w = Math.max(price.length * 8 + 24, 56);
  const h = 28;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h + 8}">
    <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="6" fill="${bg}" stroke="${border}" stroke-width="${isSelected ? 2 : 1}"/>
    <text x="${w / 2}" y="${h / 2 + 1}" text-anchor="middle" dominant-baseline="central"
      fill="${textColor}" font-family="Inter,system-ui,sans-serif" font-size="11" font-weight="700">${price}</text>
    <polygon points="${w / 2 - 5},${h} ${w / 2 + 5},${h} ${w / 2},${h + 7}" fill="${bg}" stroke="${border}" stroke-width="${isSelected ? 2 : 1}"/>
    <line x1="${w / 2 - 4}" y1="${h - 1}" x2="${w / 2 + 4}" y2="${h - 1}" stroke="${bg}" stroke-width="2"/>
  </svg>`;
}

// Small dot for zoomed-out view
function makeDot(isSelected: boolean): string {
  const size = isSelected ? 16 : 10;
  const r = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <circle cx="${r}" cy="${r}" r="${r - 1}" fill="${isSelected ? "#4ade80" : "#2d5a27"}" stroke="#4ade80" stroke-width="1.5"
      ${isSelected ? 'opacity="1"' : 'opacity="0.85"'}/>
  </svg>`;
}

const ZOOM_THRESHOLD = 7; // Below this = dots, above = price pills

export default function MapView({ businesses, selectedBusiness, onSelectBusiness }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(4);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google) return;
      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 39.5, lng: -98.35 },
          zoom: 4,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#0d1410" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#0d1410" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#4a6a4a" }] },
            { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#6aaa6a" }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#4a6a4a" }] },
            { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#111811" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2a1a" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1e3a1e" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#060e06" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#2a4a2a" }] },
          ],
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_CENTER },
        });

        map.addListener("zoom_changed", () => {
          setZoomLevel(map.getZoom() || 4);
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new window.google.maps.InfoWindow();
        setMapLoaded(true);
      } catch {
        setMapError(true);
      }
    };

    if (window.google?.maps) {
      initMap();
    } else {
      const interval = setInterval(() => {
        if (window.google?.maps) { clearInterval(interval); initMap(); }
      }, 200);
      const timeout = setTimeout(() => { clearInterval(interval); setMapError(true); }, 8000);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }
  }, []);

  // Update markers when businesses, zoom, or selection changes
  const updateMarkers = useCallback(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current.clear();

    const showPrice = zoomLevel >= ZOOM_THRESHOLD;

    businesses.forEach(business => {
      if (!business.lat || !business.lng) return;
      const isSelected = selectedBusiness?.id === business.id;
      const price = business.askingPrice || business.valuation || "";

      let svgString: string;
      let iconW: number;
      let iconH: number;

      if (showPrice && price && price !== "N/A") {
        svgString = makePricePill(price, isSelected);
        iconW = Math.max(price.length * 8 + 24, 56);
        iconH = 36;
      } else {
        svgString = makeDot(isSelected);
        iconW = isSelected ? 16 : 10;
        iconH = isSelected ? 16 : 10;
      }

      const icon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgString)}`,
        scaledSize: new window.google.maps.Size(iconW, iconH),
        anchor: new window.google.maps.Point(iconW / 2, showPrice ? iconH : iconH / 2),
      };

      const marker = new window.google.maps.Marker({
        position: { lat: business.lat, lng: business.lng },
        map: mapInstanceRef.current!,
        icon,
        title: business.name,
        zIndex: isSelected ? 100 : 1,
      });

      marker.addListener("click", () => {
        onSelectBusiness(business);
      });

      markersRef.current.set(business.id, marker);
    });
  }, [businesses, mapLoaded, selectedBusiness, zoomLevel, onSelectBusiness]);

  useEffect(() => { updateMarkers(); }, [updateMarkers]);

  // Pan to selected
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !selectedBusiness) return;
    if (selectedBusiness.lat && selectedBusiness.lng) {
      mapInstanceRef.current.panTo({ lat: selectedBusiness.lat, lng: selectedBusiness.lng });
      if (zoomLevel < 8) mapInstanceRef.current.setZoom(8);
    }
  }, [selectedBusiness, mapLoaded, zoomLevel]);

  if (mapError) {
    return (
      <div className="w-full h-full bg-[#0d1410] flex flex-col items-center justify-center gap-4 border border-[#1e2e1e] rounded-xl">
        <div className="text-[#4ade80] opacity-40"><MapPin size={48} /></div>
        <div className="text-center">
          <p className="text-white font-semibold mb-1">Map Integration Ready</p>
          <p className="text-gray-500 text-sm">Google Maps will display here with your API key</p>
        </div>
        {businesses.length > 0 && (
          <div className="relative w-full max-w-lg h-64 mx-4 bg-[#141a14] rounded-xl border border-[#1e2e1e] overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234ade80' fill-opacity='0.4'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
            }} />
            {businesses.filter(b => b.lat && b.lng).map(b => {
              const x = ((b.lng + 125) / 65) * 100;
              const y = ((50 - b.lat) / 30) * 100;
              return (
                <button key={b.id} onClick={() => onSelectBusiness(b)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-125"
                  style={{ left: `${x}%`, top: `${y}%` }}>
                  <div className={`rounded-full border-2 ${
                    selectedBusiness?.id === b.id
                      ? "w-4 h-4 border-[#4ade80] bg-[#4ade80]"
                      : "w-3 h-3 border-[#4ade80] bg-[#2d5a27]"
                  }`} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-[#1e2e1e]">
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 bg-[#0d1410] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading map...</p>
          </div>
        </div>
      )}
      {mapLoaded && (
        <div className="absolute bottom-4 left-4 bg-[#0d1410]/90 backdrop-blur-sm border border-[#1e2e1e] rounded-xl p-3">
          <p className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">Zoom {zoomLevel < ZOOM_THRESHOLD ? "in to see prices" : "out for overview"}</p>
          <div className="space-y-1.5">
            {[
              { label: "Active", color: "#4ade80" },
              { label: "Under LOI", color: "#fbbf24" },
              { label: "Seeking Capital", color: "#60a5fa" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <span className="text-gray-400 text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
