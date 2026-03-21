import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Send,
  Square,
  Zap,
  Globe,
  Brain,
  User,
  Bot,
  Monitor,
  X,
  Maximize2,
  Minimize2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import type { AINode, AIConnection, BrowserState } from "@/types";
import { v4 as uuid } from "uuid";

/* ─── browser simulation pages ─── */
const BROWSER_PAGES: Record<string, { title: string; content: string; color: string }> = {
  "https://www.google.com": {
    title: "Google",
    content: "Google Search — AI is searching the web for relevant results...",
    color: "#1a1a2e",
  },
  "https://news.ycombinator.com": {
    title: "Hacker News",
    content: "Hacker News — Top stories and tech discussions loaded.",
    color: "#1a1a1a",
  },
  "https://marketplace.archaleon.com": {
    title: "Archaleon Marketplace",
    content: "Business listings loaded — 8 businesses found matching criteria.",
    color: "#0d1f0d",
  },
  default: {
    title: "Web Page",
    content: "Page content loaded and parsed for relevant information.",
    color: "#111118",
  },
};

/* ─── Responsive hook ─── */
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

/* ─── Radial layout ─── */
function computeRadialPositions(
  nodes: AINode[],
  cx: number,
  cy: number,
  ringR: number
): AINode[] {
  if (nodes.length === 0) return [];

  const result = [...nodes];
  const groups: Map<string, string[]> = new Map();

  for (const n of result) {
    if (n.type === "user" && !n.parentId) groups.set(n.id, []);
  }

  function findRoot(id: string): string | undefined {
    const n = result.find((x) => x.id === id);
    if (!n) return undefined;
    if (n.type === "user" && !n.parentId) return n.id;
    if (n.parentId) return findRoot(n.parentId);
    return id;
  }

  for (const n of result) {
    if (n.type !== "user" || n.parentId) {
      const root = findRoot(n.id);
      if (root && groups.has(root)) groups.get(root)!.push(n.id);
    }
  }

  const promptIds = Array.from(groups.keys());
  const spacing = ringR * 3;

  promptIds.forEach((pid, pi) => {
    const pn = result.find((n) => n.id === pid)!;
    const pcx = cx + (pi % 3) * spacing - spacing;
    const pcy = cy + Math.floor(pi / 3) * spacing;
    pn.x = pcx;
    pn.y = pcy;

    const children = groups.get(pid)!;
    const total = children.length;

    children.forEach((cid, ci) => {
      const cn = result.find((n) => n.id === cid)!;
      let ring = 1;
      let par = cn.parentId;
      while (par && par !== pid) {
        ring++;
        const p = result.find((n) => n.id === par);
        par = p?.parentId;
      }

      const siblings = children.filter((sid) => {
        const sn = result.find((n) => n.id === sid);
        return sn?.parentId === cn.parentId;
      });
      const si = siblings.indexOf(cid);
      const sc = siblings.length;

      const directParent = cn.parentId === pid;
      let angle: number;
      if (directParent) {
        const spread = Math.PI * 1.5;
        angle = -Math.PI / 2 + (spread / Math.max(total, 1)) * (ci + 0.5);
      } else {
        const parentNode = result.find((n) => n.id === cn.parentId);
        const pa = parentNode ? Math.atan2(parentNode.y - pcy, parentNode.x - pcx) : 0;
        const fan = Math.PI * 0.4;
        angle = pa + (sc > 1 ? fan * (si / (sc - 1) - 0.5) : 0);
      }

      cn.x = pcx + Math.cos(angle) * ringR * ring;
      cn.y = pcy + Math.sin(angle) * ringR * ring;
      cn.angle = angle;
      cn.ring = ring;
    });
  });

  return result;
}

export default function ChatPage() {
  const isMobile = useIsMobile();
  const [rawNodes, setRawNodes] = useState<AINode[]>([]);
  const [connections, setConnections] = useState<AIConnection[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTask, setCurrentTask] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [browserExpanded, setBrowserExpanded] = useState(false);
  const [browserPreviewVisible, setBrowserPreviewVisible] = useState(false);
  const [browserState, setBrowserState] = useState<BrowserState>({
    url: "",
    title: "",
    screenshot: "",
    isLoading: false,
    logs: [],
  });
  const [selectedNode, setSelectedNode] = useState<AINode | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);

  const getCanvasCenter = useCallback(() => {
    if (canvasRef.current) {
      const r = canvasRef.current.getBoundingClientRect();
      return { x: r.width / 2, y: r.height / 2 };
    }
    return { x: 300, y: 300 };
  }, []);

  const ringRadius = isMobile ? 110 : 200;

  // Node sizes
  const promptW = isMobile ? 160 : 256;
  const childW = isMobile ? 140 : 240;
  const promptHalf = promptW / 2;
  const childHalf = childW / 2;

  const positioned = useMemo(
    () => computeRadialPositions(rawNodes, getCanvasCenter().x, getCanvasCenter().y, ringRadius),
    [rawNodes, getCanvasCenter, ringRadius]
  );

  const addNode = useCallback(
    (type: AINode["type"], content: string, parentId?: string, status: AINode["status"] = "complete", extra: Partial<AINode> = {}) => {
      const node: AINode = {
        id: uuid(), type, content, x: 0, y: 0, parentId, status, timestamp: Date.now(), ...extra,
      };
      setRawNodes((p) => [...p, node]);
      if (parentId) setConnections((p) => [...p, { from: parentId, to: node.id }]);
      return node.id;
    },
    []
  );

  const updateNode = useCallback((id: string, status: AINode["status"]) => {
    setRawNodes((p) => p.map((n) => (n.id === id ? { ...n, status } : n)));
  }, []);

  /* ─── Browser sim ─── */
  const simulateBrowse = useCallback(async (url: string): Promise<string> => {
    setBrowserPreviewVisible(true);
    setBrowserState((p) => ({
      ...p, url, isLoading: true, title: "Loading...",
      logs: [...p.logs, `> Navigating to ${url}`],
    }));
    await new Promise((r) => setTimeout(r, 1200));
    const page = BROWSER_PAGES[url] || BROWSER_PAGES["default"];
    setBrowserState((p) => ({
      ...p, title: page.title, screenshot: page.color, isLoading: false,
      logs: [...p.logs, `> Page loaded: ${page.title}`, `> Extracting content...`, `> ${page.content}`],
    }));
    await new Promise((r) => setTimeout(r, 600));
    return page.content;
  }, []);

  /* ─── AI flow ─── */
  const processAI = useCallback(async (prompt: string) => {
    setIsProcessing(true);
    abortRef.current = false;

    const uid = addNode("user", prompt);
    setCurrentTask("Processing your request...");
    await new Promise((r) => setTimeout(r, 500));
    if (abortRef.current) return;

    const tid = addNode("thinking", "Analyzing request and determining the best approach...", uid, "active");
    setCurrentTask("AI is analyzing your request...");
    await new Promise((r) => setTimeout(r, 1000));
    if (abortRef.current) return;
    updateNode(tid, "complete");

    const lp = prompt.toLowerCase();
    let lastId = tid;

    const needsBrowser = ["browse", "website", "visit", "search", "find", "look up", "web"].some((k) => lp.includes(k));
    const needsMarket = ["business", "market", "analyze", "listing", "deal"].some((k) => lp.includes(k));

    if (needsBrowser) {
      setCurrentTask("Launching browser agent...");
      const bid = addNode("browser", "🌐 Browser Agent: Launching Chromium...", lastId, "active", { browserUrl: "https://www.google.com" });
      await simulateBrowse("https://www.google.com");
      if (abortRef.current) return;
      updateNode(bid, "complete");
      setRawNodes((p) => p.map((n) => n.id === bid ? { ...n, content: `🌐 Browser: Searched Google for "${prompt.slice(0, 30)}..."` } : n));

      setCurrentTask("Visiting results page...");
      const vid = addNode("browser", "📄 Navigating to top result...", bid, "active", { browserUrl: "https://news.ycombinator.com" });
      await simulateBrowse("https://news.ycombinator.com");
      if (abortRef.current) return;
      updateNode(vid, "complete");
      setRawNodes((p) => p.map((n) => n.id === vid ? { ...n, content: "📄 Extracted data from results page" } : n));
      lastId = vid;
    }

    if (needsMarket) {
      setCurrentTask("Querying marketplace database...");
      const mid = addNode("tool", "📊 Marketplace Query: Searching business listings...", lastId, "active");
      if (needsBrowser) {
        await simulateBrowse("https://marketplace.archaleon.com");
      } else {
        await new Promise((r) => setTimeout(r, 800));
      }
      if (abortRef.current) return;
      updateNode(mid, "complete");
      setRawNodes((p) => p.map((n) => n.id === mid ? { ...n, content: "📊 Found 8 matching businesses. Revenue range: $680K–$5.2M." } : n));
      lastId = mid;
    }

    if (needsMarket || lp.includes("data") || lp.includes("report")) {
      setCurrentTask("Running analysis algorithms...");
      const aid = addNode("tool", "🧮 Running financial analysis and risk assessment...", lastId, "active");
      await new Promise((r) => setTimeout(r, 900));
      if (abortRef.current) return;
      updateNode(aid, "complete");
      setRawNodes((p) => p.map((n) => n.id === aid ? { ...n, content: "🧮 Analysis complete: Risk score 3/10, ROI 24%" } : n));
      lastId = aid;
    }

    setCurrentTask("Generating response...");
    await new Promise((r) => setTimeout(r, 600));
    if (abortRef.current) return;

    let resp: string;
    if (needsBrowser && needsMarket) {
      resp = "I've completed a comprehensive analysis. I browsed the web for current market data and cross-referenced it with our marketplace listings.\n\n• 8 businesses match your criteria\n• Average asking price: $2.5M\n• Best ROI: FitCore Gym Chain (23.3%)\n\nWould you like me to drill deeper?";
    } else if (needsBrowser) {
      resp = "I've browsed the web and gathered the relevant information. I launched Chromium, searched Google, and visited top results. Want me to visit any specific URLs?";
    } else if (needsMarket) {
      resp = "I've analyzed the marketplace data. Best deals by price-to-revenue ratio are in SaaS and cybersecurity sectors. I can generate a detailed comparison report.";
    } else {
      resp = `I've processed your request: "${prompt}"\n\nI can help with:\n• 🌐 Web browsing (try "search for...")\n• 📊 Business analysis (try "analyze businesses")\n• 🧮 Financial analysis\n• 📄 Data extraction\n\nWhat would you like me to do?`;
    }

    addNode("ai", resp, lastId);
    setCurrentTask("");
    setIsProcessing(false);
  }, [addNode, updateNode, simulateBrowse]);

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    const p = input.trim();
    setInput("");
    processAI(p);
  };

  const handleStop = () => {
    abortRef.current = true;
    setIsProcessing(false);
    setCurrentTask("");
    setRawNodes((p) => p.map((n) => (n.status === "active" ? { ...n, status: "error" as const } : n)));
  };

  /* ─── Mouse panning ─── */
  const handleMouseDown = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t === canvasRef.current || t.classList.contains("dotted-grid") || t.tagName === "svg") {
      setIsDragging(true);
      setDragStart({ x: e.clientX - viewOffset.x, y: e.clientY - viewOffset.y });
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) setViewOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  /* ─── Touch panning ─── */
  const touchRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.target as HTMLElement;
    if (t === canvasRef.current || t.classList.contains("dotted-grid") || t.tagName === "svg") {
      const touch = e.touches[0];
      touchRef.current = { sx: touch.clientX, sy: touch.clientY, ox: viewOffset.x, oy: viewOffset.y };
      setIsDragging(true);
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && touchRef.current && e.touches.length === 1) {
      const touch = e.touches[0];
      setViewOffset({
        x: touchRef.current.ox + (touch.clientX - touchRef.current.sx),
        y: touchRef.current.oy + (touch.clientY - touchRef.current.sy),
      });
    }
  };
  const handleTouchEnd = () => { setIsDragging(false); touchRef.current = null; };

  /* ─── Node helpers ─── */
  const nodeIcon = (type: AINode["type"]) => {
    const s = isMobile ? 10 : 14;
    switch (type) {
      case "user": return <User size={s} />;
      case "ai": return <Bot size={s} />;
      case "tool": return <Zap size={s} />;
      case "thinking": return <Brain size={s} />;
      case "browser": return <Monitor size={s} />;
    }
  };

  const nodeStyle = (type: AINode["type"], status: AINode["status"]) => {
    if (status === "active") return "border-accent-500 bg-accent-900/60 shadow-[0_0_15px_rgba(45,106,45,0.4)]";
    if (status === "error") return "border-red-800/60 bg-red-900/20";
    switch (type) {
      case "user": return "border-accent-600/80 bg-dark-700/90 glow-green-subtle";
      case "ai": return "border-accent-700/60 bg-dark-700/90";
      case "tool": return "border-dark-300/80 bg-dark-600/90";
      case "thinking": return "border-dark-400/60 bg-dark-700/80";
      case "browser": return "border-accent-800/60 bg-dark-600/90";
    }
  };

  const iconColor = (type: AINode["type"]) => {
    switch (type) {
      case "user": return "text-accent-300";
      case "ai": return "text-accent-400";
      case "tool": return "text-accent-300";
      case "thinking": return "text-dark-100";
      case "browser": return "text-accent-400";
    }
  };

  const typeLabel = (type: AINode["type"]) => {
    switch (type) {
      case "user": return "PROMPT";
      case "ai": return "RESPONSE";
      case "tool": return "TOOL";
      case "thinking": return "THINKING";
      case "browser": return "BROWSER";
    }
  };

  /* ─── Auto-center on latest node ─── */
  useEffect(() => {
    if (positioned.length > 0) {
      const latest = positioned[positioned.length - 1];
      const el = canvasRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const hw = latest.type === "user" && !latest.parentId ? promptHalf : childHalf;
        setViewOffset({
          x: -latest.x + r.width / 2 - hw,
          y: -latest.y + r.height / 2 - 30,
        });
      }
    }
  }, [positioned.length, promptHalf, childHalf]);

  /* ═══════════════════════════════════════════════════════════
     RENDER — Everything is absolutely positioned inside the
     container which fills the space between mobile header & nav
     (or sidebar on desktop). The dotted grid background fills
     the entire container.
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* ░░░ Dotted grid background ░░░ */}
      <div className="absolute inset-0 bg-dark-900 dotted-grid" />

      {/* ░░░ Decorative rings ░░░ */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
        {(isMobile ? [100, 200] : [200, 400, 600]).map((r, i) => (
          <circle key={i} cx="50%" cy="50%" r={r} fill="none" stroke="#2d6a2d" strokeWidth="0.5" strokeDasharray="4 8"
            style={{ animation: `ringPulse ${3 + i}s ease-in-out infinite` }} />
        ))}
      </svg>

      {/* ░░░ Pannable canvas ░░░ */}
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── Empty state ── */}
        {positioned.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
            <div className="text-center animate-fadeIn floating-panel rounded-2xl p-5 pointer-events-auto max-w-[280px] md:max-w-none md:px-10 md:py-8">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent-900/50 border border-accent-700/40 flex items-center justify-center mx-auto mb-3">
                <Brain size={isMobile ? 20 : 28} className="text-accent-500" />
              </div>
              <h3 className="text-sm md:text-lg text-white-text font-mono mb-2 tracking-wide">Neural Network</h3>
              <p className="text-dark-100 text-[10px] md:text-xs font-mono max-w-sm leading-relaxed mb-3">
                Send a prompt to begin. The AI will use browser automation, marketplace analysis, and web research.
              </p>
              <div className="flex gap-1.5 justify-center flex-wrap">
                {["Search for SaaS deals", "Browse tech news", "Analyze marketplace"].map((s) => (
                  <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="text-[9px] md:text-[10px] font-mono px-2.5 py-1.5 rounded-full border border-dark-400 text-dark-100 hover:border-accent-600 hover:text-accent-300 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SVG connections ── */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: `translate(${viewOffset.x}px, ${viewOffset.y}px)` }}>
          <defs>
            <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2d6a2d" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#4da64d" stopOpacity="0.3" />
            </linearGradient>
            <filter id="gl">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {connections.map((c, i) => {
            const f = positioned.find((n) => n.id === c.from);
            const t = positioned.find((n) => n.id === c.to);
            if (!f || !t) return null;
            const fip = f.type === "user" && !f.parentId;
            const tip = t.type === "user" && !t.parentId;
            const fh = fip ? promptHalf : childHalf;
            const th = tip ? promptHalf : childHalf;
            const x1 = f.x + fh, y1 = f.y + 25;
            const x2 = t.x + th, y2 = t.y + 25;
            const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
            const dx = x2 - x1, dy = y2 - y1;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d === 0) return null;
            const cv = Math.min(d * 0.3, isMobile ? 40 : 80);
            const nx = -dy / d, ny = dx / d;
            const cx1 = mx + nx * cv, cy1 = my + ny * cv;
            const active = t.status === "active";
            return (
              <g key={i}>
                <path d={`M ${x1} ${y1} Q ${cx1} ${cy1}, ${x2} ${y2}`} stroke="#2d6a2d" strokeWidth={isMobile ? 1.5 : 3}
                  fill="none" opacity="0.15" filter="url(#gl)" className="connection-line" />
                <path d={`M ${x1} ${y1} Q ${cx1} ${cy1}, ${x2} ${y2}`} stroke="url(#lg)" strokeWidth={isMobile ? 1 : 1.5}
                  fill="none" opacity={active ? 0.8 : 0.5} strokeDasharray={active ? "6 4" : "none"} className="connection-line" />
                <circle cx={x2} cy={y2} r={isMobile ? 2 : 3} fill="#2d6a2d" opacity="0.6" />
              </g>
            );
          })}
        </svg>

        {/* ── Nodes ── */}
        <div className="absolute" style={{ transform: `translate(${viewOffset.x}px, ${viewOffset.y}px)` }}>
          {positioned.map((node) => {
            const isPrompt = node.type === "user" && !node.parentId;
            const w = isPrompt ? promptW : childW;
            return (
              <div key={node.id}
                className={`absolute rounded-xl border backdrop-blur-panel animate-nodeAppear transition-all duration-300 cursor-pointer hover:scale-[1.02] ${nodeStyle(node.type, node.status)} ${selectedNode?.id === node.id ? "ring-1 ring-accent-500/50" : ""}`}
                style={{ left: node.x, top: node.y, width: w }}
                onClick={(e) => { e.stopPropagation(); setSelectedNode(selectedNode?.id === node.id ? null : node); }}>
                {/* Header */}
                <div className="flex items-center gap-1.5 px-2 pt-2 pb-0.5 md:px-3 md:pt-2.5 md:pb-1">
                  <span className={`${iconColor(node.type)} ${isPrompt ? "bg-accent-900/60 p-0.5 rounded" : ""}`}>
                    {nodeIcon(node.type)}
                  </span>
                  <span className="text-[7px] md:text-[9px] font-mono text-dark-200 uppercase tracking-widest">{typeLabel(node.type)}</span>
                  {node.status === "active" && <Loader2 size={isMobile ? 8 : 10} className="ml-auto text-accent-400 animate-spin" />}
                  {node.status === "complete" && <span className="ml-auto text-[8px] md:text-[10px] font-mono text-accent-600">✓</span>}
                  {node.status === "error" && <span className="ml-auto text-[8px] md:text-[10px] font-mono text-red-500">✗</span>}
                </div>
                {/* Content */}
                <div className="px-2 pb-2 md:px-3 md:pb-2.5">
                  <p className={`text-[9px] md:text-[11px] font-mono leading-relaxed ${isPrompt ? "text-accent-200" : "text-light-text"} ${selectedNode?.id === node.id ? "" : "line-clamp-3"}`}>
                    {node.content}
                  </p>
                </div>
                {/* Browser URL */}
                {node.type === "browser" && node.browserUrl && (
                  <div className="px-2 pb-1.5 flex items-center gap-1 md:px-3 md:pb-2">
                    <Globe size={isMobile ? 7 : 9} className="text-dark-200" />
                    <span className="text-[7px] md:text-[9px] font-mono text-dark-200 truncate">{node.browserUrl}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
           FLOATING UI — Positioned relative to container edges
         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */}

      {/* ── Floating header pill ── */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20">
        <div className="floating-panel rounded-lg px-2.5 py-1.5 md:px-4 md:py-2.5 flex items-center gap-1.5">
          <Zap size={isMobile ? 11 : 14} className="text-accent-500" />
          <span className="font-mono text-[10px] md:text-xs text-light-text tracking-wide">AI AGENT</span>
          {positioned.length > 0 && (
            <>
              <span className="text-dark-300 mx-1">·</span>
              <span className="text-[9px] md:text-[10px] font-mono text-dark-200">{positioned.length} nodes</span>
              <span className="text-dark-300 mx-1 hidden md:inline">·</span>
              <span className="text-[9px] font-mono text-dark-200 hidden md:inline">{connections.length} links</span>
            </>
          )}
        </div>
      </div>

      {/* ── Floating task bar ── */}
      {currentTask && (
        <div className="absolute top-2 right-2 md:top-4 md:left-1/2 md:-translate-x-1/2 md:right-auto z-20 max-w-[55%] md:max-w-sm animate-slideUp">
          <div className="floating-panel rounded-full px-3 py-1.5 md:px-5 md:py-2 flex items-center gap-2 glow-green-subtle">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-accent-500 animate-pulse shrink-0" />
            <span className="text-[8px] md:text-[11px] font-mono text-accent-300 truncate">{currentTask}</span>
          </div>
        </div>
      )}

      {/* ── Browser preview (minimized) — sits above the input ── */}
      {browserPreviewVisible && !browserExpanded && (
        <div className="absolute z-20 animate-slideUp"
          style={{
            bottom: isMobile ? 68 : 96,
            left: "50%",
            transform: "translateX(-50%)",
            width: isMobile ? 240 : 320,
          }}>
          <div className="floating-panel rounded-xl overflow-hidden cursor-pointer hover:border-accent-600/60 transition-colors group"
            onClick={() => setBrowserExpanded(true)}>
            {/* Mini chrome */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-dark-600/50 border-b border-dark-500/50">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-dark-300" />
                <div className="w-1.5 h-1.5 rounded-full bg-dark-300" />
                <div className="w-1.5 h-1.5 rounded-full bg-dark-300" />
              </div>
              <div className="flex-1 text-center min-w-0">
                <span className="text-[7px] md:text-[9px] font-mono text-dark-200 truncate block">{browserState.url || "about:blank"}</span>
              </div>
              <Maximize2 size={9} className="text-dark-200 group-hover:text-accent-400 transition-colors shrink-0" />
            </div>
            {/* Mini content */}
            <div className="h-10 md:h-16 flex items-center justify-center px-2"
              style={{ background: browserState.screenshot || "#111" }}>
              {browserState.isLoading ? (
                <Loader2 size={12} className="text-accent-400 animate-spin" />
              ) : (
                <div className="text-center">
                  <Monitor size={10} className="text-accent-500/60 mx-auto mb-0.5" />
                  <p className="text-[7px] md:text-[9px] font-mono text-dark-200">{browserState.title || "Browser"}</p>
                  <p className="text-[6px] md:text-[8px] font-mono text-dark-300">Tap to expand</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Browser preview (expanded overlay) ── */}
      {browserExpanded && (
        <div className="absolute inset-2 md:inset-8 z-30 animate-browserFadeIn">
          <div className="floating-panel rounded-xl md:rounded-2xl overflow-hidden h-full flex flex-col glow-green">
            {/* Chrome bar */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 md:px-4 md:py-2.5 bg-dark-700/80 border-b border-dark-500/50 shrink-0">
              <div className="flex gap-1.5">
                <button onClick={() => setBrowserExpanded(false)} className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/60 hover:bg-red-500 transition-colors" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/40" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/40" />
              </div>
              <div className="flex-1 flex items-center gap-1.5 bg-dark-600/60 rounded-md px-2 py-1 min-w-0">
                {browserState.isLoading
                  ? <Loader2 size={10} className="text-accent-400 animate-spin shrink-0" />
                  : <Globe size={10} className="text-dark-200 shrink-0" />}
                <span className="text-[9px] md:text-[11px] font-mono text-dark-100 flex-1 truncate">{browserState.url || "about:blank"}</span>
                <ExternalLink size={10} className="text-dark-300 hidden md:block shrink-0" />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setBrowserExpanded(false)} className="text-dark-200 hover:text-light-text transition-colors p-1">
                  <Minimize2 size={isMobile ? 12 : 14} />
                </button>
                <button onClick={() => { setBrowserExpanded(false); setBrowserPreviewVisible(false); }} className="text-dark-200 hover:text-red-400 transition-colors p-1">
                  <X size={isMobile ? 12 : 14} />
                </button>
              </div>
            </div>
            {/* Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
              {/* Page sim */}
              <div className="flex-1 flex items-center justify-center relative p-3 md:p-4 min-h-0"
                style={{ background: browserState.screenshot || "#0a0a0a" }}>
                {browserState.isLoading ? (
                  <div className="text-center">
                    <Loader2 size={isMobile ? 24 : 32} className="text-accent-400 animate-spin mx-auto mb-3" />
                    <p className="text-[10px] md:text-xs font-mono text-dark-200">Loading page...</p>
                  </div>
                ) : browserState.url ? (
                  <div className="text-center px-4 md:px-8 max-w-lg">
                    <Monitor size={isMobile ? 24 : 36} className="text-accent-500/40 mx-auto mb-2 md:mb-4" />
                    <h3 className="text-sm md:text-lg font-mono text-light-text mb-1.5">{browserState.title}</h3>
                    <p className="text-[10px] md:text-xs font-mono text-dark-200 leading-relaxed">
                      {BROWSER_PAGES[browserState.url]?.content || BROWSER_PAGES["default"].content}
                    </p>
                    <div className="mt-2 flex gap-1.5 justify-center flex-wrap">
                      <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-accent-900/40 text-accent-300 border border-accent-800/40">DOM Loaded</span>
                      <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-dark-600 text-dark-100 border border-dark-400">JS Enabled</span>
                      <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-dark-600 text-dark-100 border border-dark-400">Extracted</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Globe size={isMobile ? 32 : 48} className="text-dark-400 mx-auto mb-2" />
                    <p className="text-xs font-mono text-dark-200">No page loaded</p>
                  </div>
                )}
              </div>
              {/* Log panel */}
              <div className="h-24 md:h-auto md:w-64 bg-dark-800/80 border-t md:border-t-0 md:border-l border-dark-500/50 flex flex-col shrink-0">
                <div className="px-2.5 py-1.5 border-b border-dark-500/50 flex items-center gap-2">
                  <span className="text-[9px] font-mono text-dark-200 uppercase tracking-widest">Agent Log</span>
                  <span className="ml-auto text-[8px] font-mono text-dark-300">{browserState.logs.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
                  {browserState.logs.map((log, i) => (
                    <p key={i} className="text-[9px] font-mono text-dark-100 leading-relaxed">{log}</p>
                  ))}
                  {browserState.logs.length === 0 && <p className="text-[9px] font-mono text-dark-300">No activity yet...</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating input area — pinned to bottom ── */}
      <div className="absolute z-20"
        style={{
          bottom: isMobile ? 8 : 24,
          left: "50%",
          transform: "translateX(-50%)",
          width: isMobile ? "92%" : "100%",
          maxWidth: isMobile ? undefined : 640,
        }}>
        <div className="floating-panel rounded-xl md:rounded-2xl p-2 md:p-3 glow-green-subtle">
          <div className="flex gap-1.5 md:gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask the AI agent..."
              className="flex-1 bg-dark-700/60 border border-dark-400/60 rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-mono text-light-text placeholder-dark-200 focus:outline-none focus:border-accent-600/60 transition-colors min-w-0"
              disabled={isProcessing}
            />
            {isProcessing ? (
              <button onClick={handleStop}
                className="bg-red-900/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 px-3 md:px-4 rounded-lg md:rounded-xl transition-colors flex items-center gap-1.5 font-mono text-xs shrink-0">
                <Square size={isMobile ? 12 : 14} />
                <span className="hidden md:inline">Stop</span>
              </button>
            ) : (
              <button onClick={handleSend} disabled={!input.trim()}
                className="bg-accent-700/80 hover:bg-accent-600 text-white-text px-3 md:px-5 rounded-lg md:rounded-xl transition-all flex items-center gap-1.5 font-mono text-xs md:text-sm disabled:opacity-30 disabled:cursor-not-allowed shrink-0">
                <Send size={isMobile ? 12 : 14} />
                <span className="hidden md:inline">Send</span>
              </button>
            )}
          </div>
          {/* Quick actions */}
          {!isProcessing && positioned.length > 0 && (
            <div className="flex gap-1.5 mt-1.5 px-0.5">
              <button onClick={() => browserPreviewVisible && setBrowserExpanded(!browserExpanded)}
                className={`text-[8px] md:text-[9px] font-mono px-2 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                  browserPreviewVisible ? "border-accent-700/50 text-accent-300 bg-accent-900/30" : "border-dark-400/40 text-dark-300 cursor-default"
                }`}>
                <Monitor size={isMobile ? 8 : 9} />
                Browser {browserPreviewVisible ? (browserExpanded ? "▼" : "▲") : "—"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
