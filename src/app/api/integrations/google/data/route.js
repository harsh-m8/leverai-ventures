import { NextResponse } from 'next/server';
import { createClient } from '../../../../../lib/supabase/server';

const DEVELOPER_TOKEN      = process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? '';
const MANAGER_CUSTOMER_ID  = process.env.GOOGLE_ADS_MANAGER_CUSTOMER_ID ?? '';

async function refreshAccessToken(clientId, clientSecret, refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId, client_secret: clientSecret,
      refresh_token: refreshToken, grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error('Failed to refresh Google access token');
  return res.json(); // { access_token, expires_in }
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Load tokens from DB
  const { data: row } = await supabase
    .from('integrations')
    .select('access_token, refresh_token, token_expires_at')
    .eq('user_id', user.id).eq('platform', 'google').single();

  if (!row?.access_token && !row?.refresh_token) {
    return NextResponse.json({ error: 'Not connected — complete Google OAuth first' }, { status: 401 });
  }

  let accessToken = row.access_token;
  const isExpired = row.token_expires_at && new Date(row.token_expires_at) < new Date();

  // Refresh if expired
  if ((isExpired || !accessToken) && row.refresh_token) {
    try {
      const refreshed = await refreshAccessToken(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        row.refresh_token
      );
      accessToken = refreshed.access_token;
      const newExpiry = new Date(Date.now() + (refreshed.expires_in ?? 3600) * 1000).toISOString();

      // Update the token in DB
      await supabase.from('integrations').update({
        access_token:     accessToken,
        token_expires_at: newExpiry,
      }).eq('user_id', user.id).eq('platform', 'google');
    } catch {
      return NextResponse.json({ error: 'Session expired — please reconnect Google Ads' }, { status: 401 });
    }
  }

  try {
    // Get accessible customer IDs
    const customersRes = await fetch(
      'https://googleads.googleapis.com/v17/customers:listAccessibleCustomers',
      { headers: { 'Authorization': `Bearer ${accessToken}`, 'developer-token': DEVELOPER_TOKEN } }
    );
    if (!customersRes.ok) {
      return NextResponse.json({ error: 'Failed to list Google Ads accounts' }, { status: 502 });
    }
    const { resourceNames = [] } = await customersRes.json();
    if (resourceNames.length === 0) {
      return NextResponse.json({ error: 'No Google Ads accounts accessible' }, { status: 404 });
    }

    const customerId = resourceNames[0].replace('customers/', '');

    const gaqlQuery = `
      SELECT
        campaign.id, campaign.name, campaign.status,
        metrics.cost_micros, metrics.conversions_value,
        metrics.conversions, metrics.clicks, metrics.impressions
      FROM campaign
      WHERE segments.date DURING LAST_30_DAYS
        AND campaign.status = 'ENABLED'
      ORDER BY metrics.cost_micros DESC
      LIMIT 50
    `;

    const adsRes = await fetch(
      `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:searchStream`,
      {
        method: 'POST',
        headers: {
          'Authorization':     `Bearer ${accessToken}`,
          'developer-token':   DEVELOPER_TOKEN,
          'login-customer-id': MANAGER_CUSTOMER_ID || customerId,
          'Content-Type':      'application/json',
        },
        body: JSON.stringify({ query: gaqlQuery }),
      }
    );
    if (!adsRes.ok) throw new Error(`Google Ads API ${adsRes.status}`);

    const results  = await adsRes.json();
    const rows     = (Array.isArray(results) ? results : [results]).flatMap(c => c.results ?? []);
    const totalSpend   = rows.reduce((s, r) => s + (r.metrics?.costMicros ?? 0) / 1_000_000, 0);
    const totalRevenue = rows.reduce((s, r) => s + (r.metrics?.conversionsValue ?? 0), 0);
    const roas         = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(1) : '—';

    const syncedData = {
      channel: {
        revenue: `$${Math.round(totalRevenue / 1000)}K`,
        spend:   `$${Math.round(totalSpend / 1000)}K`,
        roas:    `${roas}×`,
        cac: '—', margin: '—', trend: [], up: true,
      },
    };

    await supabase.from('integrations').update({
      synced_data:    syncedData,
      last_synced_at: new Date().toISOString(),
    }).eq('user_id', user.id).eq('platform', 'google');

    return NextResponse.json({ success: true, customerId, syncedData });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch Google Ads data', detail: err.message }, { status: 502 });
  }
}

// Disconnect — remove from DB
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await supabase.from('integrations').delete().eq('user_id', user.id).eq('platform', 'google');
  return NextResponse.json({ success: true });
}
