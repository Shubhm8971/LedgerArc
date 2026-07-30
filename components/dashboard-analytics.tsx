'use client';

import React from 'react';
import { ExpenseLog } from '@/types/ledger';
import { Wallet, CheckCircle, ShieldAlert } from 'lucide-react';

interface DashboardAnalyticsProps {
  data: ExpenseLog[];
}

export default function DashboardAnalytics({ data }: DashboardAnalyticsProps) {
  const totalSpent = data.reduce((acc, item) => acc + (item.amount || 0), 0);
  const approvedCount = data.filter((item) => item.approval_status === 'approved').length;
  
  const anomaliesCount = data.filter((item: any) => 
    item?.is_anomaly || item?.exceeds_ceiling || item?.is_weekend_violation
  ).length;

  const metrics = [
    {
      title: 'Total Ledger Volume',
      value: `₹${totalSpent.toLocaleString('en-IN')}`,
      subtitle: `${data.length} total recorded transactions`,
      icon: Wallet,
      borderColor: 'rgba(99, 102, 241, 0.3)',
      bgColor: 'rgba(79, 70, 229, 0.1)',
      textColor: '#818cf8',
    },
    {
      title: 'Approved Transactions',
      value: approvedCount,
      subtitle: 'Successfully cleared items',
      icon: CheckCircle,
      borderColor: 'rgba(16, 185, 129, 0.3)',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      textColor: '#34d399',
    },
    {
      title: 'Policy Infractions',
      value: anomaliesCount,
      subtitle: 'Requires administrative audit',
      icon: ShieldAlert,
      borderColor: 'rgba(225, 29, 72, 0.3)',
      bgColor: 'rgba(225, 29, 72, 0.1)',
      textColor: '#fca5a5',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', width: '100%' }}>
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={index}
            style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(30, 41, 59, 0.8)', borderRadius: '1.5rem', padding: '1.5rem', backdropFilter: 'blur(16px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', boxSizing: 'border-box' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                {metric.title}
              </span>
              <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.75rem', background: metric.bgColor, border: `1px solid ${metric.borderColor}`, color: metric.textColor, marginLeft: 'auto' }}>
                <Icon style={{ width: '20px', height: '20px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '1.75rem', fontFamily: 'monospace', fontWeight: 900, color: '#ffffff' }}>
                {metric.value}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                {metric.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}