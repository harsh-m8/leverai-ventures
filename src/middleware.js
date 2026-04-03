import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Propagate any cookie mutations (e.g. session refresh) to both
          // the request and the response so they stay in sync.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: always use getUser() (not getSession()) in middleware —
  // it re-validates the token with Supabase Auth on every call.
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Unauthenticated users trying to access the dashboard → send to login
  if (pathname.startsWith('/dashboard') && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already-authenticated users hitting login/signup → send to dashboard
  if ((pathname === '/login' || pathname === '/signup') && user) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = '/dashboard';
    dashUrl.searchParams.delete('next');
    return NextResponse.redirect(dashUrl);
  }

  return supabaseResponse;
}

export const config = {
  // Run on every request except static assets and Next.js internals
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
