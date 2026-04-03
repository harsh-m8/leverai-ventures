import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

const KLAVIYO_API_VERSION = '2024-10-15';

async function klaviyoFetch(apiKey, path) {
  const res = await fetch(`https://a.klaviyo.com/api${path}`, {
    headers: {
      'Authorization': `Klaviyo-API-Key ${apiKey}`,
      'Accept': 'application/json',
      'revision': KLAVIYO_API_VERSION,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(`Klaviyo ${res.status}: ${body}`), { status: res.status });
  }
  return res.json();
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

  const { apiKey } = body ?? {};
  if (!apiKey) return NextResponse.json({ error: 'apiKey is required' }, { status: 400 });

  try {
    const accountData = await klaviyoFetch(apiKey, '/accounts/');
    const account     = accountData.data?.[0]?.attributes ?? {};

    const [campaignsData, listsData, flowsData] = await Promise.all([
      klaviyoFetch(apiKey, '/campaigns/?filter=equals(status,"sent")&page[size]=50&sort=-updated_at'),
      klaviyoFetch(apiKey, '/lists/?page[size]=10'),
      klaviyoFetch(apiKey, '/flows/?page[size]=50'),
    ]);

    const syncedData = {
      account: {
        name: account.contact_information?.organization_name ?? 'Klaviyo Account',
        timezone: account.preferred_timezone ?? 'UTC',
      },
      metrics: {
        totalCampaigns: (campaignsData.data ?? []).length,
        totalFlows:     (flowsData.data ?? []).length,
        totalLists:     (listsData.data ?? []).length,
      },
    };

    await supabase.from('integrations').upsert({
      user_id:       user.id,
      platform:      'klaviyo',
      status:        'connected',
      credentials:   { apiKey },
      synced_data:   syncedData,
      last_synced_at: new Date().toISOString(),
      connected_at:  new Date().toISOString(),
    }, { onConflict: 'user_id,platform' });

    return NextResponse.json({ success: true, syncedData });
  } catch (err) {
    const status = err.status === 401 || err.status === 403 ? 401 : 502;
    return NextResponse.json(
      { error: status === 401 ? 'Klaviyo authentication failed — check your API key' : 'Failed to reach Klaviyo', detail: err.message },
      { status }
    );
  }
}

// Disconnect
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await supabase.from('integrations').delete().eq('user_id', user.id).eq('platform', 'klaviyo');
  return NextResponse.json({ success: true });
}
