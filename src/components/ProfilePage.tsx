import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, User, Briefcase, Building2, Mail, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../lib/firestore";
import AuthModal from "./AuthModal";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [name, setName] = useState(userProfile?.displayName || "");
  const [title, setTitle] = useState(userProfile?.title || "");
  const [company, setCompany] = useState(userProfile?.company || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <User size={32} className="text-gray-600" />
        <p className="text-white font-semibold">Sign in to view your profile</p>
        <button onClick={() => setShowAuth(true)} className="bg-[#2d5a27] hover:bg-[#3a7232] text-white font-semibold px-6 py-2.5 rounded-lg text-sm">
          Sign In
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U";

  async function handleSave() {
    if (!currentUser) return;
    setSaving(true);
    await updateUserProfile(currentUser.uid, {
      uid: currentUser.uid,
      email: currentUser.email || "",
      displayName: name,
      title: title || undefined,
      company: company || undefined,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-white hover:bg-[#1a241a] rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white">Your Profile</h1>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-[#2d5a27] to-[#1a3a1a] rounded-3xl flex items-center justify-center text-3xl font-bold text-[#4ade80] shadow-xl shadow-green-900/30 mb-3">
            {initials}
          </div>
          <p className="text-white font-bold text-lg">{name || "Your Name"}</p>
          <p className="text-gray-500 text-sm">{currentUser.email}</p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <User size={12} /> Full Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80]"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Briefcase size={12} /> Job Title
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Managing Director"
              className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80]"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Building2 size={12} /> Company / Firm
            </label>
            <input
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="e.g. Blackstone"
              className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80]"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Mail size={12} /> Email
            </label>
            <input
              value={currentUser.email || ""}
              disabled
              className="w-full bg-[#141a14] border border-[#1e2e1e] rounded-lg px-3 py-2.5 text-gray-500 text-sm cursor-not-allowed"
            />
            <p className="text-gray-600 text-xs mt-1">Email cannot be changed</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-8 bg-[#2d5a27] hover:bg-[#3a7232] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {saved ? (
            <><CheckCircle size={16} /> Saved!</>
          ) : saving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving...</>
          ) : (
            <><Save size={16} /> Save Profile</>
          )}
        </button>
      </div>
    </div>
  );
}
