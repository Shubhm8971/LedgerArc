'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, Building2, FileText, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden px-4 py-8 md:px-12">
      {/* Background ambient glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-violet-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between rounded-3xl border border-slate-800/80 bg-slate-900/80 px-6 py-4 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Shield className="w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-tight text-white font-mono">LedgerArc</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-300 hover:text-white transition"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-mono font-bold text-white shadow-lg shadow-indigo-600/30 transition"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center text-center my-auto py-16 gap-8">
        
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-mono font-bold text-indigo-300 uppercase tracking-widest shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Secure Multi-Tenant Enterprise Ledger
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white max-w-3xl leading-tight">
          Automated Compliance & <span className="text-indigo-400">Intelligent Ledger</span> Auditing
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-2xl font-mono">
          Isolate organization workspaces, enforce strict ceiling controls, compile GSTR-1 data effortlessly, and manage real-time expense approvals.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center pt-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white shadow-xl shadow-indigo-600/40 transition active:scale-[0.99]"
          >
            <span>Initialize Organization Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-sm font-bold text-slate-200 transition"
          >
            <span>Access Portal Gateway</span>
          </Link>
        </div>

        {/* Feature Grid Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-12 text-left">
          
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl flex flex-col gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">Isolated Workspaces</h3>
            <p className="text-xs text-slate-400">Secure multi-tenant data partitioning ensuring strict corporate security boundaries.</p>
          </div>

          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl flex flex-col gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">Live Compliance Matrix</h3>
            <p className="text-xs text-slate-400">Instant anomaly detection for temporal violations and ceiling breaches.</p>
          </div>

          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl flex flex-col gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">GSTR-1 Compilation</h3>
            <p className="text-xs text-slate-400">Seamless accountant-ready CSV exports and automated receipt parsing pipelines.</p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full text-center text-xs text-slate-500 font-mono pt-8 border-t border-slate-900">
        LedgerArc Enterprise Financial Protocol &copy; {new Date().getFullYear()} • Secure Gateway
      </footer>

    </div>
  );
}