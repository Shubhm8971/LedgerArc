'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/utils/supabase-client';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !orgName) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      // 1. Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      const userId = authData.user?.id;

      if (!userId) {
        throw new Error('User creation failed.');
      }

      // 2. Create the organization profile and assign admin role to the first user
      // Note: Make sure your Supabase DB allows inserting into user_profiles upon signup, 
      // or handle this via a database trigger function.
      const { error: profileError } = await supabase.from('user_profiles').insert({
        id: userId,
        role: 'admin',
        org_id: orgName.toLowerCase().replace(/\s+/g, '-'), // Generates a clean organization ID slug
      });

      if (profileError) {
        console.error('Profile insertion warning:', profileError.message);
      }

      toast.success('Account created successfully! Redirecting to dashboard...');
      router.replace('/dashboard');
    } catch (err: any) {
      toast.error('Signup failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-black text-indigo-300">Create LedgerArc Account</h1>
          <p className="text-sm text-slate-400 mt-1">Set up your workspace and start managing compliance.</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Organization / Workspace Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Acme Corp"
              required
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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