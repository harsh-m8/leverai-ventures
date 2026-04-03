'use client';
import { useState, useEffect, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────
// DEFAULT DATA  (mirrors original hardcoded values)
// ─────────────────────────────────────────────────────────────────
export const DEFAULT_DASHBOARD_DATA = {
  kpis: [
    { label: "Monthly Revenue", value: "$122K", delta: "+18%",   up: true, sub: "vs last month"        },
    { label: "Gross Margin",    value: "61%",   delta: "+9 pt",  up: true, sub: "all SKUs blended"     },
    { label: "Blended ROAS",    value: "4.2×",  delta: "+0.9×",  up: true, sub: "across all channels"  },
    { label: "CAC",             value: "$38",   delta: "↓ 28%",  up: true, sub: "blended avg"          },
    { label: "LTV : CAC",       value: "5.1×",  delta: "+2.1×",  up: true, sub: "12-month window"      },
    { label: "Repeat Rate",     value: "34%",   delta: "+12 pt", up: true, sub: "90-day cohort"        },
  ],
  chart: {
    revenue: [52, 61, 58, 74, 69, 88, 82, 97,  91, 108, 103, 122],
    profit:  [18, 22, 20, 28, 26, 36, 33, 42,  39,  48,  46,  57],
    adSpend: [14, 16, 15, 18, 17, 22, 21, 24,  23,  27,  25,  29],
  },
  summary: {
    revenue:        { value: "$122K", bar: 88 },
    profit:         { value: "$74K",  bar: 61 },
    adSpend:        { value: "$29K",  bar: 24 },
    netProfit:      { value: "$45K",  bar: 37 },
    profitMargin:   "37%",
    momGrowth:      "+18%",
    roasEfficiency: "4.2×",
  },
  channels: [
    { name: "Meta Ads",    revenue: "$54K", spend: "$13K", roas: "4.2×", cac: "$34", margin: "59%", trend: [30,38,42,48,45,54], up: true },
    { name: "Google Ads",  revenue: "$31K", spend: "$7K",  roas: "4.4×", cac: "$31", margin: "62%", trend: [18,20,22,25,28,31], up: true },
    { name: "TikTok Ads",  revenue: "$19K", spend: "$6K",  roas: "3.2×", cac: "$52", margin: "55%", trend: [8,10,12,14,16,19],  up: true },
    { name: "Email / SMS", revenue: "$18K", spend: "$1K",  roas: "18×",  cac: "$8",  margin: "71%", trend: [12,13,14,15,17,18], up: true },
  ],
  products: [
    { name: "Performance Bundle",   sku: "BUN-001", revenue: "$34K", units: 284, marginVal: 72, margin: "72%", cac: "$22", ltv: "$195", status: "star"  },
    { name: "Core Starter Pack",    sku: "STR-002", revenue: "$28K", units: 467, marginVal: 64, margin: "64%", cac: "$31", ltv: "$148", status: "star"  },
    { name: "Monthly Subscription", sku: "SUB-003", revenue: "$22K", units: 183, marginVal: 81, margin: "81%", cac: "$14", ltv: "$312", status: "star"  },
    { name: "Premium Add-on",       sku: "ADD-004", revenue: "$18K", units: 201, marginVal: 58, margin: "58%", cac: "$38", ltv: "$122", status: "ok"    },
    { name: "Introductory Set",     sku: "INT-005", revenue: "$12K", units: 389, marginVal: 41, margin: "41%", cac: "$67", ltv: "$89",  status: "watch" },
    { name: "One-Off Promo Item",   sku: "PRO-006", revenue: "$8K",  units: 312, marginVal: 29, margin: "29%", cac: "$84", ltv: "$51",  status: "alert" },
  ],
  insights: [
    { colorKey: "green",  badge: "Opportunity",   title: "Email flow is your highest-ROAS channel at 18×",          body: "Shift 8–10% of Meta spend to email expansion (welcome series + win-back). Estimated +$6K/mo incremental margin." },
    { colorKey: "orange", badge: "Action needed", title: "Introductory Set margin is compressing",                   body: "CAC is $67 on a $89 LTV product. Bundle with Performance Bundle or raise price by 12% before next campaign cycle." },
    { colorKey: "purple", badge: "Insight",       title: "Subscribers repeat at 3× the rate of one-time buyers",    body: "LTV of subscribers is $312 vs $122 for non-sub. Prioritize subscription upsell in post-purchase flows." },
    { colorKey: "blue",   badge: "Watch",         title: "TikTok CAC rising — review creative fatigue",              body: "TikTok CAC up 14% MoM. Rotate top 3 ad creatives. AI Creative Engine has 6 new variants ready to test." },
  ],
};

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────
function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override ?? {})) {
    if (
      override[key] !== null &&
      typeof override[key] === "object" &&
      !Array.isArray(override[key]) &&
      base[key] !== null &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      result[key] = deepMerge(base[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

function mergeWithIntegrationData(manual, integrations) {
  let result = JSON.parse(JSON.stringify(manual)); // deep clone

  const { shopify, meta, google, klaviyo } = integrations ?? {};

  if (shopify?.status === "connected" && shopify.syncedData) {
    const s = shopify.syncedData;
    if (s.kpis)     result.kpis     = s.kpis;
    if (s.chart)    result.chart    = s.chart;
    if (s.summary)  result.summary  = s.summary;
    if (s.products) result.products = s.products;
  }
  if (meta?.status === "connected" && meta.syncedData?.channel) {
    result.channels = result.channels.map(ch =>
      ch.name === "Meta Ads" ? { ...ch, ...meta.syncedData.channel } : ch
    );
  }
  if (google?.status === "connected" && google.syncedData?.channel) {
    result.channels = result.channels.map(ch =>
      ch.name === "Google Ads" ? { ...ch, ...google.syncedData.channel } : ch
    );
  }
  if (klaviyo?.status === "connected" && klaviyo.syncedData?.channel) {
    result.channels = result.channels.map(ch =>
      ch.name === "Email / SMS" ? { ...ch, ...klaviyo.syncedData.channel } : ch
    );
  }

  return result;
}

function loadManual() {
  try {
    const raw = localStorage.getItem("leverai_dashboard_data");
    if (!raw) return DEFAULT_DASHBOARD_DATA;
    return deepMerge(DEFAULT_DASHBOARD_DATA, JSON.parse(raw));
  } catch {
    return DEFAULT_DASHBOARD_DATA;
  }
}

// ─────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────
export function useDashboardData(integrations) {
  const [manualData, setManualData] = useState(loadManual);

  useEffect(() => {
    try { localStorage.setItem("leverai_dashboard_data", JSON.stringify(manualData)); }
    catch { /* storage unavailable */ }
  }, [manualData]);

  const data = useMemo(
    () => mergeWithIntegrationData(manualData, integrations),
    [manualData, integrations]
  );

  const updateKpi = (i, field, value) =>
    setManualData(d => { const a = [...d.kpis]; a[i] = { ...a[i], [field]: value }; return { ...d, kpis: a }; });

  const updateChart = (series, i, value) =>
    setManualData(d => {
      const a = [...d.chart[series]];
      a[i] = Number(value) || 0;
      return { ...d, chart: { ...d.chart, [series]: a } };
    });

  const updateChannel = (i, field, value) =>
    setManualData(d => { const a = [...d.channels]; a[i] = { ...a[i], [field]: value }; return { ...d, channels: a }; });

  const updateProduct = (i, field, value) =>
    setManualData(d => {
      const a = [...d.products];
      const updated = { ...a[i], [field]: value };
      // keep marginVal in sync with margin string
      if (field === "marginVal") updated.margin = `${value}%`;
      if (field === "margin")    updated.marginVal = parseInt(value) || 0;
      a[i] = updated;
      return { ...d, products: a };
    });

  const updateSummary = (field, value) =>
    setManualData(d => ({ ...d, summary: { ...d.summary, [field]: value } }));

  const updateSummaryNested = (key, subfield, value) =>
    setManualData(d => ({
      ...d,
      summary: { ...d.summary, [key]: { ...d.summary[key], [subfield]: value } },
    }));

  const resetToDefaults = () => setManualData(DEFAULT_DASHBOARD_DATA);

  return {
    data,
    manualData,
    updateKpi,
    updateChart,
    updateChannel,
    updateProduct,
    updateSummary,
    updateSummaryNested,
    resetToDefaults,
  };
}
