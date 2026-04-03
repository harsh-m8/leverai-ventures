import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Handles three email callback types from Supabase Auth:
 *   - Email confirmation after signup (type=email)
 *   - Password reset (type=recovery)
 *   - Magic link login (type=magiclink)
 *
 * Uses NEXT_PUBLIC_APP_URL for redirects rather than request.url origin,
 * because Azure App Service sits behind a reverse proxy and request.url
 * contains an internal hostname, not the public-facing domain.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type      = searchParams.get('type');
  const next      = searchParams.get('next') ?? '/dashboard';

  // Use the configured public URL, falling back to the request origin only
  // for local development where NEXT_PUBLIC_APP_URL may not be set.
  const { origin } = new URL(request.url);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin;

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent('Invalid confirmation link')}`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  if (type === 'recovery') {
    return NextResponse.redirect(`${appUrl}/auth/reset-password`);
  }

  return NextResponse.redirect(`${appUrl}${next}`);
}
