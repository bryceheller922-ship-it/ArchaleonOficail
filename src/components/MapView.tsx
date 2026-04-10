import { useEffect, useRef, useState } from "react";
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

const sectorColors: Record<string, string> = {
  "Technology": "#4ade80",
  "Healthcare": "#34d399",
  "Financial Services": "#a3e635",
  "Industrials": "#86efac",
  "Transportation": "#6ee7b7",
  "Energy": "#fbbf24",
  "Real Estate": "#60a5fa",
  "Biotechnology": "#c084fc",
};

export default function MapView({ businesses, selectedBusiness, onSelectBusiness }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

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
            { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#3a5a3a" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2a1a" }] },
            { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0d1410" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#3a5a3a" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1e3a1e" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#0d1410" }] },
            { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#4ade80" }] },
            { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1a2a1a" }] },
            { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#4a6a4a" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#060e06" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#2a4a2a" }] },
            { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#060e06" }] },
          ],
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_CENTER,
          },
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
        if (window.google?.maps) {
          clearInterval(interval);
          initMap();
        }
      }, 200);
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setMapError(true);
      }, 8000);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google) return;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current.clear();

    businesses.forEach(business => {
      const color = sectorColors[business.sector] || "#4ade80";
      const isSelected = selectedBusiness?.id === business.id;

      const svgIcon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="${isSelected ? 48 : 36}" height="${isSelected ? 48 : 36}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="${isSelected ? 22 : 16}" fill="${color}" fill-opacity="${isSelected ? 0.25 : 0.15}" stroke="${color}" stroke-width="2"/>
            <circle cx="24" cy="24" r="${isSelected ? 10 : 7}" fill="${color}"/>
            ${isSelected ? `<circle cx="24" cy="24" r="22" fill="none" stroke="${color}" stroke-width="2" opacity="0.5"/>` : ""}
          </svg>
        `)}`,
        scaledSize: new window.google.maps.Size(isSelected ? 48 : 36, isSelected ? 48 : 36),
        anchor: new window.google.maps.Point(isSelected ? 24 : 18, isSelected ? 24 : 18),
      };

      const marker = new window.google.maps.Marker({
        position: { lat: business.lat, lng: business.lng },
        map: mapInstanceRef.current!,
        icon: svgIcon,
        title: business.name,
        zIndex: isSelected ? 100 : 1,
      });

      marker.addListener("click", () => {
        onSelectBusiness(business);
        if (infoWindowRef.current && mapInstanceRef.current) {
          const content = `
            <div style="background:#141a14;border:1px solid #2a3a2a;border-radius:12px;padding:14px;min-width:220px;font-family:system-ui,sans-serif;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                <div style="width:36px;height:36px;background:#2d5a27;border-radius:8px;display:flex;align-items:center;justify-content:center;color:${color};font-weight:700;font-size:12px;flex-shrink:0;">${business.logo}</div>
                <div>
                  <div style="color:white;font-weight:700;font-size:13px;line-height:1.2;">${business.name}</div>
                  <div style="color:#6a9a6a;font-size:11px;">${business.industry}</div>
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                <div style="background:#1a241a;border-radius:8px;padding:8px;">
                  <div style="color:#6a9a6a;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;">Revenue</div>
                  <div style="color:white;font-weight:700;font-size:13px;">${business.revenue}</div>
                </div>
                <div style="background:#1a241a;border-radius:8px;padding:8px;">
                  <div style="color:#6a9a6a;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;">Valuation</div>
                  <div style="color:${color};font-weight:700;font-size:13px;">${business.valuation}</div>
                </div>
              </div>
              <div style="margin-top:8px;display:flex;align-items:center;gap:4px;">
                <div style="width:6px;height:6px;border-radius:50%;background:${business.status === 'Active' ? '#4ade80' : business.status === 'Under LOI' ? '#fbbf24' : '#60a5fa'};"></div>
                <span style="color:#9aaa9a;font-size:11px;">${business.status}</span>
              </div>
            </div>
          `;
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
      });

      markersRef.current.set(business.id, marker);
    });
  }, [businesses, mapLoaded, selectedBusiness, onSelectBusiness]);

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !selectedBusiness) return;
    mapInstanceRef.current.panTo({ lat: selectedBusiness.lat, lng: selectedBusiness.lng });
    mapInstanceRef.current.setZoom(10);
  }, [selectedBusiness, mapLoaded]);

  if (mapError) {
    return (
      <div className="w-full h-full bg-[#0d1410] flex flex-col items-center justify-center gap-4 border border-[#1e2e1e] rounded-xl">
        <div className="text-[#4ade80] opacity-40">
          <MapPin size={48} />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold mb-1">Map Integration Ready</p>
          <p className="text-gray-500 text-sm">Google Maps will display here with your API key</p>
        </div>
        {/* Fallback visual map */}
        <div className="relative w-full max-w-lg h-64 mx-4 bg-[#141a14] rounded-xl border border-[#1e2e1e] overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234ade80' fill-opacity='0.4'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
          }} />
          {businesses.map(b => {
            const x = ((b.lng + 125) / 65) * 100;
            const y = ((50 - b.lat) / 30) * 100;
            return (
              <button
                key={b.id}
                onClick={() => onSelectBusiness(b)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className={`w-3 h-3 rounded-full border-2 ${
                  selectedBusiness?.id === b.id ? "border-[#4ade80] bg-[#4ade80] scale-150" : "border-[#4ade80] bg-[#2d5a27]"
                }`} />
              </button>
            );
          })}
        </div>
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
      {/* Map Legend */}
      {mapLoaded && (
        <div className="absolute bottom-4 left-4 bg-[#0d1410]/90 backdrop-blur-sm border border-[#1e2e1e] rounded-xl p-3">
          <p className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">Deal Status</p>
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
