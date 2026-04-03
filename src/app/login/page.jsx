'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const next         = searchParams.get('next') ?? '/dashboard';
  const urlError     = searchParams.get('error');

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(urlError ?? '');
  const [resetSent,    setResetSent]    = useState(false);
  const [showReset,    setShowReset]    = useState(false);
  const [resetEmail,   setResetEmail]   = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (loginError) {
      setError(loginError.message);
    } else {
      router.push(next);
      router.refresh();
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setResetLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/confirm?type=recovery`,
    });
    setResetLoading(false);
    setResetSent(true);
  }

  if (showReset) {
    return (
      <>
        <div className="px-8 pt-8 pb-6 border-b border-gray-50">
          <button onClick={() => setShowReset(false)}
            className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors mb-4">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to sign in
          </button>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">Reset password</h1>
          <p className="text-[13px] text-gray-400 mt-1">We'll email you a reset link.</p>
        </div>
        <div className="px-8 py-6">
          {resetSent ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-[12.5px] text-emerald-700 font-medium">
              Check your inbox — reset link sent to <strong>{resetEmail}</strong>.
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Email</label>
                <input
                  type="email" required value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-300 hover:border-gray-300 transition-colors"
                />
              </div>
              <button type="submit" disabled={resetLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px] text-white bg-[#E85D04] hover:bg-[#d45300] shadow-[0_2px_12px_rgba(232,93,4,.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {resetLoading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="px-8 pt-8 pb-6 border-b border-gray-50">
        <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">Sign in</h1>
        <p className="text-[13px] text-gray-400 mt-1">Welcome back to LeverAI Ventures.</p>
      </div>

      <form onSubmit={handleLogin} className="px-8 py-6 space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-[12.5px] text-red-600 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Email</label>
          <input
            type="email" required autoComplete="email"
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-300 hover:border-gray-300 transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-gray-500">Password</label>
            <button type="button" onClick={() => setShowReset(true)}
              className="text-[11px] font-semibold text-[#E85D04] hover:text-[#d45300] transition-colors">
              Forgot password?
            </button>
          </div>
          <input
            type="password" required autoComplete="current-password"
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Your password"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-300 hover:border-gray-300 transition-colors"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px] text-white transition-all bg-[#E85D04] hover:bg-[#d45300] shadow-[0_2px_12px_rgba(232,93,4,.3)] hover:shadow-[0_4px_20px_rgba(232,93,4,.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-2">
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in…
            </>
          ) : 'Sign in'}
        </button>
      </form>

      <div className="px-8 pb-7 text-center">
        <p className="text-[12.5px] text-gray-400">
          New to LeverAI Ventures?{' '}
          <a href="/signup" className="font-semibold text-[#E85D04] hover:text-[#d45300] transition-colors">Create an account</a>
        </p>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center px-4"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');`}</style>

      {/* Logo */}
      <a href="/" className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E85D04] to-[#f97316] flex items-center justify-center shadow-[0_2px_8px_rgba(232,93,4,.35)]">
          <svg viewBox="0 0 20 20" fill="none" className="w-[18px] h-[18px]">
            <path d="M4 15 8 6l3.5 5.5L14 7l3 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="font-extrabold text-[17px] text-gray-900 tracking-tight">
          LeverAI <span className="font-normal text-gray-400">Ventures</span>
        </span>
      </a>

      <div className="w-full max-w-[400px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <Suspense fallback={<div className="px-8 py-10 text-center text-[13px] text-gray-400">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
