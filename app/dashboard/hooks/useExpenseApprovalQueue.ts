'use client';

import React from 'react';
import { ExpenseLog as BaseExpenseLog } from '@/app/dashboard/hooks/useDashboardLedger';

export interface ExpenseLog extends BaseExpenseLog {
  exceeds_ceiling?: boolean;
  is_weekend_violation?: boolean;
}

interface ExpenseApprovalQueueProps {
  expenses: ExpenseLog[];
  userId: string;
  userRole: string;
  onApprovalProcessed: () => void;
  onAuditRequested?: (expense: ExpenseLog) => void;
}

export default function ExpenseApprovalQueue(props: ExpenseApprovalQueueProps) {
  const pendingItems = props.expenses?.filter((item) => {
    const isUnapproved = item.approval_status !== 'approved';
    const isBreach = item.exceeds_ceiling || item.is_weekend_violation;
    return isUnapproved || isBreach;
  }) || [];

  if (pendingItems.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col gap-4">
      <div>
        <h3 className="m-0 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-100">
          🛡️ Policy Infraction Approval Workspace Queue
          <span className="rounded-md bg-rose-500 px-2 py-0.5 text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-white">
            {pendingItems.length} Active Flagged Breaches
          </span>
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Transactions logged requiring administrator sign-off or row-level audit review.
        </p>
      </div>
    </div>
  );
}