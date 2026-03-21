import { useState, useRef, useEffect } from "react";
import {
  Send,
  Square,
  Globe,
  Brain,
  User,
  Bot,
  Monitor,
  Loader2,
  Settings,
  X,
  Key,
  Sparkles,
  Search,
  ExternalLink,
  ChevronDown,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  generateResponse,
  getApiKey,
  setApiKey,
  clearApiKey,
} from "@/services/ai";
import { fetchWebPage, searchWeb } from "@/services/web";

/* ─── Types ─── */
interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  browsing?: BrowseStep[];
  thinking?: string;
  error?: boolean;
}

interface BrowseStep {
  url: string;
  title: string;
  status: "loading" | "done" | "error";
  content?: string;
  error?: string;
}

/* ─── Hook: Mobile detection ─── */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

/* ─── Settings Modal ─── */
function SettingsModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  const [key, setKey] = useState(getApiKey() || "");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<
    "success" | "error" | null
  >(null);

  const handleSave = () => {
    if (key.trim()) {
      setApiKey(key.trim());
      onSave();
      onClose();
    }
  };

  const handleTest = async () => {
    if (!key.trim()) return;
    setTesting(true);
    setTestResult(null);
    setApiKey(key.trim());
    try {
      await generateResponse("Say 'connected' in one word.");
      setTestResult("success");
    } catch {
      setTestResult("error");
    }
    setTesting(false);
  };

  const handleClear = () => {
    clearApiKey();
    setKey("");
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 animate-overlayFadeIn"
        onClick={onClose}
      />
      <div className="relative bg-dark-800 border border-dark-400 rounded-2xl p-6 w-full max-w-md animate-fadeIn shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Key size={18} className="text-accent-400" />
            <h3 className="font-mono text-sm text-light-text">
              AI CONFIGURATION
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-dark-200 hover:text-light-text transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-dark-100 font-mono mb-4 leading-relaxed">
          Enter your Google Gemini API key to enable AI responses.
          Get a free key from{" "}
          <span className="text-accent-400">
            aistudio.google.com
          </span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] text-dark-200 font-mono uppercase tracking-wider mb-1.5">
              Gemini API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setTestResult(null);
              }}
              placeholder="AIzaSy..."
              className="w-full bg-dark-700 border border-dark-400 rounded-lg px-4 py-2.5 text-sm font-mono text-light-text placeholder-dark-300 focus:outline-none focus:border-accent-600 transition-colors"
            />
          </div>

          {testResult === "success" && (
            <div className="flex items-center gap-2 text-accent-400 bg-accent-900/30 border border-accent-800/50 rounded-lg px-3 py-2">
              <Check size={14} />
              <span className="text-xs font-mono">
                Connected successfully
              </span>
            </div>
          )}
          {testResult === "error" && (
            <div className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg px-3 py-2">
              <AlertCircle size={14} />
              <span className="text-xs font-mono">
                Invalid key or API error
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleTest}
              disabled={!key.trim() || testing}
              className="flex-1 bg-dark-600 hover:bg-dark-500 text-light-text font-mono text-xs py-2.5 rounded-lg transition-colors border border-dark-400 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {testing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              Test Connection
            </button>
            <button
              onClick={handleSave}
              disabled={!key.trim()}
              className="flex-1 bg-accent-700 hover:bg-accent-600 text-white font-mono text-xs py-2.5 rounded-lg transition-colors disabled:opacity-40"
            >
              Save Key
            </button>
          </div>

          {getApiKey() && (
            <button
              onClick={handleClear}
              className="w-full text-dark-200 hover:text-red-400 text-xs font-mono py-2 transition-colors"
            >
              Clear saved key
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Browser Panel ─── */
function BrowserPanel({
  steps,
  expanded,
  onToggle,
}: {
  steps: BrowseStep[];
  expanded: boolean;
  onToggle: () => void;
}) {
  if (steps.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-[10px] font-mono text-accent-300 hover:text-accent-200 transition-colors mb-2"
      >
        <Monitor size={12} />
        <span>
          {steps.length} page{steps.length > 1 ? "s" : ""} browsed
        </span>
        <ChevronDown
          size={10}
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="space-y-1.5 animate-fadeIn">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-dark-700/50 rounded-lg px-3 py-2 border border-dark-500/50"
            >
              {step.status === "loading" ? (
                <Loader2
                  size={12}
                  className="text-accent-400 animate-spin shrink-0"
                />
              ) : step.status === "error" ? (
                <AlertCircle
                  size={12}
                  className="text-red-400 shrink-0"
                />
              ) : (
                <Check
                  size={12}
                  className="text-accent-500 shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono text-light-text truncate">
                  {step.title || "Loading..."}
                </p>
                <p className="text-[9px] font-mono text-dark-200 truncate">
                  {step.url}
                </p>
              </div>
              {step.status === "done" && (
                <ExternalLink
                  size={10}
                  className="text-dark-300 shrink-0"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Message Bubble ─── */
function MessageBubble({
  message,
  isMobile,
}: {
  message: ChatMessage;
  isMobile: boolean;
}) {
  const [browserExpanded, setBrowserExpanded] = useState(false);
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-2 animate-fadeIn">
        <div className="bg-dark-700/50 border border-dark-500/50 rounded-full px-4 py-1.5 flex items-center gap-2">
          <Sparkles size={10} className="text-accent-400" />
          <span className="text-[10px] font-mono text-dark-100">
            {message.content}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-2.5 md:gap-3 animate-fadeIn ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
          isUser
            ? "bg-accent-800/60 border border-accent-700/50"
            : "bg-dark-600 border border-dark-400"
        }`}
      >
        {isUser ? (
          <User size={isMobile ? 12 : 14} className="text-accent-300" />
        ) : (
          <Bot size={isMobile ? 12 : 14} className="text-accent-400" />
        )}
      </div>

      {/* Content */}
      <div
        className={`flex-1 min-w-0 ${isUser ? "flex flex-col items-end" : ""}`}
      >
        <div
          className={`rounded-2xl px-4 py-3 max-w-[85%] md:max-w-[75%] ${
            isUser
              ? "bg-accent-800/40 border border-accent-700/30"
              : message.error
                ? "bg-red-900/20 border border-red-800/30"
                : "bg-dark-700/60 border border-dark-500/40"
          }`}
        >
          {/* Thinking indicator */}
          {message.thinking && (
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-dark-500/30">
              <Brain size={11} className="text-dark-200" />
              <span className="text-[10px] font-mono text-dark-200 italic">
                {message.thinking}
              </span>
            </div>
          )}

          {/* Message content - render markdown-like formatting */}
          <div className="space-y-1.5">
            {message.content.split("\n").map((line, i) => {
              if (line.startsWith("### ")) {
                return (
                  <p
                    key={i}
                    className="text-xs font-semibold text-light-text font-mono mt-2"
                  >
                    {line.replace("### ", "")}
                  </p>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <p
                    key={i}
                    className="text-sm font-semibold text-white-text font-mono mt-2"
                  >
                    {line.replace("## ", "")}
                  </p>
                );
              }
              if (line.startsWith("- ") || line.startsWith("* ")) {
                return (
                  <div
                    key={i}
                    className="flex items-start gap-1.5 ml-1"
                  >
                    <span className="text-accent-500 mt-0.5 text-[10px]">
                      {"\u2022"}
                    </span>
                    <span
                      className={`text-[11px] md:text-xs font-mono leading-relaxed ${isUser ? "text-accent-100" : "text-gray-text"}`}
                    >
                      {line.replace(/^[-*] /, "")}
                    </span>
                  </div>
                );
              }
              if (line.trim() === "") {
                return <div key={i} className="h-1" />;
              }
              // Handle **bold** text
              const parts = line.split(/(\*\*[^*]+\*\*)/g);
              return (
                <p
                  key={i}
                  className={`text-[11px] md:text-xs font-mono leading-relaxed ${isUser ? "text-accent-100" : "text-gray-text"}`}
                >
                  {parts.map((part, j) => {
                    if (
                      part.startsWith("**") &&
                      part.endsWith("**")
                    ) {
                      return (
                        <span
                          key={j}
                          className="font-semibold text-light-text"
                        >
                          {part.slice(2, -2)}
                        </span>
                      );
                    }
                    return part;
                  })}
                </p>
              );
            })}
          </div>

          {/* Browser steps */}
          {message.browsing && message.browsing.length > 0 && (
            <BrowserPanel
              steps={message.browsing}
              expanded={browserExpanded}
              onToggle={() => setBrowserExpanded(!browserExpanded)}
            />
          )}

          {/* Error indicator */}
          {message.error && (
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-red-800/30">
              <AlertCircle size={11} className="text-red-400" />
              <span className="text-[10px] font-mono text-red-300">
                Error generating response
              </span>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p
          className={`text-[9px] font-mono text-dark-300 mt-1 px-1 ${isUser ? "text-right" : ""}`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function ChatPage() {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(!!getApiKey());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentStatus]);

  const checkApiKey = () => {
    const key = getApiKey();
    setHasApiKey(!!key);
    return !!key;
  };

  /* ─── Determine if browsing is needed ─── */
  const shouldBrowse = (prompt: string): string | null => {
    const lp = prompt.toLowerCase();
    const browseKeywords = [
      "browse",
      "visit",
      "go to",
      "open",
      "navigate",
      "fetch",
      "check out",
    ];
    const searchKeywords = [
      "search",
      "find",
      "look up",
      "lookup",
      "google",
      "research",
      "what is",
      "who is",
      "how to",
      "latest",
      "news about",
      "tell me about",
    ];

    // Check for direct URL
    const urlMatch = prompt.match(
      /https?:\/\/[^\s]+|www\.[^\s]+/i
    );
    if (urlMatch) return urlMatch[0];

    // Check for browse keywords
    if (browseKeywords.some((k) => lp.includes(k))) {
      const urlInPrompt = prompt.match(
        /(?:browse|visit|go to|open|navigate to|fetch|check out)\s+(.+)/i
      );
      if (urlInPrompt) {
        const target = urlInPrompt[1].trim();
        if (target.includes("."))
          return target.startsWith("http")
            ? target
            : `https://${target}`;
      }
      return "SEARCH:" + prompt;
    }

    // Check for search keywords
    if (searchKeywords.some((k) => lp.includes(k))) {
      return "SEARCH:" + prompt;
    }

    return null;
  };

  /* ─── Process message ─── */
  const processMessage = async (prompt: string) => {
    if (!checkApiKey()) {
      setShowSettings(true);
      return;
    }

    setIsProcessing(true);
    abortRef.current = false;

    // Add user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Create assistant message placeholder
    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      browsing: [],
    };

    let webContext = "";
    const browseTarget = shouldBrowse(prompt);

    if (browseTarget) {
      // Add loading message
      setMessages((prev) => [
        ...prev,
        {
          ...assistantMsg,
          thinking: "Browsing the web...",
        },
      ]);

      const isSearch = browseTarget.startsWith("SEARCH:");
      const browseSteps: BrowseStep[] = [];

      if (isSearch) {
        const query = browseTarget.replace("SEARCH:", "");
        setCurrentStatus(`Searching: "${query.slice(0, 40)}..."`);

        // Add search step
        browseSteps.push({
          url: `google.com/search?q=${encodeURIComponent(query)}`,
          title: `Searching for: ${query}`,
          status: "loading",
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, browsing: [...browseSteps] }
              : m
          )
        );

        if (abortRef.current) {
          setIsProcessing(false);
          return;
        }

        const result = await searchWeb(query);

        browseSteps[browseSteps.length - 1] = {
          ...browseSteps[browseSteps.length - 1],
          status: result.success ? "done" : "error",
          title: result.title,
          content: result.content,
          error: result.error,
        };

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, browsing: [...browseSteps] }
              : m
          )
        );

        if (result.success) {
          webContext = `Search results for "${query}":\n${result.content}`;
        }
      } else {
        // Direct URL
        setCurrentStatus(`Browsing: ${browseTarget}`);

        browseSteps.push({
          url: browseTarget,
          title: "Loading page...",
          status: "loading",
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, browsing: [...browseSteps] }
              : m
          )
        );

        if (abortRef.current) {
          setIsProcessing(false);
          return;
        }

        const result = await fetchWebPage(browseTarget);

        browseSteps[browseSteps.length - 1] = {
          ...browseSteps[browseSteps.length - 1],
          status: result.success ? "done" : "error",
          title: result.title,
          content: result.content,
          error: result.error,
        };

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, browsing: [...browseSteps] }
              : m
          )
        );

        if (result.success) {
          webContext = `Content from ${browseTarget} (${result.title}):\n${result.content}`;
        }
      }
    } else {
      // No browsing needed, show thinking
      setMessages((prev) => [
        ...prev,
        {
          ...assistantMsg,
          thinking: "Thinking...",
        },
      ]);
    }

    if (abortRef.current) {
      setIsProcessing(false);
      return;
    }

    // Build history for context
    const history = messages
      .filter((m) => m.role !== "system")
      .slice(-10)
      .map((m) => ({
        role: (m.role === "user" ? "user" : "model") as
          | "user"
          | "model",
        parts: [{ text: m.content }],
      }));

    // Generate AI response
    setCurrentStatus("Generating response...");
    try {
      const response = await generateResponse(
        prompt,
        history,
        webContext || undefined
      );

      if (abortRef.current) {
        setIsProcessing(false);
        return;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: response,
                thinking: undefined,
              }
            : m
        )
      );
    } catch (err: any) {
      if (err.message === "NO_API_KEY") {
        setShowSettings(true);
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistantId)
        );
      } else if (err.message === "INVALID_API_KEY") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    "API key is invalid. Please update it in settings.",
                  thinking: undefined,
                  error: true,
                }
              : m
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    err.message || "An error occurred.",
                  thinking: undefined,
                  error: true,
                }
              : m
          )
        );
      }
    }

    setCurrentStatus("");
    setIsProcessing(false);
  };

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    const prompt = input.trim();
    setInput("");
    processMessage(prompt);
  };

  const handleStop = () => {
    abortRef.current = true;
    setIsProcessing(false);
    setCurrentStatus("");
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 relative">
      {/* ─── Background ─── */}
      <div className="absolute inset-0 dotted-grid-accent opacity-30 pointer-events-none" />

      {/* ─── Header ─── */}
      <div className="relative z-10 px-3 py-2.5 md:px-5 md:py-3 border-b border-dark-500/50 bg-dark-800/80 backdrop-blur-panel shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-accent-900/60 border border-accent-700/40 flex items-center justify-center">
            <Brain
              size={isMobile ? 14 : 16}
              className="text-accent-400"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-mono text-xs md:text-sm text-light-text tracking-wide">
              AI AGENT
            </h2>
            <p className="text-[9px] md:text-[10px] font-mono text-dark-200">
              {isProcessing
                ? currentStatus || "Processing..."
                : hasApiKey
                  ? "Ready"
                  : "Configure API key to start"}
            </p>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {isProcessing && (
              <div className="flex items-center gap-1.5 bg-accent-900/40 border border-accent-700/30 rounded-full px-2.5 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
                <span className="text-[9px] font-mono text-accent-300 hidden md:inline truncate max-w-32">
                  {currentStatus || "Working..."}
                </span>
              </div>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className={`p-2 rounded-lg transition-colors ${
                hasApiKey
                  ? "text-dark-200 hover:text-light-text hover:bg-dark-600"
                  : "text-accent-400 bg-accent-900/40 hover:bg-accent-900/60 border border-accent-700/40"
              }`}
              title="AI Settings"
            >
              <Settings size={isMobile ? 14 : 16} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Messages Area ─── */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6 space-y-4 md:space-y-5"
      >
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-4 animate-fadeIn">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-accent-900/40 border border-accent-700/30 flex items-center justify-center mx-auto mb-5">
                <Sparkles
                  size={isMobile ? 28 : 36}
                  className="text-accent-500"
                />
              </div>
              <h3 className="text-base md:text-xl text-white-text font-mono mb-2 tracking-wide">
                Archaleon AI
              </h3>
              <p className="text-dark-100 text-[11px] md:text-xs font-mono leading-relaxed mb-6">
                {hasApiKey
                  ? "Your AI business intelligence agent. Ask questions, browse the web, analyze deals."
                  : "Configure your Gemini API key to get started with AI-powered analysis."}
              </p>

              {!hasApiKey && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="bg-accent-700 hover:bg-accent-600 text-white font-mono text-xs px-6 py-2.5 rounded-xl transition-colors mb-6 inline-flex items-center gap-2"
                >
                  <Key size={14} />
                  Set Up API Key
                </button>
              )}

              {hasApiKey && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-2.5">
                  {[
                    {
                      icon: Search,
                      label: "Search for SaaS acquisition targets",
                    },
                    {
                      icon: Globe,
                      label: "Browse news.ycombinator.com",
                    },
                    {
                      icon: Brain,
                      label: "Analyze marketplace deal ROI",
                    },
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => {
                        setInput(s.label);
                        inputRef.current?.focus();
                      }}
                      className="flex items-center gap-2 text-[10px] md:text-[11px] font-mono px-3 py-2.5 rounded-xl border border-dark-400/60 text-dark-100 hover:border-accent-600/60 hover:text-accent-300 hover:bg-accent-900/20 transition-all text-left"
                    >
                      <s.icon size={14} className="text-accent-500/60 shrink-0" />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMobile={isMobile}
          />
        ))}

        {/* Typing indicator */}
        {isProcessing &&
          messages.length > 0 &&
          messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3 animate-fadeIn">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-dark-600 border border-dark-400 flex items-center justify-center shrink-0">
                <Bot
                  size={isMobile ? 12 : 14}
                  className="text-accent-400"
                />
              </div>
              <div className="bg-dark-700/60 border border-dark-500/40 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2
                    size={12}
                    className="text-accent-400 animate-spin"
                  />
                  <span className="text-[10px] font-mono text-dark-200">
                    {currentStatus || "Thinking..."}
                  </span>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* ─── Input Area ─── */}
      <div className="relative z-10 p-3 md:p-4 bg-dark-800/80 backdrop-blur-panel border-t border-dark-500/50 safe-bottom">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 md:gap-2.5">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                hasApiKey
                  ? "Ask anything, search the web, browse URLs..."
                  : "Configure API key first..."
              }
              className="flex-1 bg-dark-700/60 border border-dark-400/60 rounded-xl px-4 py-2.5 md:py-3 text-xs md:text-sm font-mono text-light-text placeholder-dark-300 focus:outline-none focus:border-accent-600/60 transition-colors min-w-0"
              disabled={isProcessing || !hasApiKey}
            />
            {isProcessing ? (
              <button
                onClick={handleStop}
                className="bg-red-900/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 px-3 md:px-4 rounded-xl transition-colors flex items-center gap-1.5 font-mono text-xs shrink-0"
              >
                <Square size={isMobile ? 12 : 14} />
                <span className="hidden md:inline">Stop</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() || !hasApiKey}
                className="bg-accent-700/80 hover:bg-accent-600 text-white px-3.5 md:px-5 rounded-xl transition-all flex items-center gap-1.5 font-mono text-xs md:text-sm disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              >
                <Send size={isMobile ? 12 : 14} />
                <span className="hidden md:inline">Send</span>
              </button>
            )}
          </div>

          {/* Capabilities bar */}
          <div className="flex items-center gap-3 mt-2 px-1">
            <div className="flex items-center gap-1">
              <Globe size={9} className="text-dark-300" />
              <span className="text-[8px] font-mono text-dark-300">
                Web Browsing
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Search size={9} className="text-dark-300" />
              <span className="text-[8px] font-mono text-dark-300">
                Search
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Brain size={9} className="text-dark-300" />
              <span className="text-[8px] font-mono text-dark-300">
                Analysis
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Settings Modal ─── */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSave={() => setHasApiKey(true)}
        />
      )}
    </div>
  );
}
