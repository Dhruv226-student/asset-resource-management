'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/services/auth.service';
import { getEmployees } from '@/services/employee.service';
import { Activity, Eye, EyeOff, ArrowRight, Shield, Layers, BarChart3 } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@assetflow.com', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: 'Asset Manager', email: 'manager@assetflow.com', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { label: 'Dept. Head', email: 'head@assetflow.com', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Employee', email: 'amit.patel@assetflow.com', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@assetflow.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[48%] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-indigo-400 rounded-full blur-3xl" />
          <div className="absolute bottom-32 right-10 w-48 h-48 bg-purple-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500 rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-wide">AssetFlow</span>
          </div>
          <p className="text-indigo-300 text-sm mt-1 ml-14 font-medium tracking-widest uppercase">Enterprise ERP</p>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Manage enterprise assets<br />
              <span className="text-indigo-300">with precision.</span>
            </h1>
            <p className="mt-4 text-slate-400 text-base leading-relaxed max-w-md">
              A unified platform for asset tracking, lifecycle management, resource bookings, 
              maintenance scheduling, and compliance audits.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Layers className="w-5 h-5" />, label: '31+ Assets', sub: 'Tracked' },
              { icon: <Shield className="w-5 h-5" />, label: '4 Roles', sub: 'Secured Access' },
              { icon: <BarChart3 className="w-5 h-5" />, label: 'Real-time', sub: 'Analytics' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-indigo-400 flex justify-center mb-2">{stat.icon}</div>
                <p className="text-white font-bold text-sm">{stat.label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-slate-500 text-xs">
          © 2026 AssetFlow · Enterprise Asset Management System
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AssetFlow</span>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-slate-400 text-sm mb-7">Sign in to your AssetFlow account</p>

            {/* Error Alert */}
            {error && (
              <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-sm text-rose-300 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="you@assetflow.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-11 bg-white/8 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/25"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign in <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            {/* Demo Quick Access */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3 text-center">
                Quick Demo Access
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleDemoLogin(acc.email)}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-slate-300 font-medium transition-all text-left"
                  >
                    <span className="font-bold text-white block">{acc.label}</span>
                    <span className="text-slate-500 text-[10px]">{acc.email}</span>
                  </button>
                ))}
              </div>
              <p className="text-center text-[11px] text-slate-500 mt-2">Password: <code className="text-slate-300">password123</code></p>
            </div>

            <p className="mt-5 text-center text-xs text-slate-500">
              New employee?{' '}
              <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
