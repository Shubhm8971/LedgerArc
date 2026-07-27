'use client';

import React from 'react';
import { Shield } from 'lucide-react';

export default function Loading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative flex flex-col items-center gap-4 p-8 rounded-3xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <Shield className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-white">
            Syncing Ledger
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Establishing secure encrypted connection...
          </span>
        </div>
      </div>
    </div>
  );
}