'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signup } from '@/services/auth.service';
import { login } from '@/services/auth.service';
import { getDepartments } from '@/services/department.service';
import { Activity, ArrowRight, ArrowLeft } from 'lucide-react';
import { Department } from '@/types';

export default function SignupPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({ name: '', email: '', employeeId: '', departmentId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getDepartments().then(setDepartments);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.employeeId || !form.departmentId) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signup(form);
      // Auto-login after signup
      await login(form.email, 'password123');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
          <p className="text-slate-400 text-sm mb-6">Register as a new AssetFlow employee</p>

          {error && (
            <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-sm text-rose-300 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Dhruv Kachwala' },
              { label: 'Email Address', name: 'email', type: 'email', placeholder: 'you@assetflow.com' },
              { label: 'Employee ID', name: 'employeeId', type: 'text', placeholder: 'AF-EMP-017' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  {field.label}
                </label>
                <input
                  id={`signup-${field.name}`}
                  type={field.type}
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder={field.placeholder}
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Department
              </label>
              <select
                id="signup-department"
                name="departmentId"
                value={form.departmentId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="" className="bg-slate-900">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id} className="bg-slate-900">
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-slate-400 bg-white/5 border border-white/10 rounded-lg p-3">
              New accounts are assigned the <span className="font-semibold text-white">Employee</span> role by default. An Admin can upgrade your permissions.
            </p>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
