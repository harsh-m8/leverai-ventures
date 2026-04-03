import { NextResponse } from 'next/server';
import { createClient } from '../../../../../lib/supabase/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  if (error) {
    return NextResponse.redirect(`${appUrl}/dashboard?meta_error=${encodeURIComponent(error)}`);
  }

  // Verify CSRF state
  const storedState = request.cookies.get('meta_oauth_state')?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect(`${appUrl}/dashboard?meta_error=invalid_state`);
  }
  if (!code) {
    return NextResponse.redirect(`${appUrl}/dashboard?meta_error=missing_code`);
  }

  // Verify the user is still authenticated
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.redirect(`${appUrl}/login?next=/dashboard`);
  }

  const appId       = process.env.META_APP_ID;
  const appSecret   = process.env.META_APP_SECRET;
  const redirectUri = `${appUrl}/api/integrations/meta/callback`;

  try {
    // Exchange code for short-lived token
    const tokenParams = new URLSearchParams({ client_id: appId, client_secret: appSecret, redirect_uri: redirectUri, code });
    const tokenRes = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?${tokenParams}`);
    if (!tokenRes.ok) {
      const err = await tokenRes.json();
      throw new Error(err.error?.message ?? 'Token exchange failed');
    }
    const { access_token } = await tokenRes.json();

    // Exchange for a long-lived token (~60 days)
    const llParams = new URLSearchParams({
      grant_type: 'fb_exchange_token', client_id: appId, client_secret: appSecret, fb_exchange_token: access_token,
    });
    const llRes = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?${llParams}`);
    const { access_token: longLivedToken } = llRes.ok ? await llRes.json() : { access_token };

    // Compute expiry (~55 days from now)
    const expiresAt = new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString();

    // Persist token in DB keyed to this user
    await supabase.from('integrations').upsert({
      user_id:         user.id,
      platform:        'meta',
      status:          'connected',
      access_token:    longLivedToken,
      token_expires_at: expiresAt,
      connected_at:    new Date().toISOString(),
    }, { onConflict: 'user_id,platform' });

    const response = NextResponse.redirect(`${appUrl}/dashboard?meta_connected=1`);
    response.cookies.set('meta_oauth_state', '', { maxAge: 0, path: '/' });
    return response;
  } catch (err) {
    return NextResponse.redirect(`${appUrl}/dashboard?meta_error=${encodeURIComponent(err.message)}`);
  }
}
