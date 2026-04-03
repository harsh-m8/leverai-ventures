-- ─────────────────────────────────────────────────────────────────
-- LeverAI Ventures — Supabase schema
-- Paste this into the Supabase SQL Editor and click "Run".
-- ─────────────────────────────────────────────────────────────────

-- Per-user integration records.
-- auth.users is managed by Supabase Auth and already exists.
CREATE TABLE IF NOT EXISTS public.integrations (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform        TEXT        NOT NULL CHECK (platform IN ('shopify', 'klaviyo', 'meta', 'google')),
  status          TEXT        NOT NULL DEFAULT 'connected'
                              CHECK (status IN ('connected', 'disconnected', 'error')),

  -- OAuth tokens (Meta, Google Ads)
  access_token    TEXT,
  refresh_token   TEXT,
  token_expires_at TIMESTAMPTZ,

  -- API-key credentials (Shopify, Klaviyo) stored as JSON.
  -- Supabase encrypts data at rest; add pgcrypto column encryption if needed.
  credentials     JSONB       DEFAULT '{}',

  -- Cached metrics snapshot from the last sync (used to hydrate the dashboard)
  synced_data     JSONB,

  connected_at    TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at  TIMESTAMPTZ,

  -- One record per user per platform
  UNIQUE(user_id, platform)
);

-- ── Row Level Security ──────────────────────────────────────────────
-- Users can only ever see and modify their own rows.

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integrations: select own"
  ON public.integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "integrations: insert own"
  ON public.integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "integrations: update own"
  ON public.integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "integrations: delete own"
  ON public.integrations FOR DELETE
  USING (auth.uid() = user_id);

-- ── Index for fast lookups by user ─────────────────────────────────
CREATE INDEX IF NOT EXISTS integrations_user_id_idx
  ON public.integrations (user_id);
