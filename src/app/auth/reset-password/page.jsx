'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [done,      setDone]      = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setDone(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center px-4"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');`}</style>

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
        <div className="px-8 pt-8 pb-6 border-b border-gray-50">
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">Set new password</h1>
          <p className="text-[13px] text-gray-400 mt-1">Choose a strong password for your account.</p>
        </div>

        <div className="px-8 py-6">
          {done ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-[12.5px] text-emerald-700 font-medium text-center">
              Password updated! Redirecting to your dashboard…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-[12.5px] text-red-600 font-medium">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">New password</label>
                <input
                  type="password" required minLength={8} autoComplete="new-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-300 hover:border-gray-300 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Confirm new password</label>
                <input
                  type="password" required autoComplete="new-password"
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Same password again"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-300 hover:border-gray-300 transition-colors"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px] text-white bg-[#E85D04] hover:bg-[#d45300] shadow-[0_2px_12px_rgba(232,93,4,.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2">
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
