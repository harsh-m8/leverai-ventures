'use client';
import { useState, useEffect } from "react";
import { useDashboardData } from "./useDashboardData";
import { useIntegrations } from "./useIntegrations";
import DataDrawer from "./DataDrawer";
import IntegrationsPage from "./IntegrationsPage";
import { createClient } from "./lib/supabase/client";

// ─────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────
const C = {
  orange:   "#E85D04",
  orangeHi: "#f97316",
  purple:   "#7C3AED",
  blue:     "#0369A1",
  green:    "#059669",
  amber:    "#B45309",
  teal:     "#0D9488",
  red:      "#DC2626",
};

// ─────────────────────────────────────────────────────────────────
// ICON HELPER
// ─────────────────────────────────────────────────────────────────
const Icon = ({ d, className = "w-5 h-5", sw = 1.5 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={sw} stroke="currentColor" className={className}>
    {[].concat(d).map((p, i) => (
      <path key={i} strokeLinecap="round" strokeLinejoin="round" d={p} />
    ))}
  </svg>
);

const ICONS = {
  arrowLeft:   "M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18",
  trendUp:     "M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941",
  trendDown:   "M2.25 6 9 12.75l4.306-4.306a11.95 11.95 0 0 1 5.814 5.518l2.74 1.22m0 0-5.94 2.281m5.94-2.28-2.28-5.941",
  sparkles:    "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z",
  chartBar:    ["M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75z",
                "M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625z",
                "M16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z"],
  currency:    ["M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"],
  target:      ["M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
                "M19.5 12c0 4.142-3.358 7.5-7.5 7.5S4.5 16.142 4.5 12 7.858 4.5 12 4.5s7.5 3.358 7.5 7.5Z"],
  arrowPath:   "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99",
  bolt:        "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  bell:        "M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0",
  pencil:      "m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125",
  puzzle:      "M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z",
  info:        ["m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25z"],
};

// ─────────────────────────────────────────────────────────────────
// KPI META (icon + color per index — design constants, not editable)
// ─────────────────────────────────────────────────────────────────
const KPI_META = [
  { icon: ICONS.currency,  color: C.orange  },
  { icon: ICONS.chartBar,  color: C.green   },
  { icon: ICONS.trendUp,   color: C.blue    },
  { icon: ICONS.target,    color: C.purple  },
  { icon: ICONS.bolt,      color: C.amber   },
  { icon: ICONS.arrowPath, color: C.teal    },
];

const CHANNEL_META = [
  { icon: "M", color: "#1877F2" },
  { icon: "G", color: "#EA4335" },
  { icon: "T", color: "#000000" },
  { icon: "E", color: C.teal    },
];

const INSIGHT_COLORS = { green: C.green, orange: C.orange, purple: C.purple, blue: C.blue };
const INSIGHT_ICONS  = { green: ICONS.sparkles, orange: ICONS.bolt, purple: ICONS.arrowPath, blue: ICONS.info };

const MONTHS = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

// ─────────────────────────────────────────────────────────────────
// SVG AREA SPARKLINE
// ─────────────────────────────────────────────────────────────────
function AreaChart({ data, color, height = 64, width = 120 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height * 0.85) - height * 0.07,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <path d={area} fill={`${color}18`} />
      <path d={line} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN REVENUE CHART
// ─────────────────────────────────────────────────────────────────
function RevenueChart({ activeTab, chartData }) {
  const W = 760, H = 220, PAD = { t: 16, r: 16, b: 36, l: 52 };
  const inner = { w: W - PAD.l - PAD.r, h: H - PAD.t - PAD.b };

  const { revenue, profit, adSpend } = chartData;
  const allVals = [...revenue, ...profit, ...adSpend];
  const max = Math.ceil(Math.max(...allVals) / 20) * 20 || 20;
  const gridLines = [0, 25, 50, 75, 100, 125].filter(v => v <= max + 10);

  const toY = v => PAD.t + inner.h - (v / max) * inner.h;
  const toX = i => PAD.l + (i / (MONTHS.length - 1)) * inner.w;

  const makePath = data =>
    data.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");
  const makeArea = data => {
    const line = makePath(data);
    return `${line} L${toX(data.length - 1)},${H - PAD.b} L${PAD.l},${H - PAD.b} Z`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {gridLines.map(v => (
        <g key={v}>
          <line x1={PAD.l} y1={toY(v)} x2={W - PAD.r} y2={toY(v)} stroke="#f3f4f6" strokeWidth="1" />
          <text x={PAD.l - 8} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{v}</text>
        </g>
      ))}
      {(activeTab === "all" || activeTab === "spend")   && <path d={makeArea(adSpend)}  fill={`${C.blue}10`} />}
      {(activeTab === "all" || activeTab === "profit")  && <path d={makeArea(profit)}   fill={`${C.green}12`} />}
      {(activeTab === "all" || activeTab === "revenue") && <path d={makeArea(revenue)}  fill={`${C.orange}10`} />}
      {(activeTab === "all" || activeTab === "spend")   && <path d={makePath(adSpend)}  stroke={C.blue}   strokeWidth="2"   fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {(activeTab === "all" || activeTab === "profit")  && <path d={makePath(profit)}   stroke={C.green}  strokeWidth="2"   fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {(activeTab === "all" || activeTab === "revenue") && <path d={makePath(revenue)}  stroke={C.orange} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {(activeTab === "all" || activeTab === "revenue") && <circle cx={toX(11)} cy={toY(revenue[11])}  r="4" fill={C.orange} stroke="white" strokeWidth="2" />}
      {(activeTab === "all" || activeTab === "profit")  && <circle cx={toX(11)} cy={toY(profit[11])}   r="4" fill={C.green}  stroke="white" strokeWidth="2" />}
      {(activeTab === "all" || activeTab === "spend")   && <circle cx={toX(11)} cy={toY(adSpend[11])}  r="4" fill={C.blue}   stroke="white" strokeWidth="2" />}
      {MONTHS.map((m, i) => (
        <text key={m} x={toX(i)} y={H - PAD.b + 18} textAnchor="middle" fontSize="10" fill="#9ca3af">{m}</text>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, delta, up, icon, color, sub }) {
  return (
    <div className="relative rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-3
      transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.09)] hover:border-gray-200 group">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}12`, color, border: `1.5px solid ${color}22` }}>
          <Icon d={icon} className="w-4.5 h-4.5" sw={1.75} />
        </div>
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full
          ${up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {up
            ? <Icon d={ICONS.trendUp}   className="w-3 h-3" sw={2.5} />
            : <Icon d={ICONS.trendDown} className="w-3 h-3" sw={2.5} />}
          {delta}
        </span>
      </div>
      <div>
        <p className="text-[28px] font-extrabold text-gray-900 tracking-tight leading-none">{value}</p>
        <p className="text-[11px] text-gray-400 mt-1.5 font-medium">{label}</p>
        <p className="text-[10.5px] text-gray-300 mt-0.5">{sub}</p>
      </div>
      <div className="absolute bottom-0 left-5 right-5 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${color}00, ${color}, ${color}00)` }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CHANNEL ROW
// ─────────────────────────────────────────────────────────────────
function ChannelRow({ ch, meta, isLast }) {
  return (
    <tr className={`group hover:bg-orange-50/30 transition-colors ${!isLast ? "border-b border-gray-50" : ""}`}>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-black flex-shrink-0"
            style={{ background: meta.color }}>{meta.icon}</div>
          <span className="text-sm font-semibold text-gray-800">{ch.name}</span>
        </div>
      </td>
      <td className="px-4 py-3.5 text-sm font-bold text-gray-900 tabular-nums">{ch.revenue}</td>
      <td className="px-4 py-3.5 text-sm text-gray-500 tabular-nums">{ch.spend}</td>
      <td className="px-4 py-3.5">
        <span className="text-sm font-bold" style={{ color: C.orange }}>{ch.roas}</span>
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-700 tabular-nums">{ch.cac}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden" style={{ minWidth: 60 }}>
            <div className="h-full rounded-full"
              style={{ width: ch.margin, background: `linear-gradient(90deg, ${C.green}55, ${C.green})` }} />
          </div>
          <span className="text-sm font-semibold text-gray-700 w-8 text-right tabular-nums">{ch.margin}</span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <AreaChart data={ch.trend} color={ch.up ? C.green : C.red} height={32} width={72} />
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────
// PRODUCT ROW
// ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  star:  { label: "Top Performer", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  ok:    { label: "Healthy",       bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500"    },
  watch: { label: "Watch",         bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500"   },
  alert: { label: "Needs Fix",     bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500"     },
};

function ProductRow({ p, isLast }) {
  const s = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.ok;
  const marginColor = p.marginVal >= 60 ? C.green : p.marginVal >= 45 ? C.amber : C.red;
  return (
    <tr className={`group hover:bg-orange-50/30 transition-colors ${!isLast ? "border-b border-gray-50" : ""}`}>
      <td className="px-5 py-3.5">
        <p className="text-sm font-semibold text-gray-800">{p.name}</p>
        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{p.sku}</p>
      </td>
      <td className="px-4 py-3.5 text-sm font-bold text-gray-900 tabular-nums">{p.revenue}</td>
      <td className="px-4 py-3.5 text-sm text-gray-500 tabular-nums">{Number(p.units).toLocaleString()}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full"
              style={{ width: `${p.marginVal}%`, background: `linear-gradient(90deg, ${marginColor}55, ${marginColor})` }} />
          </div>
          <span className="text-sm font-semibold text-gray-700 tabular-nums">{p.margin}</span>
        </div>
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-600 tabular-nums">{p.cac}</td>
      <td className="px-4 py-3.5 text-sm font-medium text-gray-700 tabular-nums">{p.ltv}</td>
      <td className="px-4 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────
// INSIGHT CARD
// ─────────────────────────────────────────────────────────────────
function InsightCard({ insight }) {
  const color = INSIGHT_COLORS[insight.colorKey] ?? C.orange;
  const icon  = INSIGHT_ICONS[insight.colorKey]  ?? ICONS.sparkles;
  return (
    <div className="rounded-2xl border bg-white p-5 flex gap-4 transition-all duration-200
      hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]"
      style={{ borderColor: `${color}22` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${color}12`, color }}>
        <Icon d={icon} className="w-4 h-4" sw={2} />
      </div>
      <div>
        <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2"
          style={{ background: `${color}12`, color }}>
          {insight.badge}
        </span>
        <p className="text-sm font-bold text-gray-900 leading-snug mb-1.5">{insight.title}</p>
        <p className="text-[12.5px] text-gray-500 leading-relaxed">{insight.body}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// DATA SOURCE BADGE
// ─────────────────────────────────────────────────────────────────
function DataSourceBadge({ integrations }) {
  const connected = Object.entries(integrations)
    .filter(([, v]) => v.status === "connected")
    .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));
  if (connected.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
        <span className="w-2 h-2 rounded-full bg-gray-300" />
        Manual data
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      Live · {connected.join(", ")}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [chartTab,   setChartTab]   = useState("all");
  const [dateRange,  setDateRange]  = useState("Last 30 days");
  const [activeView, setActiveView] = useState("dashboard"); // "dashboard" | "integrations"
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user,       setUser]       = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  const {
    integrations, syncing,
    connect, disconnect, syncNow, connectedCount,
  } = useIntegrations();

  const {
    data,
    updateKpi, updateChart, updateChannel, updateProduct, resetToDefaults,
  } = useDashboardData(integrations);

  const chartTabs = [
    { id: "all",     label: "All"      },
    { id: "revenue", label: "Revenue"  },
    { id: "profit",  label: "Profit"   },
    { id: "spend",   label: "Ad Spend" },
  ];

  const summaryRows = [
    { label: "Revenue",      key: "revenue",   color: C.orange },
    { label: "Gross Profit", key: "profit",    color: C.green  },
    { label: "Ad Spend",     key: "adSpend",   color: C.blue   },
    { label: "Net Profit",   key: "netProfit", color: C.teal   },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F5] antialiased" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        a { text-decoration: none; color: inherit; }
      `}</style>

      {/* ════ TOP NAV ════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_1px_12px_rgba(0,0,0,.05)]">
        <div className="max-w-[1400px] mx-auto px-5 h-[60px] flex items-center justify-between gap-4">

          {/* Left: Logo + title */}
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E85D04] to-[#f97316] flex items-center justify-center shadow-[0_2px_8px_rgba(232,93,4,.35)]">
                <svg viewBox="0 0 20 20" fill="none" className="w-[18px] h-[18px]">
                  <path d="M4 15 8 6l3.5 5.5L14 7l3 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="leading-tight hidden sm:block">
                <span className="font-extrabold text-[15px] text-gray-900 tracking-tight">LeverAI</span>
                <span className="font-normal text-[15px] text-gray-400 tracking-tight"> Ventures</span>
              </div>
            </a>

            {/* View tabs */}
            <div className="hidden sm:flex items-center gap-1 ml-2 bg-gray-100 rounded-xl p-1">
              <button onClick={() => setActiveView("dashboard")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-lg transition-all
                  ${activeView === "dashboard" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                <Icon d={ICONS.chartBar} className="w-3.5 h-3.5" sw={2} />
                Dashboard
              </button>
              <button onClick={() => setActiveView("integrations")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-lg transition-all
                  ${activeView === "integrations" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                <Icon d={ICONS.puzzle} className="w-3.5 h-3.5" sw={2} />
                Integrations
                {connectedCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center">
                    {connectedCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2.5">
            <DataSourceBadge integrations={integrations} />

            {activeView === "dashboard" && (
              <select value={dateRange} onChange={e => setDateRange(e.target.value)}
                className="hidden sm:block text-[12px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 hover:border-gray-300 transition-colors">
                {["Last 7 days", "Last 30 days", "Last 90 days", "Last 12 months"].map(r => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            )}

            {/* Edit data button */}
            {activeView === "dashboard" && (
              <button onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-gray-600
                  bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-colors">
                <Icon d={ICONS.pencil} className="w-3.5 h-3.5" sw={2} />
                <span className="hidden sm:inline">Edit Data</span>
              </button>
            )}

            <button className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <Icon d={ICONS.bell} className="w-4.5 h-4.5" sw={1.75} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E85D04] border-2 border-white" />
            </button>

            {/* User menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all duration-150">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#E85D04] to-[#f97316] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[9px] font-black">{user.email?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-gray-600 max-w-[120px] truncate">{user.email}</span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-gray-100 shadow-lg z-50 overflow-hidden">
                      <a href="/"
                        className="flex items-center gap-2 px-4 py-2.5 text-[12.5px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                        <Icon d={ICONS.arrowLeft} className="w-3.5 h-3.5" sw={2} />
                        Back to overview
                      </a>
                      <div className="border-t border-gray-50" />
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-[12.5px] font-semibold text-red-500 hover:bg-red-50 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ════ PAGE BODY ══════════════════════════════════════════════ */}
      <main className="max-w-[1400px] mx-auto px-5 py-8 space-y-8">

        {activeView === "integrations" ? (
          <IntegrationsPage
            integrations={integrations}
            onConnect={connect}
            onDisconnect={disconnect}
            onSyncNow={syncNow}
            syncing={syncing}
          />
        ) : (
          <>
            {/* Page heading */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#E85D04] mb-1">
                  {connectedCount > 0 ? "Live Sync · " : "Manual · "}
                  {dateRange}
                </p>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Profit Overview</h1>
                <p className="text-[13px] text-gray-400 mt-0.5">Real-time margins, CAC, LTV, and blended ROAS.</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setDrawerOpen(true)}
                  className="sm:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold text-gray-600
                    bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
                  <Icon d={ICONS.pencil} className="w-3.5 h-3.5" sw={2} />
                  Edit Data
                </button>
                <p className="text-[11px] text-gray-400">Last updated: just now</p>
              </div>
            </div>

            {/* ── KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
              {data.kpis.map((k, i) => (
                <KpiCard key={k.label} {...k}
                  icon={KPI_META[i].icon}
                  color={KPI_META[i].color} />
              ))}
            </div>

            {/* ── Revenue Chart + Summary */}
            <div className="grid xl:grid-cols-[1fr_280px] gap-5">
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Performance Trend</p>
                    <p className="text-[16px] font-bold text-gray-900">Revenue, Profit & Ad Spend — Last 12 Months</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 flex-shrink-0">
                    {chartTabs.map(t => (
                      <button key={t.id} onClick={() => setChartTab(t.id)}
                        className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-150
                          ${chartTab === t.id
                            ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                            : "text-gray-400 hover:text-gray-600"}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mb-5">
                  {(chartTab === "all" || chartTab === "revenue") && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                      <span className="w-3 h-0.5 rounded-full" style={{ background: C.orange }} />Revenue
                    </div>
                  )}
                  {(chartTab === "all" || chartTab === "profit") && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                      <span className="w-3 h-0.5 rounded-full" style={{ background: C.green }} />Gross Profit
                    </div>
                  )}
                  {(chartTab === "all" || chartTab === "spend") && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                      <span className="w-3 h-0.5 rounded-full" style={{ background: C.blue }} />Ad Spend
                    </div>
                  )}
                </div>
                <RevenueChart activeTab={chartTab} chartData={data.chart} />
              </div>

              {/* Summary panel */}
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">This Month</p>
                {summaryRows.map(row => {
                  const item = data.summary[row.key] ?? { value: "—", bar: 0 };
                  return (
                    <div key={row.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] font-semibold text-gray-500">{row.label}</span>
                        <span className="text-[13px] font-bold text-gray-900 tabular-nums">{item.value}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${item.bar}%`, background: `linear-gradient(90deg, ${row.color}55, ${row.color})` }} />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-4 border-t border-gray-100 mt-auto space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-medium">Profit Margin</span>
                    <span className="text-[12px] font-bold text-gray-900">{data.summary.profitMargin}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-medium">MoM Growth</span>
                    <span className="text-[12px] font-bold text-emerald-600">{data.summary.momGrowth}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-medium">ROAS Efficiency</span>
                    <span className="text-[12px] font-bold" style={{ color: C.orange }}>{data.summary.roasEfficiency}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Channel Performance */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Channel Breakdown</p>
                <p className="text-[15px] font-bold text-gray-900">Performance by Acquisition Channel</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="bg-gray-50/70">
                      {["Channel", "Revenue", "Ad Spend", "ROAS", "CAC", "Margin", "Trend"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 first:px-5">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.channels.map((ch, i) => (
                      <ChannelRow key={ch.name} ch={ch}
                        meta={CHANNEL_META[i] ?? CHANNEL_META[0]}
                        isLast={i === data.channels.length - 1} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Product Profitability + AI Insights */}
            <div className="grid xl:grid-cols-[1fr_360px] gap-5">
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Catalog Analysis</p>
                  <p className="text-[15px] font-bold text-gray-900">Product Profitability</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="bg-gray-50/70">
                        {["Product", "Revenue", "Units", "Margin", "CAC", "LTV", "Status"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 first:px-5">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.products.map((p, i) => (
                        <ProductRow key={p.sku} p={p} isLast={i === data.products.length - 1} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">AI Analysis</p>
                    <p className="text-[15px] font-bold text-gray-900">Insights & Actions</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background: `${C.orange}10`, color: C.orange }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E85D04] animate-pulse" />
                    {data.insights.length} new
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {data.insights.map(ins => (
                    <InsightCard key={ins.title} insight={ins} />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4 border-t border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#E85D04] to-[#f97316] flex items-center justify-center">
                  <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5">
                    <path d="M4 15 8 6l3.5 5.5L14 7l3 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[12px] font-bold text-gray-400">LeverAI Ventures — AI Profit Dashboard</span>
              </div>
              <p className="text-[11px] text-gray-300">
                {connectedCount > 0 ? "Live data · Refreshes every 15 min" : "Manual data · Connect integrations for live sync"}
              </p>
            </div>
          </>
        )}
      </main>

      {/* ════ EDIT DRAWER ════════════════════════════════════════════ */}
      <DataDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        data={data}
        updateKpi={updateKpi}
        updateChart={updateChart}
        updateChannel={updateChannel}
        updateProduct={updateProduct}
        resetToDefaults={resetToDefaults}
      />
    </div>
  );
}
