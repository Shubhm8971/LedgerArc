'use client';

import React, { useRef } from 'react';
import { WorkspaceRole } from '@/utils/rbac';

interface DashboardActionBarProps {
  userRole: WorkspaceRole;
  matrixMode: 'inclusive' | 'strict';
  setMatrixMode: (mode: 'inclusive' | 'strict') => void;
  onGSTR1Export: () => void;
  onExportCSV: () => void;
  onSignOut: () => void;
  onPdfUpload: (file: File) => void;
}

export default function DashboardActionBar({
  matrixMode,
  setMatrixMode,
  onGSTR1Export,
  onExportCSV,
  onSignOut,
  onPdfUpload,
}: DashboardActionBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onPdfUpload(e.target.files[0]);
          }
        }}
        accept="application/pdf"
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition"
      >
        📄 Upload PDF Bill
      </button>

      <button
        type="button"
        onClick={onExportCSV}
        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition border border-slate-700"
      >
        📊 Export CSV
      </button>

      <button
        type="button"
        onClick={onGSTR1Export}
        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition border border-slate-700"
      >
        📑 GSTR-1 JSON
      </button>

      <button
        type="button"
        onClick={() => setMatrixMode(matrixMode === 'inclusive' ? 'strict' : 'inclusive')}
        className={`px-3 py-2 rounded-lg text-xs font-mono font-bold border transition ${
          matrixMode === 'strict'
            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
            : 'bg-slate-800 border-slate-700 text-slate-400'
        }`}
      >
        Matrix: {matrixMode.toUpperCase()}
      </button>

      <button
        type="button"
        onClick={onSignOut}
        className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 rounded-lg text-xs font-bold transition border border-rose-900/50"
      >
        Sign Out
      </button>
    </div>
  );
}