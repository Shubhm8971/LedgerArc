'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [orgName, setOrgName] = useState('');

  // Live slug preview generator
  const orgSlug = orgName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgName, email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || 'Signup failed.');
        setLoading(false);
        return;
      }

      toast.success('Workspace created successfully! Redirecting...');
      router.replace('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error('Signup failed', { description: err?.message || 'Network request failed.' });
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 overflow-hidden">
      {/* Background ambient glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
        
        {/* Header Branding */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-widest font-semibold">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Secure Enterprise Gateway
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Create LedgerArc</h1>
          <p className="text-sm text-slate-400">Initialize your isolated organizational workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Workspace Name Input with Live Slug Preview */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Workspace Name
            </label>
            <input
              type="text"
              name="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Acme Corp"
              required
              className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />
            {orgName.trim() && (
              <span className="text-[11px] font-mono text-indigo-300/80 px-1 pt-0.5 truncate">
                URL Slug: <span className="text-indigo-400 font-semibold">{orgSlug || '...'}</span>
              </span>
            )}
          </div>

          {/* Email Address Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> Admin Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@company.com"
              required
              className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>

          {/* Password Input with Visibility Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" /> Secure Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 pr-10 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-3 group relative flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/50 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Initializing Workspace...</span>
              </div>
            ) : (
              <>
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer Login Link */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          Already managing an organization?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition hover:underline">
            Log in to portal
          </Link>
        </div>

      </div>
    </div>
  );
}