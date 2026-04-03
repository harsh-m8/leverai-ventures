import { NextResponse } from 'next/server';

// Scopes needed for Google Ads read access
const SCOPES = [
  'https://www.googleapis.com/auth/adwords',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

export async function GET() {
  const clientId    = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`
    : null;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'GOOGLE_CLIENT_ID and NEXT_PUBLIC_APP_URL must be set in environment variables' },
      { status: 500 }
    );
  }

  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         SCOPES,
    access_type:   'offline',   // request refresh token
    prompt:        'consent',   // force consent to always get refresh token
    state,
  });

  const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  const response = NextResponse.redirect(oauthUrl);
  response.cookies.set('google_oauth_state', state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   600,
    path:     '/',
  });
  return response;
}
