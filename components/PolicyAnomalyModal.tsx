'use client';

import React, { useState } from 'react';
import { ExpenseLog } from '@/app/dashboard/hooks/useDashboardLedger';

interface PolicyAnomalyModalProps {
  isOpen: boolean;
  target: ExpenseLog | null;
  onClose: () => void;
  onConfirm: (justification: string) => Promise<void>;
}

export default function PolicyAnomalyModal({ isOpen, target, onClose, onConfirm }: PolicyAnomalyModalProps) {
  const [justification, setJustification] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !target) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-100">🛡️ Policy Anomaly Justification</h3>
        <p className="text-xs text-slate-400">
          Provide compliance justification for bypassing policy rules for transaction <span className="font-mono text-indigo-400">{target.vendor}</span> (₹{target.amount.toLocaleString('en-IN')}).
        </p>

        <textarea
          rows={3}
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          placeholder="Enter business justification..."
          className="w-full rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await onConfirm(justification);
              setLoading(false);
              setJustification('');
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition"
          >
            {loading ? 'Submitting...' : 'Confirm Override'}
          </button>
        </div>
      </div>
    </div>
  );
}