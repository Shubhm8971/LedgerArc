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
  return null;
}