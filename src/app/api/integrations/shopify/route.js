import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

const SHOPIFY_API_VERSION = '2024-10';

function parseDomain(raw) {
  return raw.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
}

async function shopifyFetch(domain, apiKey, path) {
  const res = await fetch(
    `https://${domain}/admin/api/${SHOPIFY_API_VERSION}${path}`,
    {
      headers: {
        'X-Shopify-Access-Token': apiKey,
        'Content-Type': 'application/json',
      },
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(`Shopify ${res.status}: ${body}`), { status: res.status });
  }
  return res.json();
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

  const { storeUrl, apiKey } = body ?? {};
  if (!storeUrl || !apiKey) {
    return NextResponse.json({ error: 'storeUrl and apiKey are required' }, { status: 400 });
  }

  const domain = parseDomain(storeUrl);

  try {
    // Verify credentials
    const { shop } = await shopifyFetch(domain, apiKey, '/shop.json');

    // Fetch last 30 days of orders
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { orders = [] } = await shopifyFetch(
      domain, apiKey,
      `/orders.json?status=any&created_at_min=${encodeURIComponent(since)}&limit=250&fields=id,total_price,line_items,customer`
    );

    const totalRevenue    = orders.reduce((s, o) => s + parseFloat(o.total_price ?? 0), 0);
    const uniqueCustomers = new Set(orders.filter(o => o.customer?.id).map(o => o.customer.id)).size;

    const skuMap = {};
    for (const order of orders) {
      for (const item of order.line_items ?? []) {
        const key = item.sku || item.title;
        if (!skuMap[key]) skuMap[key] = { name: item.title, sku: item.sku || '—', revenue: 0, units: 0 };
        skuMap[key].revenue += parseFloat(item.price ?? 0) * (item.quantity ?? 1);
        skuMap[key].units   += item.quantity ?? 1;
      }
    }
    const products = Object.values(skuMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(p => ({
        name: p.name, sku: p.sku,
        revenue: `$${Math.round(p.revenue / 1000)}K`,
        units: p.units, marginVal: 60, margin: '60%', cac: '—', ltv: '—', status: 'ok',
      }));

    const syncedData = {
      products,
      _liveMetrics: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders: orders.length,
        uniqueCustomers,
        shopName: shop.name,
      },
    };

    // Upsert into DB — credentials stored server-side, never returned to client
    await supabase.from('integrations').upsert({
      user_id:       user.id,
      platform:      'shopify',
      status:        'connected',
      credentials:   { storeUrl: domain, apiKey },
      synced_data:   syncedData,
      last_synced_at: new Date().toISOString(),
      connected_at:  new Date().toISOString(),
    }, { onConflict: 'user_id,platform' });

    return NextResponse.json({ success: true, shop: { name: shop.name, domain: shop.domain }, syncedData });
  } catch (err) {
    const status = err.status === 401 || err.status === 403 ? 401 : 502;
    return NextResponse.json(
      { error: status === 401 ? 'Shopify authentication failed — check your API key' : 'Failed to reach Shopify', detail: err.message },
      { status }
    );
  }
}

// Sync now — re-fetch using stored credentials
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: row } = await supabase
    .from('integrations').select('credentials').eq('user_id', user.id).eq('platform', 'shopify').single();

  if (!row?.credentials?.apiKey) {
    return NextResponse.json({ error: 'No Shopify connection found' }, { status: 404 });
  }

  // Delegate to the POST handler with stored credentials
  const fakeRequest = { json: async () => ({ storeUrl: row.credentials.storeUrl, apiKey: row.credentials.apiKey }) };
  return POST(fakeRequest);
}

// Disconnect
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await supabase.from('integrations').delete().eq('user_id', user.id).eq('platform', 'shopify');
  return NextResponse.json({ success: true });
}
