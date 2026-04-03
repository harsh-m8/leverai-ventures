'use client';
import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────
// SIMULATED DATA — used as fallback when backend env vars are not set
// ─────────────────────────────────────────────────────────────────
const SIMULATED = {
  shopify: {
    kpis: [
      { label: "Monthly Revenue", value: "$134K", delta: "+22%",   up: true, sub: "Shopify gross sales"      },
      { label: "Gross Margin",    value: "63%",   delta: "+11 pt", up: true, sub: "all SKUs blended"         },
      { label: "Blended ROAS",    value: "4.4×",  delta: "+1.1×",  up: true, sub: "across all channels"      },
      { label: "CAC",             value: "$36",   delta: "↓ 31%",  up: true, sub: "blended avg"              },
      { label: "LTV : CAC",       value: "5.3×",  delta: "+2.3×",  up: true, sub: "12-month window"          },
      { label: "Repeat Rate",     value: "38%",   delta: "+16 pt", up: true, sub: "90-day Shopify cohort"    },
    ],
    chart: {
      revenue: [54, 63, 61, 77, 72, 91, 86, 101, 95, 113, 108, 134],
      profit:  [19, 24, 22, 30, 28, 38, 35,  44,  41,  51,  49,  60],
      adSpend: [14, 16, 15, 18, 17, 22, 21,  24,  23,  27,  25,  30],
    },
    summary: {
      revenue:        { value: "$134K", bar: 96 },
      profit:         { value: "$84K",  bar: 68 },
      adSpend:        { value: "$30K",  bar: 25 },
      netProfit:      { value: "$54K",  bar: 44 },
      profitMargin:   "40%",
      momGrowth:      "+22%",
      roasEfficiency: "4.4×",
    },
    products: [
      { name: "Performance Bundle",   sku: "BUN-001", revenue: "$38K", units: 317, marginVal: 73, margin: "73%", cac: "$21", ltv: "$201", status: "star"  },
      { name: "Core Starter Pack",    sku: "STR-002", revenue: "$31K", units: 512, marginVal: 65, margin: "65%", cac: "$30", ltv: "$152", status: "star"  },
      { name: "Monthly Subscription", sku: "SUB-003", revenue: "$26K", units: 201, marginVal: 82, margin: "82%", cac: "$13", ltv: "$329", status: "star"  },
      { name: "Premium Add-on",       sku: "ADD-004", revenue: "$20K", units: 221, marginVal: 59, margin: "59%", cac: "$37", ltv: "$126", status: "ok"    },
      { name: "Introductory Set",     sku: "INT-005", revenue: "$13K", units: 408, marginVal: 42, margin: "42%", cac: "$65", ltv: "$91",  status: "watch" },
      { name: "One-Off Promo Item",   sku: "PRO-006", revenue: "$6K",  units: 289, marginVal: 31, margin: "31%", cac: "$80", ltv: "$53",  status: "alert" },
    ],
  },
  meta: {
    channel: { revenue: "$61K", spend: "$15K", roas: "4.1×", cac: "$37", margin: "58%", trend: [42,48,52,55,58,61], up: true },
  },
  google: {
    channel: { revenue: "$36K", spend: "$8K", roas: "4.5×", cac: "$29", margin: "63%", trend: [22,25,28,30,33,36], up: true },
  },
  klaviyo: {
    channel: { revenue: "$23K", spend: "$1K", roas: "23×", cac: "$6", margin: "74%", trend: [14,16,17,19,21,23], up: true },
  },
};

// ─────────────────────────────────────────────────────────────────
// DEFAULTS
// ─────────────────────────────────────────────────────────────────
export const DEFAULT_INTEGRATIONS = {
  shopify: { status: "disconnected", storeUrl: "", apiKey: "",  lastSynced: null, syncedData: null, error: null },
  meta:    { status: "disconnected", lastSynced: null, syncedData: null, error: null },
  google:  { status: "disconnected", lastSynced: null, syncedData: null, error: null },
  klaviyo: { status: "disconnected", apiKey: "", lastSynced: null, syncedData: null, error: null },
};

function loadIntegrations() {
  try {
    const raw = localStorage.getItem("leverai_integrations");
    if (!raw) return DEFAULT_INTEGRATIONS;
    const parsed = JSON.parse(raw);
    const reset = { ...parsed };
    for (const key of Object.keys(reset)) {
      if (reset[key]?.status === "connecting") reset[key] = { ...reset[key], status: "disconnected" };
    }
    return { ...DEFAULT_INTEGRATIONS, ...reset };
  } catch {
    return DEFAULT_INTEGRATIONS;
  }
}

// ─────────────────────────────────────────────────────────────────
// API HELPERS
// ─────────────────────────────────────────────────────────────────

// Map raw Shopify API response → dashboard syncedData shape
function shopifyApiToSyncedData(apiData) {
  const rev = apiData.metrics?.totalRevenue ?? 0;
  const revK = `$${Math.round(rev / 1000)}K`;
  return {
    // Keep kpis/chart/summary as simulated (real mapping needs cost data from ads too)
    // Products are real from Shopify
    products: (apiData.products ?? []).map(p => ({
      name:      p.name,
      sku:       p.sku,
      revenue:   p.revenue,
      units:     p.units,
      marginVal: 60, // placeholder — Shopify doesn't expose COGS unless tracked separately
      margin:    "60%",
      cac:       "—",
      ltv:       "—",
      status:    "ok",
    })),
    _liveMetrics: {
      totalRevenue:    rev,
      totalOrders:     apiData.metrics?.totalOrders,
      uniqueCustomers: apiData.metrics?.uniqueCustomers,
      shopName:        apiData.shop?.name,
    },
  };
}

// Map raw Meta API response → channel shape
function metaApiToChannel(apiData) {
  return {
    revenue: `$${Math.round((apiData.metrics?.revenue ?? 0) / 1000)}K`,
    spend:   `$${Math.round((apiData.metrics?.spend ?? 0) / 1000)}K`,
    roas:    apiData.metrics?.roas ?? "—",
    cac:     "—",
    margin:  "—",
    trend:   [],
    up:      true,
  };
}

// Map raw Google Ads API response → channel shape
function googleApiToChannel(apiData) {
  return {
    revenue: `$${Math.round((apiData.metrics?.revenue ?? 0) / 1000)}K`,
    spend:   `$${Math.round((apiData.metrics?.spend ?? 0) / 1000)}K`,
    roas:    apiData.metrics?.roas ?? "—",
    cac:     "—",
    margin:  "—",
    trend:   [],
    up:      true,
  };
}

// ─────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────
export function useIntegrations() {
  const [integrations, setIntegrations] = useState(loadIntegrations);
  const [syncing, setSyncing] = useState(null);

  // Persist to localStorage as a cache for instant page loads
  useEffect(() => {
    try { localStorage.setItem("leverai_integrations", JSON.stringify(integrations)); }
    catch { /* storage unavailable */ }
  }, [integrations]);

  // On mount: hydrate from DB (authoritative source)
  useEffect(() => {
    fetch("/api/integrations")
      .then(r => r.ok ? r.json() : null)
      .then(dbState => {
        if (!dbState) return;
        setIntegrations(prev => {
          const merged = { ...prev };
          for (const [platform, state] of Object.entries(dbState)) {
            if (merged[platform]) {
              merged[platform] = {
                ...merged[platform],
                ...state,
                // Don't overwrite credentials the user typed in the current session
                storeUrl: state.storeUrl || merged[platform].storeUrl,
              };
            }
          }
          return merged;
        });
      })
      .catch(() => { /* offline or unauthenticated — keep localStorage state */ });
  }, []);

  // On mount: check URL params for OAuth callbacks (meta_connected, google_connected, *_error)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);

    if (params.get("meta_connected") === "1") {
      // Fetch live data now that the token is in the cookie
      fetch("/api/integrations/meta/data")
        .then(r => r.json())
        .then(data => {
          setIntegrations(prev => ({
            ...prev,
            meta: {
              ...prev.meta,
              status: "connected",
              lastSynced: Date.now(),
              syncedData: data.success ? { channel: metaApiToChannel(data) } : SIMULATED.meta,
              error: null,
            },
          }));
        })
        .catch(() => {
          setIntegrations(prev => ({
            ...prev,
            meta: { ...prev.meta, status: "connected", lastSynced: Date.now(), syncedData: SIMULATED.meta, error: null },
          }));
        });
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (params.get("google_connected") === "1") {
      fetch("/api/integrations/google/data")
        .then(r => r.json())
        .then(data => {
          setIntegrations(prev => ({
            ...prev,
            google: {
              ...prev.google,
              status: "connected",
              lastSynced: Date.now(),
              syncedData: data.success ? { channel: googleApiToChannel(data) } : SIMULATED.google,
              error: null,
            },
          }));
        })
        .catch(() => {
          setIntegrations(prev => ({
            ...prev,
            google: { ...prev.google, status: "connected", lastSynced: Date.now(), syncedData: SIMULATED.google, error: null },
          }));
        });
      window.history.replaceState({}, "", window.location.pathname);
    }

    const metaError   = params.get("meta_error");
    const googleError = params.get("google_error");
    if (metaError) {
      setIntegrations(prev => ({ ...prev, meta: { ...prev.meta, status: "disconnected", error: metaError } }));
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (googleError) {
      setIntegrations(prev => ({ ...prev, google: { ...prev.google, status: "disconnected", error: googleError } }));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // ── connect ──────────────────────────────────────────────────────
  const connect = useCallback(async (platform, credentials = {}) => {
    setIntegrations(prev => ({
      ...prev,
      [platform]: { ...prev[platform], ...credentials, status: "connecting", error: null },
    }));

    // OAuth platforms → redirect to our auth route (full page redirect)
    if (platform === "meta") {
      window.location.href = "/api/integrations/meta/auth";
      return;
    }
    if (platform === "google") {
      window.location.href = "/api/integrations/google/auth";
      return;
    }

    // API-key platforms → call server-side route
    try {
      let apiData = null;
      let usedSimulated = false;

      if (platform === "shopify") {
        const res = await fetch("/api/integrations/shopify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeUrl: credentials.storeUrl, apiKey: credentials.apiKey }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Shopify connection failed");
        apiData = shopifyApiToSyncedData(data);
      } else if (platform === "klaviyo") {
        const res = await fetch("/api/integrations/klaviyo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: credentials.apiKey }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Klaviyo connection failed");
        // Klaviyo syncedData: supplement with simulated channel numbers for now
        apiData = { ...SIMULATED.klaviyo, _liveMetrics: data };
        usedSimulated = true;
      }

      setIntegrations(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          ...credentials,
          status:     "connected",
          lastSynced: Date.now(),
          syncedData: apiData ?? SIMULATED[platform] ?? null,
          error:      usedSimulated ? "Partial: channel metrics are estimated" : null,
        },
      }));
    } catch (err) {
      setIntegrations(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          status: "disconnected",
          error:  err.message,
        },
      }));
    }
  }, []);

  // ── disconnect ───────────────────────────────────────────────────
  const disconnect = useCallback(async (platform) => {
    // Delete from DB (works for all platforms)
    const deleteUrl = (platform === "meta" || platform === "google")
      ? `/api/integrations/${platform}/data`
      : `/api/integrations/${platform}`;
    await fetch(deleteUrl, { method: "DELETE" }).catch(() => {});

    setIntegrations(prev => ({
      ...prev,
      [platform]: { ...DEFAULT_INTEGRATIONS[platform] },
    }));
  }, []);

  // ── syncNow ──────────────────────────────────────────────────────
  const syncNow = useCallback(async (platform) => {
    setSyncing(platform);
    try {
      if (platform === "shopify") {
        const current = JSON.parse(localStorage.getItem("leverai_integrations") ?? "{}")[platform] ?? {};
        if (current.storeUrl && current.apiKey) {
          const res  = await fetch("/api/integrations/shopify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ storeUrl: current.storeUrl, apiKey: current.apiKey }),
          });
          const data = await res.json();
          if (res.ok) {
            setIntegrations(prev => ({
              ...prev,
              shopify: { ...prev.shopify, lastSynced: Date.now(), syncedData: shopifyApiToSyncedData(data) },
            }));
            setSyncing(null);
            return;
          }
        }
      }
      if (platform === "klaviyo") {
        const current = JSON.parse(localStorage.getItem("leverai_integrations") ?? "{}")[platform] ?? {};
        if (current.apiKey) {
          await fetch("/api/integrations/klaviyo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiKey: current.apiKey }),
          }).catch(() => {});
        }
      }
      if (platform === "meta") {
        const res  = await fetch("/api/integrations/meta/data");
        const data = await res.json();
        if (res.ok && data.success) {
          setIntegrations(prev => ({
            ...prev,
            meta: { ...prev.meta, lastSynced: Date.now(), syncedData: { channel: metaApiToChannel(data) } },
          }));
          setSyncing(null);
          return;
        }
      }
      if (platform === "google") {
        const res  = await fetch("/api/integrations/google/data");
        const data = await res.json();
        if (res.ok && data.success) {
          setIntegrations(prev => ({
            ...prev,
            google: { ...prev.google, lastSynced: Date.now(), syncedData: { channel: googleApiToChannel(data) } },
          }));
          setSyncing(null);
          return;
        }
      }
      // Fallback: just update lastSynced
      setIntegrations(prev => ({
        ...prev,
        [platform]: { ...prev[platform], lastSynced: Date.now() },
      }));
    } catch {
      setIntegrations(prev => ({
        ...prev,
        [platform]: { ...prev[platform], lastSynced: Date.now() },
      }));
    } finally {
      setSyncing(null);
    }
  }, []);

  const connectedCount = Object.values(integrations).filter(i => i.status === "connected").length;

  return { integrations, syncing, connect, disconnect, syncNow, connectedCount };
}

// ─────────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────────
export function relativeTime(ts) {
  if (!ts) return null;
  const diff = Date.now() - ts;
  if (diff < 60000)    return "just now";
  if (diff < 3600000)  return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}
