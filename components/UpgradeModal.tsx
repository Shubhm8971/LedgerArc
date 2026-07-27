'use client';

import React from 'react';
import { Lock, X, Sparkles, ArrowRight } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  feature: string;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, feature, onClose }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl flex flex-col gap-6 text-slate-100">
        
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
          <Lock className="w-6 h-6" />
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-black text-white">Enterprise Tier Required</h3>
          <p className="text-sm text-slate-400">
            The feature <span className="text-indigo-400 font-mono font-semibold">"{feature}"</span> requires administrative clearance or a higher workspace tier.
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-indigo-300 font-mono text-xs font-bold uppercase">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Upgrade Benefits
          </div>
          <p className="text-xs text-slate-300">Unlock automated policy overrides, live audit trails, and multi-tenant ledger synchronization.</p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-xs font-mono font-bold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              alert('Redirecting to billing tier upgrade portal...');
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-xs font-mono font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition cursor-pointer"
          >
            <span>Upgrade Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}