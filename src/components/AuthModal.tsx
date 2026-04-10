import { useState } from "react";
import { X, Eye, EyeOff, Building2, Lock, Mail, User, Briefcase } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name, title, company);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg.replace("Firebase: ", "").replace(/\(auth\/.*\)/, "").trim());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#141a14] border border-[#2a3a2a] rounded-2xl shadow-2xl p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors">
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#2d5a27] rounded-lg flex items-center justify-center">
            <Building2 size={20} className="text-[#4ade80]" />
          </div>
          <span className="text-xl font-bold text-white tracking-widest">ARCHALEON</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">
          {mode === "login" ? "Welcome back" : "Join Archaleon"}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {mode === "login" ? "Sign in to access the platform" : "Create your investor account"}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
                />
              </div>
              <div className="relative">
                <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Job Title (e.g., Managing Director)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
                />
              </div>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Firm / Company"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-[#1a241a] border border-[#2a3a2a] rounded-lg pl-10 pr-10 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2d5a27] hover:bg-[#3a7232] text-white font-semibold py-3 rounded-lg transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {mode === "login" ? (
            <>Don't have an account?{" "}
              <button onClick={() => setMode("register")} className="text-[#4ade80] hover:underline">
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-[#4ade80] hover:underline">
                Sign in
              </button>
            </>
          )}
        </div>

        <div className="mt-4 p-3 bg-[#1a241a] rounded-lg border border-[#2a3a2a]">
          <p className="text-xs text-gray-500 text-center">
            Create an account to list businesses and message owners
          </p>
        </div>
      </div>
    </div>
  );
}
