import { NextResponse } from 'next/server';
import { createClient } from '../../../../../lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Load token from DB
  const { data: row } = await supabase
    .from('integrations').select('access_token, token_expires_at')
    .eq('user_id', user.id).eq('platform', 'meta').single();

  if (!row?.access_token) {
    return NextResponse.json({ error: 'Not connected — complete Meta OAuth first' }, { status: 401 });
  }

  // Check token expiry
  if (row.token_expires_at && new Date(row.token_expires_at) < new Date()) {
    return NextResponse.json({ error: 'Meta token expired — please reconnect' }, { status: 401 });
  }

  const accessToken = row.access_token;

  try {
    const accountsRes = await fetch(
      `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,currency,account_status&access_token=${accessToken}`
    );
    if (!accountsRes.ok) throw new Error('Failed to fetch ad accounts');
    const { data: adAccounts = [] } = await accountsRes.json();

    if (adAccounts.length === 0) {
      return NextResponse.json({ error: 'No ad accounts found on this Meta account' }, { status: 404 });
    }

    const account   = adAccounts.find(a => a.account_status === 1) ?? adAccounts[0];
    const accountId = account.id;

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const until = new Date().toISOString().split('T')[0];

    const insightsRes = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}/insights` +
      `?fields=spend,clicks,impressions,actions,action_values,cpc,cpm` +
      `&time_range={"since":"${since}","until":"${until}"}` +
      `&access_token=${accessToken}`
    );
    const insightsData = insightsRes.ok ? await insightsRes.json() : { data: [] };
    const insight = insightsData.data?.[0] ?? {};

    const purchaseValue = (insight.action_values ?? []).find(a => a.action_type === 'purchase')?.value ?? '0';
    const spend   = parseFloat(insight.spend ?? 0);
    const revenue = parseFloat(purchaseValue);
    const roas    = spend > 0 ? (revenue / spend).toFixed(1) : '—';

    const syncedData = {
      channel: {
        revenue: `$${Math.round(revenue / 1000)}K`,
        spend:   `$${Math.round(spend / 1000)}K`,
        roas:    `${roas}×`,
        cac:     '—',
        margin:  '—',
        trend:   [],
        up:      true,
      },
    };

    // Update cached data in DB
    await supabase.from('integrations').update({
      synced_data:    syncedData,
      last_synced_at: new Date().toISOString(),
    }).eq('user_id', user.id).eq('platform', 'meta');

    return NextResponse.json({ success: true, account: { id: accountId, name: account.name }, syncedData });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch Meta data', detail: err.message }, { status: 502 });
  }
}

// Disconnect — remove from DB
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await supabase.from('integrations').delete().eq('user_id', user.id).eq('platform', 'meta');
  return NextResponse.json({ success: true });
}
