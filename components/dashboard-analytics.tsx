'use client';

import React from 'react';
import { ExpenseLog } from '@/app/dashboard/hooks/useDashboardLedger';

interface DashboardAnalyticsProps {
  data: ExpenseLog[];
}

export default function DashboardAnalytics({ data }: DashboardAnalyticsProps) {
  const totalVolume = data.reduce((acc, item) => acc + (item.amount || 0), 0);
  const pendingCount = data.filter((item) => item.approval_status !== 'approved').length;
  const flaggedCount = data.filter((item) => item.exceeds_ceiling || item.is_weekend_violation).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col gap-1">
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Total Ledger Volume</span>
        <span className="text-2xl font-black font-mono text-indigo-400">₹{totalVolume.toLocaleString('en-IN')}</span>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col gap-1">
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Pending Approvals</span>
        <span className="text-2xl font-black font-mono text-amber-400">{pendingCount} Records</span>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col gap-1">
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Policy Infractions</span>
        <span className="text-2xl font-black font-mono text-rose-400">{flaggedCount} Flags</span>
      </div>
    </div>
  );
}