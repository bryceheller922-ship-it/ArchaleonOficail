import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!displayName.trim()) {
          setError("Display name is required");
          setLoading(false);
          return;
        }
        await signUp(email, password, displayName);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 dotted-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-900/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <img
              src="https://www.dropbox.com/scl/fi/3ounjvat1paeuma0ksbv8/ChatGPT_Image_Mar_19__2026__12_15_28_AM-removebg-preview.png?rlkey=dyz1ot9ozdai0q671z6vg9hyh&st=rzw374b1&raw=1"
              alt="Archaleon"
              className="w-16 h-16 mx-auto opacity-90"
            />
            <div className="absolute -inset-3 rounded-full bg-accent-500/10 blur-xl" />
          </div>
          <h1 className="text-2xl font-bold text-white-text font-mono tracking-[0.2em]">
            ARCHALEON
          </h1>
          <p className="text-dark-100 text-xs mt-2 font-mono">
            AI-Powered Business Intelligence
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-dark-800/80 border border-dark-400/50 rounded-2xl p-6 md:p-8 backdrop-blur-panel shadow-2xl">
          <h2 className="text-sm font-semibold text-light-text mb-6 font-mono tracking-wide">
            {isLogin ? "SIGN IN" : "CREATE ACCOUNT"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-[10px] text-dark-200 font-mono mb-1.5 uppercase tracking-wider">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-dark-700/60 border border-dark-400/50 rounded-xl px-4 py-2.5 text-light-text font-mono text-sm focus:outline-none focus:border-accent-600/60 transition-colors placeholder-dark-300"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] text-dark-200 font-mono mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-700/60 border border-dark-400/50 rounded-xl px-4 py-2.5 text-light-text font-mono text-sm focus:outline-none focus:border-accent-600/60 transition-colors placeholder-dark-300"
                placeholder="user@archaleon.io"
              />
            </div>

            <div>
              <label className="block text-[10px] text-dark-200 font-mono mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-700/60 border border-dark-400/50 rounded-xl px-4 py-2.5 text-light-text font-mono text-sm focus:outline-none focus:border-accent-600/60 transition-colors placeholder-dark-300"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-900/15 border border-red-800/30 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} className="shrink-0" />
                <span className="text-xs font-mono">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-700 hover:bg-accent-600 text-white font-mono text-sm py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2 shadow-lg shadow-accent-900/30"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-dark-100 text-xs font-mono hover:text-accent-400 transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        <p className="text-center text-dark-300 text-[10px] font-mono mt-6">
          v1.0.0 · Encrypted Connection
        </p>
      </div>
    </div>
  );
}
