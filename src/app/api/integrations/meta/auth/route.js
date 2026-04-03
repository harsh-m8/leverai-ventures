import { NextResponse } from 'next/server';

const SCOPES = ['ads_read', 'ads_management', 'business_management', 'read_insights'].join(',');

export async function GET() {
  const appId       = process.env.META_APP_ID;
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/meta/callback`
    : null;

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: 'META_APP_ID and NEXT_PUBLIC_APP_URL must be set in environment variables' },
      { status: 500 }
    );
  }

  // Generate a random state token to protect against CSRF
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id:     appId,
    redirect_uri:  redirectUri,
    scope:         SCOPES,
    response_type: 'code',
    state,
  });

  const oauthUrl = `https://www.facebook.com/v21.0/dialog/oauth?${params}`;

  // Pass state in a short-lived cookie so the callback can verify it
  const response = NextResponse.redirect(oauthUrl);
  response.cookies.set('meta_oauth_state', state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   600, // 10 minutes
    path:     '/',
  });
  return response;
}
