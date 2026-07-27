'use client';

import React from 'react';
import { WorkspaceRole } from '@/utils/rbac';
import { FileSpreadsheet, FileText, UploadCloud, ShieldAlert, Sparkles, Filter } from 'lucide-react';

interface DashboardActionBarProps {
  userRole: WorkspaceRole;
  matrixMode: 'inclusive' | 'strict';
  setMatrixMode: (mode: 'inclusive' | 'strict') => void;
  onGSTR1Export: () => void;
  onExportCSV: () => void;
  onSignOut: () => void;
  onPdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DashboardActionBar({
  matrixMode,
  setMatrixMode,
  onGSTR1Export,
  onExportCSV,
  onPdfUpload,
}: DashboardActionBarProps) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5 backdrop-blur-xl shadow-xl">
      
      {/* Matrix Mode Switcher */}
      <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 flex items-center gap-1">
          <Filter className="w-3 h-3 text-indigo-400" /> Filter:
        </span>
        <button
          onClick={() => setMatrixMode('inclusive')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
            matrixMode === 'inclusive'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Inclusive
        </button>
        <button
          onClick={() => setMatrixMode('strict')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
            matrixMode === 'strict'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Strict Compliance
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        
        {/* PDF Upload Trigger */}
        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-700/80 text-xs font-mono font-bold text-slate-200 transition cursor-pointer shadow-sm">
          <UploadCloud className="w-4 h-4 text-indigo-400" />
          <span>Upload Receipt</span>
          <input type="file" accept="application/pdf" onChange={onPdfUpload} className="hidden" />
        </label>

        {/* GSTR-1 Compile */}
        <button
          onClick={onGSTR1Export}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-xs font-mono font-bold text-indigo-300 transition cursor-pointer shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Compile GSTR-1</span>
        </button>

        {/* Export CSV */}
        <button
          onClick={onExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-700/80 text-xs font-mono font-bold text-slate-200 transition cursor-pointer shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export CSV</span>
        </button>

      </div>
    </div>
  );
}