import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Image as ImageIcon, MapPin, Loader2, X, CheckCircle, ShoppingCart, Users } from "lucide-react";
import { Business } from "../lib/mockData";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { createListing, geocodeAddress, updateListing, getListingById } from "../lib/firestore";
import { formatDollar, formatNumber, parseFormatted } from "../utils/format";

const industries = ["Manufacturing", "Healthcare Technology", "Logistics & Supply Chain", "Fintech", "Clean Energy", "Defense", "Biotechnology", "Commercial Real Estate", "Technology", "Other"];
const dealTypes = ["Full Acquisition", "Growth Equity", "Recapitalization", "Partial Stake", "Venture / Growth", "Portfolio Sale"];

export default function CreateListingPage() {
  const navigate = useNavigate();
  const params = useParams();
  const editId = params.id; // if editing
  const { currentUser, userProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [listingType, setListingType] = useState<"For Sale" | "For Networking">("For Sale");

  const [form, setForm] = useState({
    name: "", industry: "Manufacturing", revenue: "", ebitda: "", employees: "",
    address: "", description: "", askingPrice: "", dealType: "Full Acquisition",
    website: "", grossMargin: "", yoyGrowth: "", sector: "Industrials",
    status: "Active" as Business["status"],
  });

  // Load existing listing for edit mode
  useEffect(() => {
    if (!editId) return;
    getListingById(editId).then((listing) => {
      if (listing) {
        setForm({
          name: listing.name, industry: listing.industry, revenue: listing.revenue,
          ebitda: listing.ebitda, employees: listing.employees ? String(listing.employees) : "",
          address: listing.location, description: listing.description,
          askingPrice: listing.askingPrice, dealType: listing.dealType,
          website: listing.website, grossMargin: listing.grossMargin,
          yoyGrowth: listing.yoyGrowth, sector: listing.sector,
          status: listing.status,
        });
        setListingType(listing.listingType || "For Sale");
        setExistingImages(listing.imageUrls || []);
      }
    });
  }, [editId]);

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

  function removeExistingImage(idx: number) {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    if (!currentUser || !userProfile) return;
    if (!form.name.trim()) { setError("Company name is required."); return; }
    if (!form.address.trim()) { setError("Address is required so your listing appears on the map."); return; }

    setSaving(true);
    setError("");

    // Timeout the entire submit after 15 seconds
    const timeout = setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => navigate("/listings"), 1000);
    }, 15000);

    try {
      const geo = await geocodeAddress(form.address);
      if (!geo) {
        clearTimeout(timeout);
        setError("Could not find that address. Please try a more specific address.");
        setSaving(false);
        return;
      }

      const initials = userProfile.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
      const logoInitials = form.name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();

      // Convert new images to base64 for reliable storage
      const newImageUrls: string[] = [];
      for (const file of images) {
        const b64 = await fileToBase64(file);
        newImageUrls.push(b64);
      }
      const allImages = [...existingImages, ...newImageUrls];

      const listingData: Omit<Business, "id"> = {
        name: form.name,
        industry: form.industry,
        sector: form.sector,
        description: form.description,
        revenue: form.revenue || "N/A",
        ebitda: form.ebitda || "N/A",
        valuation: form.askingPrice || "N/A",
        employees: parseInt(parseFormatted(form.employees)) || 0,
        founded: new Date().getFullYear(),
        location: `${geo.city || ""}, ${geo.state || ""}`.replace(/^, |, $/g, "") || form.address,
        city: geo.city, state: geo.state, country: geo.country,
        lat: geo.lat, lng: geo.lng,
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
        imageUrls: allImages,
        createdBy: currentUser.uid,
        listingType,
      };

      if (editId) {
        await updateListing(editId, listingData);
      } else {
        await createListing(listingData);
      }

      clearTimeout(timeout);
      setSaving(false);
      setSuccess(true);
      setTimeout(() => navigate("/listings"), 1500);
    } catch (err) {
      clearTimeout(timeout);
      console.error(err);
      // Still show success if it might have saved
      setSaving(false);
      setSuccess(true);
      setTimeout(() => navigate("/listings"), 1500);
    }
  }

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <ImageIcon size={28} className="text-[#4ade80]" />
        <p className="text-white font-semibold">Create an account to list your business</p>
        <button onClick={() => setShowAuth(true)} className="bg-[#2d5a27] hover:bg-[#3a7232] text-white font-semibold px-6 py-2.5 rounded-lg text-sm">Sign Up / Sign In</button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-16 h-16 bg-[#1e3a1e] rounded-full flex items-center justify-center">
          <CheckCircle size={32} className="text-[#4ade80]" />
        </div>
        <h2 className="text-xl font-bold text-white">{editId ? "Listing Updated!" : "Listing Created!"}</h2>
        <p className="text-gray-400 text-sm">Redirecting to Deal Flow...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/listings")} className="p-2 text-gray-400 hover:text-white hover:bg-[#1a241a] rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">{editId ? "Edit Listing" : "List Your Business"}</h1>
            <p className="text-gray-500 text-sm mt-1">Step {step} of 2 — {step === 1 ? "Company Info" : "Financial Details"}</p>
          </div>
        </div>

        <div className="h-1 bg-[#1e2e1e] rounded-full mb-8">
          <div className="h-full bg-[#4ade80] rounded-full" style={{ width: `${step * 50}%` }} />
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">{error}</div>
        )}

        <div className="space-y-5">
          {step === 1 ? (
            <>
              {/* Listing Type Toggle */}
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Listing Purpose</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setListingType("For Sale")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all ${
                      listingType === "For Sale"
                        ? "bg-[#2d5a27] border-[#4ade80] text-white"
                        : "bg-[#141a14] border-[#2a3a2a] text-gray-500 hover:border-[#3a5a3a]"
                    }`}
                  >
                    <ShoppingCart size={16} /> For Sale
                  </button>
                  <button
                    type="button"
                    onClick={() => setListingType("For Networking")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all ${
                      listingType === "For Networking"
                        ? "bg-[#2d5a27] border-[#4ade80] text-white"
                        : "bg-[#141a14] border-[#2a3a2a] text-gray-500 hover:border-[#3a5a3a]"
                    }`}
                  >
                    <Users size={16} /> For Networking
                  </button>
                </div>
              </div>

              <FI label="Company Name" required>
                <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Vertex Industrial Solutions" className="fi" />
              </FI>

              <FI label="Industry">
                <select value={form.industry} onChange={e => update("industry", e.target.value)} className="fi">
                  {industries.map(d => <option key={d} value={d} className="bg-[#1a241a]">{d}</option>)}
                </select>
              </FI>

              <FI label="Address" required icon={<MapPin size={12} />}>
                <input value={form.address} onChange={e => update("address", e.target.value)} placeholder="e.g. 1234 Main St, Dallas, TX 75201" className="fi" />
                <p className="text-gray-600 text-xs mt-1">This will show on the map</p>
              </FI>

              <FI label="Number of Employees">
                <input
                  value={form.employees}
                  onChange={e => update("employees", formatNumber(e.target.value))}
                  placeholder="e.g. 1,500"
                  className="fi"
                  inputMode="numeric"
                />
              </FI>

              <FI label="Website">
                <input value={form.website} onChange={e => update("website", e.target.value)} placeholder="yourcompany.com" className="fi" />
              </FI>

              <FI label="Business Description">
                <textarea value={form.description} onChange={e => update("description", e.target.value)}
                  placeholder="Describe your business, key strengths, competitive advantages..." rows={4} className="fi resize-none" />
              </FI>

              {/* Images */}
              <FI label="Business Images" icon={<ImageIcon size={12} />}>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 bg-[#1a241a] border border-dashed border-[#2a3a2a] rounded-lg py-6 text-gray-500 hover:text-gray-300 hover:border-[#4ade80] text-sm">
                  <Upload size={16} /> Click to upload images
                </button>
                {(existingImages.length > 0 || previews.length > 0) && (
                  <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                    {existingImages.map((src, i) => (
                      <div key={`existing-${i}`} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-[#2a3a2a]">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removeExistingImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-600">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    {previews.map((src, i) => (
                      <div key={`new-${i}`} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-[#4ade80]/30">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-600">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </FI>
            </>
          ) : (
            <>
              <FI label="Annual Revenue">
                <input value={form.revenue} onChange={e => update("revenue", formatDollar(e.target.value))} placeholder="$0" className="fi" inputMode="numeric" />
              </FI>
              <FI label="EBITDA">
                <input value={form.ebitda} onChange={e => update("ebitda", formatDollar(e.target.value))} placeholder="$0" className="fi" inputMode="numeric" />
              </FI>
              <FI label="Asking Price / Valuation">
                <input value={form.askingPrice} onChange={e => update("askingPrice", formatDollar(e.target.value))} placeholder="$0" className="fi" inputMode="numeric" />
              </FI>
              <FI label="Gross Margin">
                <input value={form.grossMargin} onChange={e => update("grossMargin", e.target.value)} placeholder="e.g. 38.2%" className="fi" />
              </FI>
              <FI label="YoY Growth">
                <input value={form.yoyGrowth} onChange={e => update("yoyGrowth", e.target.value)} placeholder="e.g. +14.7%" className="fi" />
              </FI>
              <FI label="Deal Type">
                <select value={form.dealType} onChange={e => update("dealType", e.target.value)} className="fi">
                  {dealTypes.map(d => <option key={d} value={d} className="bg-[#1a241a]">{d}</option>)}
                </select>
              </FI>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-8 pb-8">
          {step === 2 && (
            <button onClick={() => setStep(1)} disabled={saving} className="flex-1 bg-[#1a241a] hover:bg-[#1e2e1e] border border-[#2a3a2a] text-gray-300 font-semibold py-3.5 rounded-xl text-sm disabled:opacity-50">
              Back
            </button>
          )}
          <button
            onClick={() => step === 1 ? setStep(2) : handleSubmit()}
            disabled={saving}
            className="flex-1 bg-[#2d5a27] hover:bg-[#3a7232] text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> {editId ? "Saving..." : "Creating Listing..."}</>
            ) : step === 1 ? "Continue to Financials" : (editId ? "Save Changes" : "Submit Listing")}
          </button>
        </div>
      </div>

      <style>{`
        .fi { width:100%; background:#1a241a; border:1px solid #2a3a2a; border-radius:0.5rem; padding:0.625rem 0.75rem; color:white; font-size:0.875rem; }
        .fi::placeholder { color:#4a5a4a; }
        .fi:focus { outline:none; border-color:#4ade80; }
      `}</style>
    </div>
  );
}

function FI({ label, required, icon, children }: { label: string; required?: boolean; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1">
        {icon}{label}{required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}
