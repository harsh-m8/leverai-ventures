'use client';
import { useState } from "react";

const MONTHS = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

const CHANNEL_META = [
  { icon: "M", color: "#1877F2" },
  { icon: "G", color: "#EA4335" },
  { icon: "T", color: "#000000" },
  { icon: "E", color: "#0D9488" },
];

// ── Tiny input ────────────────────────────────────────────────────
function Input({ value, onChange, type = "text", className = "", min, step, placeholder }) {
  return (
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      min={min} step={step} placeholder={placeholder}
      className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5
        text-[12.5px] text-gray-800 font-medium
        focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-300
        hover:border-gray-300 transition-colors ${className}`}
    />
  );
}

// ── Section header ────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 mt-4 first:mt-0">
      {children}
    </p>
  );
}

// ── Tab button ────────────────────────────────────────────────────
function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-2 text-[11.5px] font-bold rounded-lg transition-all duration-150 whitespace-nowrap
        ${active
          ? "bg-white text-gray-900 shadow-sm border border-gray-200"
          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}>
      {children}
    </button>
  );
}

// ── Up/Down toggle ────────────────────────────────────────────────
function UpDownToggle({ value, onChange }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
      <button onClick={() => onChange(true)}
        className={`px-2.5 py-1.5 text-[11px] font-bold transition-colors
          ${value ? "bg-emerald-500 text-white" : "bg-white text-gray-400 hover:bg-gray-50"}`}>
        ↑
      </button>
      <button onClick={() => onChange(false)}
        className={`px-2.5 py-1.5 text-[11px] font-bold transition-colors border-l border-gray-200
          ${!value ? "bg-red-400 text-white" : "bg-white text-gray-400 hover:bg-gray-50"}`}>
        ↓
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB: KPIs
// ─────────────────────────────────────────────────────────────────
function KpisTab({ kpis, updateKpi }) {
  return (
    <div className="space-y-5">
      {kpis.map((kpi, i) => (
        <div key={kpi.label} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">{kpi.label}</p>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <p className="text-[10px] text-gray-400 mb-1">Value</p>
              <Input value={kpi.value} onChange={v => updateKpi(i, "value", v)} placeholder="e.g. $122K" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 mb-1">Change</p>
              <div className="flex gap-1.5 items-center">
                <Input value={kpi.delta} onChange={v => updateKpi(i, "delta", v)} placeholder="e.g. +18%" />
                <UpDownToggle value={kpi.up} onChange={v => updateKpi(i, "up", v)} />
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] text-gray-400 mb-1">Subtitle</p>
              <Input value={kpi.sub} onChange={v => updateKpi(i, "sub", v)} placeholder="e.g. vs last month" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB: Chart Data
// ─────────────────────────────────────────────────────────────────
function ChartTab({ chart, updateChart }) {
  const series = [
    { key: "revenue", label: "Revenue ($K)", color: "#E85D04" },
    { key: "profit",  label: "Gross Profit ($K)", color: "#059669" },
    { key: "adSpend", label: "Ad Spend ($K)", color: "#0369A1" },
  ];
  return (
    <div className="space-y-5">
      <p className="text-[11.5px] text-gray-400 leading-relaxed">
        Enter monthly values (in $K). These power the 12-month trend chart.
      </p>
      {series.map(s => (
        <div key={s.key} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-0.5 rounded-full" style={{ background: s.color }} />
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{s.label}</p>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {MONTHS.map((m, i) => (
              <div key={m}>
                <p className="text-[9px] text-gray-400 mb-0.5 text-center">{m}</p>
                <Input
                  type="number" min="0" step="1"
                  value={chart[s.key][i]}
                  onChange={v => updateChart(s.key, i, v)}
                  className="text-center"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB: Channels
// ─────────────────────────────────────────────────────────────────
function ChannelsTab({ channels, updateChannel }) {
  const [expanded, setExpanded] = useState(0);
  return (
    <div className="space-y-2">
      {channels.map((ch, i) => {
        const meta = CHANNEL_META[i];
        const isOpen = expanded === i;
        return (
          <div key={ch.name} className="rounded-xl border border-gray-100 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/60 hover:bg-gray-100/60 transition-colors"
              onClick={() => setExpanded(isOpen ? -1 : i)}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-black"
                  style={{ background: meta.color }}>{meta.icon}</span>
                <span className="text-[12.5px] font-bold text-gray-700">{ch.name}</span>
              </div>
              <span className="text-[10px] text-gray-400">{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    ["revenue", "Revenue"],
                    ["spend",   "Ad Spend"],
                    ["roas",    "ROAS"],
                    ["cac",     "CAC"],
                    ["margin",  "Margin %"],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <p className="text-[10px] text-gray-400 mb-1">{label}</p>
                      <Input value={ch[field]} onChange={v => updateChannel(i, field, v)} />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 mb-1.5">Trend Sparkline (6 values)</p>
                  <div className="grid grid-cols-6 gap-1">
                    {ch.trend.map((v, ti) => (
                      <Input key={ti} type="number" min="0" value={v}
                        onChange={val => {
                          const newTrend = [...ch.trend];
                          newTrend[ti] = Number(val) || 0;
                          updateChannel(i, "trend", newTrend);
                        }}
                        className="text-center text-[11px]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB: Products
// ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["star", "ok", "watch", "alert"];
const STATUS_LABELS  = { star: "Top Performer", ok: "Healthy", watch: "Watch", alert: "Needs Fix" };

function ProductsTab({ products, updateProduct }) {
  const [expanded, setExpanded] = useState(0);
  return (
    <div className="space-y-2">
      {products.map((p, i) => {
        const isOpen = expanded === i;
        return (
          <div key={p.sku} className="rounded-xl border border-gray-100 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/60 hover:bg-gray-100/60 transition-colors text-left"
              onClick={() => setExpanded(isOpen ? -1 : i)}
            >
              <div>
                <p className="text-[12.5px] font-bold text-gray-700 leading-snug">{p.name}</p>
                <p className="text-[10px] font-mono text-gray-400">{p.sku}</p>
              </div>
              <span className="text-[10px] text-gray-400 ml-2">{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 mb-1">Product Name</p>
                    <Input value={p.name} onChange={v => updateProduct(i, "name", v)} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">SKU</p>
                    <Input value={p.sku} onChange={v => updateProduct(i, "sku", v)} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">Revenue</p>
                    <Input value={p.revenue} onChange={v => updateProduct(i, "revenue", v)} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">Units Sold</p>
                    <Input type="number" min="0" value={p.units}
                      onChange={v => updateProduct(i, "units", parseInt(v) || 0)} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">Margin %</p>
                    <Input type="number" min="0" max="100" value={p.marginVal}
                      onChange={v => updateProduct(i, "marginVal", parseInt(v) || 0)} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">CAC</p>
                    <Input value={p.cac} onChange={v => updateProduct(i, "cac", v)} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">LTV</p>
                    <Input value={p.ltv} onChange={v => updateProduct(i, "ltv", v)} />
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 mb-1.5">Status</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {STATUS_OPTIONS.map(s => (
                        <button key={s} onClick={() => updateProduct(i, "status", s)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors
                            ${p.status === s
                              ? "bg-[#E85D04] border-[#E85D04] text-white"
                              : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN DRAWER
// ─────────────────────────────────────────────────────────────────
export default function DataDrawer({
  open, onClose, data,
  updateKpi, updateChart, updateChannel, updateProduct, resetToDefaults,
}) {
  const [tab, setTab] = useState("kpis");
  const tabs = [
    { id: "kpis",     label: "KPIs"      },
    { id: "chart",    label: "Chart"     },
    { id: "channels", label: "Channels"  },
    { id: "products", label: "Products"  },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[59] bg-black/20 backdrop-blur-[1px] transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 z-[60] h-full w-full sm:w-[460px] bg-white shadow-[−4px_0_40px_rgba(0,0,0,0.15)] flex flex-col transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]"
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Manual Entry</p>
            <p className="text-[15px] font-extrabold text-gray-900">Edit Dashboard Data</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefaults}
              className="text-[11px] font-semibold text-gray-400 hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
              Reset defaults
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors text-lg leading-none">
              ×
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="px-4 py-2.5 border-b border-gray-100 flex gap-1 bg-gray-50/60 flex-shrink-0">
          {tabs.map(t => (
            <TabBtn key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}
            </TabBtn>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "kpis"     && <KpisTab     kpis={data.kpis}         updateKpi={updateKpi}         />}
          {tab === "chart"    && <ChartTab    chart={data.chart}        updateChart={updateChart}      />}
          {tab === "channels" && <ChannelsTab channels={data.channels}  updateChannel={updateChannel}  />}
          {tab === "products" && <ProductsTab products={data.products}  updateProduct={updateProduct}  />}
        </div>

        {/* Footer note */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Changes apply instantly and persist in your browser. Connect integrations for automatic data sync.
          </p>
        </div>
      </div>
    </>
  );
}
