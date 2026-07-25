'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ExpenseLog as BaseExpenseLog } from '@/app/dashboard/hooks/useDashboardLedger';
import { getSupabaseBrowserClient } from '@/utils/supabase-client';
import { toast } from 'sonner';
import AuditToggle from '@/components/AuditToggle';

// Extended interface to prevent TypeScript property build errors
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

export default function ExpenseApprovalQueue({
  expenses,
  userId,
  userRole,
  onApprovalProcessed,
  onAuditRequested,
}: ExpenseApprovalQueueProps) {
  const [localAuditStatuses, setLocalAuditStatuses] = useState<Record<string, boolean>>({});
  const [auditEnabledById, setAuditEnabledById] = useState<Record<string, boolean>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const statuses: Record<string, boolean> = {};
    expenses?.forEach((e) => {
      statuses[e.id] = e.is_audited ?? false;
    });
    setLocalAuditStatuses(statuses);
  }, [expenses]);

  const handleAuditToggle = useCallback((expenseId: string, newStatus: boolean) => {
    setLocalAuditStatuses((prev) => ({ ...prev, [expenseId]: newStatus }));
    onApprovalProcessed();
  }, [onApprovalProcessed]);

  const toggleRowAuditMode = (id: string) => {
    setAuditEnabledById((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const pendingItems = expenses?.filter((item) => {
    const isUnapproved = item.approval_status !== 'approved';
    const isBreach = item.exceeds_ceiling || item.is_weekend_violation;
    return isUnapproved || isBreach;
  }) || [];

  const handleDecision = async (id: string, decision: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('expense_logs')
        .update({ approval_status: decision })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Transaction ${decision}`);
      onApprovalProcessed();
    } catch (err: any) {
      toast.error('Failed to process decision', { description: err.message });
    } finally {
      setProcessingId(null);
    }
  };

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

      <div className="flex flex-col gap-3">
        {pendingItems.map((item) => {
          const isCurrentProcessing = processingId === item.id;
          const isAudited = localAuditStatuses[item.id] ?? false;
          const isAuditModeOn = auditEnabledById[item.id] ?? false;
          const isAdminUser = userRole === 'admin';

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-semibold text-slate-100">
                    {item.vendor || 'Unknown Vendor'}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-rose-400">
                    {item.exceeds_ceiling && <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5">⚠️ Ceiling Breach</span>}
                    {item.is_weekend_violation && <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5">⚠️ Temporal Violation</span>}
                  </div>
                </div>

                <div className="text-right text-sm font-bold font-mono text-slate-100 shrink-0">
                  ₹{item.amount.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Audit:</span>
                    <AuditToggle
                      expenseId={item.id}
                      isAudited={isAudited}
                      onToggle={handleAuditToggle}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleRowAuditMode(item.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition ${
                      isAuditModeOn ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    Details: {isAuditModeOn ? 'Open' : 'Closed'}
                  </button>

                  {isAuditModeOn && onAuditRequested && (
                    <button
                      type="button"
                      onClick={() => onAuditRequested(item)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition"
                    >
                      🔍 Launch Modal
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isCurrentProcessing || !isAdminUser}
                    onClick={() => handleDecision(item.id, 'rejected')}
                    className={`rounded-md border px-3 py-2 text-sm font-bold transition ${
                      !isAdminUser || isCurrentProcessing ? 'opacity-50 cursor-not-allowed border-rose-800 text-rose-400' : 'border-rose-600 text-rose-500 hover:bg-rose-500/10 cursor-pointer'
                    }`}
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    disabled={isCurrentProcessing || !isAdminUser}
                    onClick={() => handleDecision(item.id, 'approved')}
                    className={`rounded-md px-3 py-2 text-sm font-bold text-white transition ${
                      !isAdminUser || isCurrentProcessing ? 'opacity-50 cursor-not-allowed bg-emerald-500/60' : 'bg-emerald-500 hover:bg-emerald-400 cursor-pointer'
                    }`}
                  >
                    {isCurrentProcessing ? 'Processing...' : 'Authorize'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}