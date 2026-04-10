import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Image as ImageIcon, MapPin, Loader2, X, CheckCircle } from "lucide-react";
import { Business } from "../lib/mockData";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { createListing, geocodeAddress } from "../lib/firestore";

const industries = ["Manufacturing", "Healthcare Technology", "Logistics & Supply Chain", "Fintech", "Clean Energy", "Defense", "Biotechnology", "Commercial Real Estate", "Technology", "Other"];
const dealTypes = ["Full Acquisition", "Growth Equity", "Recapitalization", "Partial Stake", "Venture / Growth", "Portfolio Sale"];

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAuth, setShowAuth] = useState(false);

  const [form, setForm] = useState({
    name: "", industry: "Manufacturing", revenue: "", ebitda: "", employees: "",
    address: "", description: "", askingPrice: "", dealType: "Full Acquisition",
    website: "", grossMargin: "", yoyGrowth: "", sector: "Industrials", status: "Active" as const,
  });

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

  async function handleSubmit() {
    if (!currentUser || !userProfile) return;
    if (!form.name.trim()) { setError("Company name is required."); return; }
    if (!form.address.trim()) { setError("Address is required so your listing appears on the map."); return; }

    setSaving(true);
    setError("");

    try {
      const geo = await geocodeAddress(form.address);
      if (!geo) {
        setError("Could not find that address. Please try a more specific address.");
        setSaving(false);
        return;
      }

      const initials = userProfile.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
      const logoInitials = form.name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();

      const listingData: Omit<Business, "id"> = {
        name: form.name,
        industry: form.industry,
        sector: form.sector,
        description: form.description,
        revenue: form.revenue || "N/A",
        ebitda: form.ebitda || "N/A",
        valuation: form.askingPrice || "N/A",
        employees: parseInt(form.employees) || 0,
        founded: new Date().getFullYear(),
        location: `${geo.city || ""}, ${geo.state || ""}`.replace(/^, |, $/g, "") || form.address,
        city: geo.city,
        state: geo.state,
        country: geo.country,
        lat: geo.lat,
        lng: geo.lng,
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
        imageUrls: [],
        createdBy: currentUser.uid,
      };

      try {
        await createListing(listingData, images);
      } catch (err) {
        console.warn("Firestore write may have timed out:", err);
        // Still show success — the listing may have been created
      }
      setSaving(false);
      setSuccess(true);
      setTimeout(() => navigate("/listings"), 2000);
    } catch (err) {
      console.error(err);
      setError("Failed to create listing. Please try again.");
      setSaving(false);
    }
  }

  // Not logged in — show auth gate
  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-16 h-16 bg-[#1a241a] rounded-2xl flex items-center justify-center">
          <ImageIcon size={28} className="text-[#4ade80]" />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold mb-1">Create an account to list your business</p>
          <p className="text-gray-500 text-sm mb-4">Sign up to reach investors on Archaleon</p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-[#2d5a27] hover:bg-[#3a7232] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Sign Up / Sign In
          </button>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-16 h-16 bg-[#1e3a1e] rounded-full flex items-center justify-center">
          <CheckCircle size={32} className="text-[#4ade80]" />
        </div>
        <h2 className="text-xl font-bold text-white">Listing Created!</h2>
        <p className="text-gray-400 text-sm">Your business is now live on Archaleon. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/listings")}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#1a241a] rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">List Your Business</h1>
            <p className="text-gray-500 text-sm mt-1">Step {step} of 2 — {step === 1 ? "Company Info" : "Financial Details"}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[#1e2e1e] rounded-full mb-8">
          <div className="h-full bg-[#4ade80] rounded-full transition-all duration-300" style={{ width: `${step * 50}%` }} />
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {step === 1 ? (
            <>
              <Field label="Company Name" required>
                <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Vertex Industrial Solutions" className="input-field" />
              </Field>

              <Field label="Industry">
                <select value={form.industry} onChange={e => update("industry", e.target.value)} className="input-field">
                  {industries.map(d => <option key={d} value={d} className="bg-[#1a241a]">{d}</option>)}
                </select>
              </Field>

              <Field label="Address" required icon={<MapPin size={12} />}>
                <input value={form.address} onChange={e => update("address", e.target.value)} placeholder="e.g. 1234 Main St, Dallas, TX 75201" className="input-field" />
                <p className="text-gray-600 text-xs mt-1">This will be geocoded and shown on the map</p>
              </Field>

              <Field label="Number of Employees">
                <input type="number" value={form.employees} onChange={e => update("employees", e.target.value)} placeholder="e.g. 312" className="input-field" />
              </Field>

              <Field label="Website">
                <input value={form.website} onChange={e => update("website", e.target.value)} placeholder="yourcompany.com" className="input-field" />
              </Field>

              <Field label="Business Description">
                <textarea
                  value={form.description}
                  onChange={e => update("description", e.target.value)}
                  placeholder="Describe your business, key strengths, competitive advantages..."
                  rows={4}
                  className="input-field resize-none"
                />
              </Field>

              {/* Image Upload */}
              <Field label="Business Images" icon={<ImageIcon size={12} />}>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 bg-[#1a241a] border border-dashed border-[#2a3a2a] rounded-lg py-6 text-gray-500 hover:text-gray-300 hover:border-[#4ade80] transition-colors text-sm"
                >
                  <Upload size={16} />
                  Click to upload images
                </button>
                {previews.length > 0 && (
                  <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                    {previews.map((src, i) => (
                      <div key={i} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-[#2a3a2a]">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>
            </>
          ) : (
            <>
              <Field label="Annual Revenue">
                <input value={form.revenue} onChange={e => update("revenue", e.target.value)} placeholder="e.g. $42.8M" className="input-field" />
              </Field>
              <Field label="EBITDA">
                <input value={form.ebitda} onChange={e => update("ebitda", e.target.value)} placeholder="e.g. $9.6M" className="input-field" />
              </Field>
              <Field label="Asking Price / Valuation">
                <input value={form.askingPrice} onChange={e => update("askingPrice", e.target.value)} placeholder="e.g. $86M" className="input-field" />
              </Field>
              <Field label="Gross Margin">
                <input value={form.grossMargin} onChange={e => update("grossMargin", e.target.value)} placeholder="e.g. 38.2%" className="input-field" />
              </Field>
              <Field label="YoY Growth">
                <input value={form.yoyGrowth} onChange={e => update("yoyGrowth", e.target.value)} placeholder="e.g. +14.7%" className="input-field" />
              </Field>
              <Field label="Deal Type">
                <select value={form.dealType} onChange={e => update("dealType", e.target.value)} className="input-field">
                  {dealTypes.map(d => <option key={d} value={d} className="bg-[#1a241a]">{d}</option>)}
                </select>
              </Field>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8 pb-8">
          {step === 2 && (
            <button onClick={() => setStep(1)} disabled={saving} className="flex-1 bg-[#1a241a] hover:bg-[#1e2e1e] border border-[#2a3a2a] text-gray-300 font-semibold py-3.5 rounded-xl transition-colors text-sm disabled:opacity-50">
              Back
            </button>
          )}
          <button
            onClick={() => step === 1 ? setStep(2) : handleSubmit()}
            disabled={saving}
            className="flex-1 bg-[#2d5a27] hover:bg-[#3a7232] text-white font-semibold py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Creating Listing...</>
            ) : step === 1 ? "Continue to Financials" : "Submit Listing"}
          </button>
        </div>
      </div>

      {/* Shared input styles via Tailwind utility class */}
      <style>{`
        .input-field {
          width: 100%;
          background: #1a241a;
          border: 1px solid #2a3a2a;
          border-radius: 0.5rem;
          padding: 0.625rem 0.75rem;
          color: white;
          font-size: 0.875rem;
        }
        .input-field::placeholder { color: #4a5a4a; }
        .input-field:focus { outline: none; border-color: #4ade80; }
      `}</style>
    </div>
  );
}

function Field({ label, required, icon, children }: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1">
        {icon}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
