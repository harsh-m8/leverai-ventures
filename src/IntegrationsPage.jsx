'use client';
import { useState } from "react";
import { relativeTime } from "./useIntegrations";

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────
function SpinnerIcon() {
  return (
    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function RefreshIcon({ spinning }) {
  return (
    <svg className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} xmlns="http://www.w3.org/2000/svg"
      fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, helpText }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-gray-500 mb-1">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2
          text-[13px] text-gray-800 font-medium placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-300
          hover:border-gray-300 transition-colors"
      />
      {helpText && <p className="text-[10.5px] text-gray-400 mt-1">{helpText}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === "connected")
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Connected
      </span>
    );
  if (status === "connecting")
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
        Connecting…
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Not connected
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// SHOPIFY CARD
// ─────────────────────────────────────────────────────────────────
function ShopifyCard({ state, onConnect, onDisconnect, onSyncNow, isSyncing }) {
  const [storeUrl, setStoreUrl] = useState(state.storeUrl ?? "");
  const [apiKey,   setApiKey]   = useState(state.apiKey ?? "");
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const connected = state.status === "connected";
  const connecting = state.status === "connecting";

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-[15px]"
              style={{ background: "#96BF48" }}>S</div>
            <div>
              <p className="text-[15px] font-bold text-gray-900">Shopify</p>
              <p className="text-[11.5px] text-gray-400">Orders, revenue, margin, products, retention</p>
            </div>
          </div>
          <StatusBadge status={state.status} />
        </div>
        {connected && state.lastSynced && (
          <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1.5">
            <RefreshIcon spinning={isSyncing} />
            {isSyncing ? "Syncing…" : `Last synced: ${relativeTime(state.lastSynced)}`}
          </p>
        )}
      </div>

      {/* Data pulled list */}
      <div className="px-6 py-4 border-b border-gray-50">
        <p className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">Data pulled</p>
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
          {["Revenue & orders", "Gross margin by SKU", "Repeat purchase rate", "Customer LTV", "Product profitability", "Cohort analysis"].map(item => (
            <div key={item} className="flex items-center gap-2 text-[12px] text-gray-600">
              <span className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
                <CheckIcon />
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Form / actions */}
      <div className="px-6 py-5">
        {!connected ? (
          <div className="space-y-3.5">
            <Input
              label="Store URL"
              value={storeUrl}
              onChange={setStoreUrl}
              placeholder="your-store.myshopify.com"
              helpText="Your Shopify store domain"
            />
            <Input
              label="Admin API Key"
              type="password"
              value={apiKey}
              onChange={setApiKey}
              placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
              helpText="Found in Shopify Admin → Apps → API credentials"
            />
            <button
              disabled={connecting || (!storeUrl && !apiKey)}
              onClick={() => onConnect("shopify", { storeUrl, apiKey })}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px] text-white transition-all
                bg-[#E85D04] hover:bg-[#d45300] shadow-[0_2px_12px_rgba(232,93,4,.3)] hover:shadow-[0_4px_20px_rgba(232,93,4,.4)]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#E85D04]">
              {connecting ? <><SpinnerIcon /> Connecting…</> : "Connect Shopify"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSyncNow("shopify")}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold text-gray-700
                bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors disabled:opacity-50">
              <RefreshIcon spinning={isSyncing} />
              Sync now
            </button>
            {!showDisconnectConfirm ? (
              <button onClick={() => setShowDisconnectConfirm(true)}
                className="text-[12px] font-semibold text-red-400 hover:text-red-600 transition-colors px-2 py-1">
                Disconnect
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-[11.5px] text-gray-600">Remove connection?</p>
                <button onClick={() => { onDisconnect("shopify"); setShowDisconnectConfirm(false); }}
                  className="text-[11.5px] font-bold text-red-500 hover:text-red-700 px-1.5">Yes</button>
                <button onClick={() => setShowDisconnectConfirm(false)}
                  className="text-[11.5px] text-gray-400 hover:text-gray-600 px-1.5">Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// OAUTH CARD (Meta & Google)
// ─────────────────────────────────────────────────────────────────
function OAuthCard({ platform, state, onConnect, onDisconnect, onSyncNow, isSyncing, config }) {
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const connected = state.status === "connected";
  const connecting = state.status === "connecting";

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-[15px]"
              style={{ background: config.color }}>{config.icon}</div>
            <div>
              <p className="text-[15px] font-bold text-gray-900">{config.name}</p>
              <p className="text-[11.5px] text-gray-400">{config.subtitle}</p>
            </div>
          </div>
          <StatusBadge status={state.status} />
        </div>
        {connected && state.lastSynced && (
          <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1.5">
            <RefreshIcon spinning={isSyncing} />
            {isSyncing ? "Syncing…" : `Last synced: ${relativeTime(state.lastSynced)}`}
          </p>
        )}
      </div>

      {/* Data pulled list */}
      <div className="px-6 py-4 border-b border-gray-50">
        <p className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">Data pulled</p>
        <div className="flex flex-wrap gap-y-1.5 gap-x-4">
          {config.dataPulled.map(item => (
            <div key={item} className="flex items-center gap-2 text-[12px] text-gray-600">
              <span className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
                <CheckIcon />
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-5">
        {!connected ? (
          <div className="space-y-3">
            <p className="text-[12px] text-gray-500">Authenticate via OAuth to pull ad performance data directly.</p>
            <button
              disabled={connecting}
              onClick={() => onConnect(platform)}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-[13px] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: config.color }}>
              {connecting
                ? <><SpinnerIcon /> Connecting…</>
                : <>{config.oauthLabel}</>
              }
            </button>
            <p className="text-[10.5px] text-gray-400 text-center">
              You'll be redirected to {config.name} to authorize read-only access.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSyncNow(platform)}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold text-gray-700
                bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors disabled:opacity-50">
              <RefreshIcon spinning={isSyncing} />
              Sync now
            </button>
            {!showDisconnectConfirm ? (
              <button onClick={() => setShowDisconnectConfirm(true)}
                className="text-[12px] font-semibold text-red-400 hover:text-red-600 transition-colors px-2 py-1">
                Disconnect
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-[11.5px] text-gray-600">Remove?</p>
                <button onClick={() => { onDisconnect(platform); setShowDisconnectConfirm(false); }}
                  className="text-[11.5px] font-bold text-red-500 hover:text-red-700 px-1.5">Yes</button>
                <button onClick={() => setShowDisconnectConfirm(false)}
                  className="text-[11.5px] text-gray-400 hover:text-gray-600 px-1.5">Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// KLAVIYO CARD
// ─────────────────────────────────────────────────────────────────
function KlaviyoCard({ state, onConnect, onDisconnect, onSyncNow, isSyncing }) {
  const [apiKey, setApiKey] = useState(state.apiKey ?? "");
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const connected = state.status === "connected";
  const connecting = state.status === "connecting";

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-gray-50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-[15px] bg-[#3C3B3B]">K</div>
            <div>
              <p className="text-[15px] font-bold text-gray-900">Klaviyo</p>
              <p className="text-[11.5px] text-gray-400">Email & SMS revenue, ROAS, subscriber value</p>
            </div>
          </div>
          <StatusBadge status={state.status} />
        </div>
        {connected && state.lastSynced && (
          <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1.5">
            <RefreshIcon spinning={isSyncing} />
            {isSyncing ? "Syncing…" : `Last synced: ${relativeTime(state.lastSynced)}`}
          </p>
        )}
      </div>

      <div className="px-6 py-4 border-b border-gray-50">
        <p className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">Data pulled</p>
        <div className="flex flex-wrap gap-y-1.5 gap-x-4">
          {["Email revenue", "SMS revenue", "Flow performance", "Campaign ROAS", "List growth"].map(item => (
            <div key={item} className="flex items-center gap-2 text-[12px] text-gray-600">
              <span className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600"><CheckIcon /></span>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-5">
        {!connected ? (
          <div className="space-y-3.5">
            <Input
              label="Private API Key"
              type="password"
              value={apiKey}
              onChange={setApiKey}
              placeholder="pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              helpText="Found in Klaviyo → Account → API Keys"
            />
            <button
              disabled={connecting || !apiKey}
              onClick={() => onConnect("klaviyo", { apiKey })}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px] text-white transition-all
                bg-[#E85D04] hover:bg-[#d45300] shadow-[0_2px_12px_rgba(232,93,4,.3)]
                disabled:opacity-50 disabled:cursor-not-allowed">
              {connecting ? <><SpinnerIcon /> Connecting…</> : "Connect Klaviyo"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={() => onSyncNow("klaviyo")} disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold text-gray-700
                bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50">
              <RefreshIcon spinning={isSyncing} />
              Sync now
            </button>
            {!showDisconnectConfirm ? (
              <button onClick={() => setShowDisconnectConfirm(true)}
                className="text-[12px] font-semibold text-red-400 hover:text-red-600 transition-colors px-2 py-1">
                Disconnect
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-[11.5px] text-gray-600">Remove?</p>
                <button onClick={() => { onDisconnect("klaviyo"); setShowDisconnectConfirm(false); }}
                  className="text-[11.5px] font-bold text-red-500 px-1.5">Yes</button>
                <button onClick={() => setShowDisconnectConfirm(false)}
                  className="text-[11.5px] text-gray-400 px-1.5">Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// INTEGRATIONS PAGE
// ─────────────────────────────────────────────────────────────────
export default function IntegrationsPage({ integrations, onConnect, onDisconnect, onSyncNow, syncing }) {
  const connectedCount = Object.values(integrations).filter(i => i.status === "connected").length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#E85D04] mb-1">Data Sources</p>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Integrations</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">
          Connect your platforms for automatic real-time data sync.
          {connectedCount > 0
            ? <span className="ml-2 text-emerald-600 font-semibold">{connectedCount} connected</span>
            : <span className="ml-2 text-gray-400"> Enter data manually or connect below.</span>
          }
        </p>
      </div>

      {/* Note about demo mode */}
      <div className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 flex items-start gap-3">
        <svg className="w-4 h-4 text-[#E85D04] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24"
          strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-[12px] text-orange-700 leading-relaxed">
          <strong>Demo mode:</strong> Connecting an integration loads simulated data so you can preview the dashboard.
          Full live sync requires a backend API proxy — contact LeverAI Ventures to enable it for your account.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid md:grid-cols-2 gap-5">
        <ShopifyCard
          state={integrations.shopify}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          onSyncNow={onSyncNow}
          isSyncing={syncing === "shopify"}
        />
        <OAuthCard
          platform="meta"
          state={integrations.meta}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          onSyncNow={onSyncNow}
          isSyncing={syncing === "meta"}
          config={{
            name: "Meta Ads",
            subtitle: "Ad spend, ROAS, CAC by campaign",
            color: "#1877F2",
            icon: "M",
            oauthLabel: "Connect with Meta",
            dataPulled: ["Ad spend", "Campaign ROAS", "CAC", "Impressions & clicks", "Creative performance"],
          }}
        />
        <OAuthCard
          platform="google"
          state={integrations.google}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          onSyncNow={onSyncNow}
          isSyncing={syncing === "google"}
          config={{
            name: "Google Ads",
            subtitle: "Search & Shopping ad performance",
            color: "#EA4335",
            icon: "G",
            oauthLabel: "Connect with Google",
            dataPulled: ["Ad spend", "ROAS by campaign", "CAC", "Keyword performance", "Shopping revenue"],
          }}
        />
        <KlaviyoCard
          state={integrations.klaviyo}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          onSyncNow={onSyncNow}
          isSyncing={syncing === "klaviyo"}
        />
      </div>
    </div>
  );
}
