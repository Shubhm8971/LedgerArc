'use client';

import React from 'react';
import { WorkspaceRole } from '@/utils/rbac';
import { Upload, Sparkles, FileSpreadsheet, LogOut, SlidersHorizontal } from 'lucide-react';

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
  onSignOut,
  onPdfUpload,
}: DashboardActionBarProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-end' }}>
      
      {/* Matrix Mode Filter Switch */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(2, 6, 23, 0.8)', border: '1px solid rgba(51, 65, 85, 0.8)', padding: '0.25rem', borderRadius: '0.75rem' }}>
        <span style={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', color: '#94a3b8', paddingLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <SlidersHorizontal style={{ width: '12px', height: '12px', color: '#818cf8' }} /> Filter:
        </span>
        <button
          type="button"
          onClick={() => setMatrixMode('inclusive')}
          style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold', background: matrixMode === 'inclusive' ? '#4f46e5' : 'transparent', color: matrixMode === 'inclusive' ? '#ffffff' : '#94a3b8', border: 'none', cursor: 'pointer' }}
        >
          Inclusive
        </button>
        <button
          type="button"
          onClick={() => setMatrixMode('strict')}
          style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold', background: matrixMode === 'strict' ? '#4f46e5' : 'transparent', color: matrixMode === 'strict' ? '#ffffff' : '#94a3b8', border: 'none', cursor: 'pointer' }}
        >
          Strict Compliance
        </button>
      </div>

      {/* PDF Upload Button */}
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '0.75rem', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold', color: '#cbd5e1', cursor: 'pointer' }}>
        <Upload style={{ width: '14px', height: '14px', color: '#818cf8' }} />
        <span>Upload Receipt</span>
        <input type="file" accept="application/pdf" onChange={onPdfUpload} style={{ display: 'none' }} />
      </label>

      {/* GSTR-1 Export */}
      <button
        type="button"
        onClick={onGSTR1Export}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', background: 'rgba(79, 70, 229, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '0.75rem', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold', color: '#a5b4fc', cursor: 'pointer' }}
      >
        <Sparkles style={{ width: '14px', height: '14px', color: '#818cf8' }} />
        <span>Compile GSTR-1</span>
      </button>

      {/* Export CSV */}
      <button
        type="button"
        onClick={onExportCSV}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '0.75rem', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold', color: '#cbd5e1', cursor: 'pointer' }}
      >
        <FileSpreadsheet style={{ width: '14px', height: '14px', color: '#34d399' }} />
        <span>Export CSV</span>
      </button>

      {/* Sign Out */}
      <button
        type="button"
        onClick={onSignOut}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', background: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(225, 29, 72, 0.3)', borderRadius: '0.75rem', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold', color: '#fca5a5', cursor: 'pointer' }}
      >
        <LogOut style={{ width: '14px', height: '14px' }} />
        <span>Sign Out</span>
      </button>

    </div>
  );
}