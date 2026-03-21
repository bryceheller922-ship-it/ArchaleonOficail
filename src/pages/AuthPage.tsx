import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 dotted-grid opacity-30" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <img
            src="https://www.dropbox.com/scl/fi/3ounjvat1paeuma0ksbv8/ChatGPT_Image_Mar_19__2026__12_15_28_AM-removebg-preview.png?rlkey=dyz1ot9ozdai0q671z6vg9hyh&st=rzw374b1&raw=1"
            alt="Archaleon"
            className="w-20 h-20 mx-auto mb-4 opacity-90"
          />
          <h1 className="text-3xl font-bold text-white-text font-mono tracking-wider">
            ARCHALEON
          </h1>
          <p className="text-gray-text text-sm mt-2 font-mono">
            AI-Powered Business Intelligence
          </p>
        </div>

        {/* Form */}
        <div className="bg-dark-800 border border-dark-400 rounded-lg p-8">
          <h2 className="text-lg font-semibold text-light-text mb-6 font-mono">
            {isLogin ? "// AUTHENTICATE" : "// CREATE ACCOUNT"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs text-gray-text font-mono mb-1.5 uppercase tracking-wider">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-dark-700 border border-dark-400 rounded px-3 py-2.5 text-light-text font-mono text-sm focus:outline-none focus:border-accent-600 transition-colors"
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-text font-mono mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-700 border border-dark-400 rounded px-3 py-2.5 text-light-text font-mono text-sm focus:outline-none focus:border-accent-600 transition-colors"
                placeholder="user@archaleon.io"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-text font-mono mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-700 border border-dark-400 rounded px-3 py-2.5 text-light-text font-mono text-sm focus:outline-none focus:border-accent-600 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-400 text-xs font-mono bg-dark-700 border border-red-900 rounded p-2">
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-700 hover:bg-accent-600 text-white-text font-mono text-sm py-2.5 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "PROCESSING..." : isLogin ? "LOGIN →" : "CREATE ACCOUNT →"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-gray-text text-xs font-mono hover:text-accent-400 transition-colors"
            >
              {isLogin
                ? "No account? Create one →"
                : "Already have an account? Login →"}
            </button>
          </div>
        </div>

        <p className="text-center text-dark-200 text-xs font-mono mt-6">
          v1.0.0 · Secure Connection
        </p>
      </div>
    </div>
  );
}
