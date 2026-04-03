import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

/**
 * GET /api/integrations
 * Returns all integration records for the currently authenticated user.
 * Used by useIntegrations on mount to hydrate state from the DB.
 */
export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: rows, error } = await supabase
    .from('integrations')
    .select('platform, status, credentials, synced_data, connected_at, last_synced_at')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Shape the response as { shopify: {...}, meta: {...}, ... }
  const result = {};
  for (const row of rows ?? []) {
    result[row.platform] = {
      status:      row.status,
      // Expose non-sensitive credential fields (storeUrl for Shopify; never the API keys)
      storeUrl:    row.credentials?.storeUrl ?? '',
      lastSynced:  row.last_synced_at ? new Date(row.last_synced_at).getTime() : null,
      syncedData:  row.synced_data ?? null,
    };
  }

  return NextResponse.json(result);
}
