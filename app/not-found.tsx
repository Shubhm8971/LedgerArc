'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100 overflow-hidden">
      {/* Background ambient glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center gap-6">
        
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold">
            Error 404 • Not Found
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white">Route Terminated</h1>
          <p className="text-sm text-slate-400">
            The workspace sector or ledger page you are looking for does not exist or has been restricted.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full pt-2">
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-xs font-mono font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Command Center</span>
          </Link>
        </div>

      </div>
    </div>
  );
}