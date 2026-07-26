'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { signupAction } from './actions';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signupAction(formData);

      if (!result.success) {
        toast.error(result.error || 'Signup failed.');
        setLoading(false);
        return;
      }

      toast.success('Workspace created successfully! Redirecting...');
      router.replace('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error('Signup failed', { description: err.message || 'Network request failed.' });
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-black text-indigo-300">Create LedgerArc Account</h1>
          <p className="text-sm text-slate-400 mt-1">Set up your unique workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Workspace Name</label>
            <input
              type="text"
              name="orgName"
              placeholder="e.g. My-Unique-Company"
              required
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@company.com"
              required
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating Workspace...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:underline font-semibold">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}