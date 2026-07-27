'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface PolicyAnomalyModalProps {
  isOpen: boolean;
  target: any;
  onClose: () => void;
  onConfirm: (justification: string) => void;
}

export default function PolicyAnomalyModal({ isOpen, target, onClose, onConfirm }: PolicyAnomalyModalProps) {
  const [justification, setJustification] = useState('');

  if (!isOpen || !target) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl flex flex-col gap-6 text-slate-100">
        
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Policy Anomaly Override</h3>
            <p className="text-xs text-slate-400 font-mono">Transaction ID: {target.id}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col gap-2 font-mono text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Vendor: <strong className="text-slate-200">{target.vendor}</strong></span>
            <span>Amount: <strong className="text-indigo-400">₹{target.amount?.toLocaleString()}</strong></span>
          </div>
          <p className="text-slate-400 line-clamp-2">Transcript: {target.raw_transcript || 'No details available'}</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Required Compliance Justification
          </label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Enter reason for overriding policy ceiling or weekend rule..."
            rows={3}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-xs font-mono font-bold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(justification)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-xs font-mono font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Authenticate Override</span>
          </button>
        </div>

      </div>
    </div>
  );
}