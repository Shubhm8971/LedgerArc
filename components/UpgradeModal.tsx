'use client';

import React from 'react';

interface UpgradeModalProps {
  isOpen: boolean;
  feature: string;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, feature, onClose }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col gap-4 text-center">
        <h3 className="text-lg font-bold text-slate-100">🔒 Corporate Tier Upgrade Required</h3>
        <p className="text-xs text-slate-400">
          Your current role does not have permissions to execute <span className="text-indigo-400 font-mono">{feature}</span>. Upgrade your workspace tier to gain access.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-2.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}