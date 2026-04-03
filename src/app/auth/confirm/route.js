import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Handles three email callback types from Supabase Auth:
 *   - Email confirmation after signup (type=email)
 *   - Password reset (type=recovery)
 *   - Magic link login (type=magiclink)
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type      = searchParams.get('type');
  const next      = searchParams.get('next') ?? '/dashboard';

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Invalid confirmation link')}`);
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
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // For password recovery, send the user to a page where they can set a new password.
  // For email confirmation / magic link, send to the dashboard (or the 'next' param).
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/auth/reset-password`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
