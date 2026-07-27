'use client';

import React from 'react';
import { ExpenseLog } from '@/types/ledger';
import { Wallet, CheckCircle, ShieldAlert, FileText, TrendingUp } from 'lucide-react';

interface DashboardAnalyticsProps {
  data: ExpenseLog[];
}

export default function DashboardAnalytics({ data }: DashboardAnalyticsProps) {
  const totalSpent = data.reduce((acc, item) => acc + (item.amount || 0), 0);
  const approvedCount = data.filter((item) => item.approval_status === 'approved').length;
  const anomaliesCount = data.filter((item) => item.is_anomaly || item.exceeds_ceiling || item.is_weekend_violation).length;

  const metrics = [
    {
      title: 'Total Ledger Volume',
      value: `₹${totalSpent.toLocaleString('en-IN')}`,
      subtitle: `${data.length} total recorded transactions`,
      icon: Wallet,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    },
    {
      title: 'Approved Transactions',
      value: approvedCount,
      subtitle: 'Successfully cleared items',
      icon: CheckCircle,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      title: 'Policy Infractions',
      value: anomaliesCount,
      subtitle: 'Requires administrative audit',
      icon: ShieldAlert,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={index}
            className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-4 hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                {metric.title}
              </span>
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${metric.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-2xl md:text-3xl font-mono font-black text-white">
                {metric.value}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {metric.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}