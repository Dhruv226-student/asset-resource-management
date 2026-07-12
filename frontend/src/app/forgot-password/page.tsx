'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending a reset link (demo only)
    await new Promise(r => setTimeout(r, 800));
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">AssetFlow</span>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          {!submitted ? (
            <>
              <div className="flex items-center justify-center w-14 h-14 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl mb-5 mx-auto">
                <Mail className="w-7 h-7 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-1">Reset Password</h2>
              <p className="text-slate-400 text-sm text-center mb-6">
                Enter your registered email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@assetflow.com"
                    className="w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <button
                  id="forgot-submit"
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25"
                >
                  Send Reset Link
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl mb-5 mx-auto">
                <Mail className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-slate-400 text-sm mb-1">
                We've sent a password reset link to:
              </p>
              <p className="text-indigo-300 font-semibold text-sm mb-6">{email}</p>
              <p className="text-slate-500 text-xs">
                Didn't receive it? Check your spam folder or{' '}
                <button onClick={() => setSubmitted(false)} className="text-indigo-400 hover:text-indigo-300 font-medium">
                  try again
                </button>
                .
              </p>
              <p className="text-xs text-slate-500 mt-2 bg-white/5 border border-white/10 rounded-lg p-2">
                Note: This is a demo — no actual email is sent.
              </p>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-slate-500">
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
