import { NextResponse } from 'next/server';
import { createClient } from '../../../../../lib/supabase/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  if (error) {
    return NextResponse.redirect(`${appUrl}/dashboard?google_error=${encodeURIComponent(error)}`);
  }

  const storedState = request.cookies.get('google_oauth_state')?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect(`${appUrl}/dashboard?google_error=invalid_state`);
  }
  if (!code) {
    return NextResponse.redirect(`${appUrl}/dashboard?google_error=missing_code`);
  }

  // Verify the user is still authenticated
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.redirect(`${appUrl}/login?next=/dashboard`);
  }

  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri  = `${appUrl}/api/integrations/google/callback`;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
    });
    if (!tokenRes.ok) {
      const err = await tokenRes.json();
      throw new Error(err.error_description ?? 'Token exchange failed');
    }
    const tokens = await tokenRes.json();
    // tokens: { access_token, refresh_token, expires_in }

    const expiresAt = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString();

    await supabase.from('integrations').upsert({
      user_id:          user.id,
      platform:         'google',
      status:           'connected',
      access_token:     tokens.access_token,
      refresh_token:    tokens.refresh_token ?? null,
      token_expires_at: expiresAt,
      connected_at:     new Date().toISOString(),
    }, { onConflict: 'user_id,platform' });

    const response = NextResponse.redirect(`${appUrl}/dashboard?google_connected=1`);
    response.cookies.set('google_oauth_state', '', { maxAge: 0, path: '/' });
    return response;
  } catch (err) {
    return NextResponse.redirect(`${appUrl}/dashboard?google_error=${encodeURIComponent(err.message)}`);
  }
}
