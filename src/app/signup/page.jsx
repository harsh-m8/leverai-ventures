'use client';
import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function SignupPage() {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setDone(true);
    }
  }

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
        {done ? (
          <div className="px-8 py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-[18px] font-extrabold text-gray-900 mb-2">Check your email</h2>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              We sent a confirmation link to <strong className="text-gray-700">{email}</strong>.
              Click it to activate your account.
            </p>
            <p className="text-[11.5px] text-gray-400 mt-4">Didn't get it? Check your spam folder.</p>
          </div>
        ) : (
          <>
            <div className="px-8 pt-8 pb-6 border-b border-gray-50">
              <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">Create your account</h1>
              <p className="text-[13px] text-gray-400 mt-1">Start your free trial — no credit card required.</p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-[12.5px] text-red-600 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Work email</label>
                <input
                  type="email" required autoComplete="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-300 hover:border-gray-300 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Password</label>
                <input
                  type="password" required autoComplete="new-password" minLength={8}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-300 hover:border-gray-300 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Confirm password</label>
                <input
                  type="password" required autoComplete="new-password"
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Same password again"
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
                    Creating account…
                  </>
                ) : 'Create account'}
              </button>
            </form>

            <div className="px-8 pb-7 text-center">
              <p className="text-[12.5px] text-gray-400">
                Already have an account?{' '}
                <a href="/login" className="font-semibold text-[#E85D04] hover:text-[#d45300] transition-colors">Sign in</a>
              </p>
            </div>
          </>
        )}
      </div>

      <p className="mt-6 text-[11.5px] text-gray-400 text-center max-w-xs">
        By signing up you agree to our terms of service and privacy policy.
      </p>
    </div>
  );
}
