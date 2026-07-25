'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExpenseLog as BaseExpenseLog } from '@/app/dashboard/hooks/useDashboardLedger';

export interface ExpenseLog extends BaseExpenseLog {
  exceeds_ceiling?: boolean;
  is_weekend_violation?: boolean;
}

export function useExpenseApprovalQueue(expenses: ExpenseLog[]) {
  const [localAuditStatuses, setLocalAuditStatuses] = useState<Record<string, boolean>>({});
  const [auditEnabledById, setAuditEnabledById] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const statuses: Record<string, boolean> = {};
    expenses?.forEach((e) => {
      statuses[e.id] = e.is_audited ?? false;
    });
    setLocalAuditStatuses(statuses);
  }, [expenses]);

  const handleAuditToggle = useCallback((expenseId: string, newStatus: boolean) => {
    setLocalAuditStatuses((prev) => ({ ...prev, [expenseId]: newStatus }));
  }, []);

  const toggleRowAuditMode = (id: string) => {
    setAuditEnabledById((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const pendingItems = expenses?.filter((item) => {
    const isUnapproved = item.approval_status !== 'approved';
    const isBreach = item.exceeds_ceiling || item.is_weekend_violation;
    return isUnapproved || isBreach;
  }) || [];

  return {
    pendingItems,
    localAuditStatuses,
    auditEnabledById,
    handleAuditToggle,
    toggleRowAuditMode,
  };
}