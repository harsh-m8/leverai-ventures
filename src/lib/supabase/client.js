import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client — use this in 'use client' components.
 * Re-uses the same instance across renders (createBrowserClient is safe to call
 * multiple times — it returns the cached singleton internally).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
