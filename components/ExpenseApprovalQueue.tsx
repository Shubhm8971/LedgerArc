'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ExpenseLog } from '@/types/ledger';
import { getSupabaseBrowserClient } from '@/utils/supabase-client';
import { toast } from 'sonner';
import AuditToggle from '@/components/AuditToggle';
import { ShieldAlert, CheckCircle2, XCircle, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';

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
    <div className="w-full rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-xl flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="m-0 flex flex-wrap items-center gap-2.5 text-sm font-mono font-bold uppercase tracking-wider text-indigo-300">
            <ShieldAlert className="w-4 h-4 text-rose-400" /> Policy Infraction Approval Queue
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Transactions logged requiring administrator sign-off or row-level audit review.
          </p>
        </div>
        <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-3 py-1 text-xs font-mono font-bold text-rose-400">
          {pendingItems.length} Active Breaches
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {pendingItems.map((item) => {
          const isCurrentProcessing = processingId === item.id;
          const isAudited = localAuditStatuses[item.id] ?? false;
          const isAuditModeOn = auditEnabledById[item.id] ?? false;
          const isAdminUser = userRole === 'admin';

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5 flex flex-col gap-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-semibold text-slate-100">
                    {item.vendor || 'Unknown Vendor'}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono text-rose-400 mt-0.5">
                    {item.exceeds_ceiling && (
                      <span className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-0.5">
                        ⚠️ Ceiling Breach
                      </span>
                    )}
                    {item.is_weekend_violation && (
                      <span className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-0.5">
                        ⚠️ Temporal Violation
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right text-base font-bold font-mono text-indigo-400 shrink-0">
                  ₹{item.amount?.toLocaleString('en-IN') ?? 0}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Audit:</span>
                    <AuditToggle
                      expenseId={item.id}
                      isAudited={isAudited}
                      onToggle={handleAuditToggle}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleRowAuditMode(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition cursor-pointer ${
                      isAuditModeOn 
                        ? 'border-indigo-500/40 bg-indigo-500/20 text-indigo-300' 
                        : 'border-slate-700/80 bg-slate-800/60 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>Details</span>
                    {isAuditModeOn ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isAuditModeOn && onAuditRequested && (
                    <button
                      type="button"
                      onClick={() => onAuditRequested(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold hover:bg-amber-500/25 transition cursor-pointer"
                    >
                      <span>🔍 Launch Modal</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    disabled={isCurrentProcessing || !isAdminUser}
                    onClick={() => handleDecision(item.id, 'rejected')}
                    className={`flex items-center gap-1 rounded-xl border px-3.5 py-2 text-xs font-mono font-bold transition ${
                      !isAdminUser || isCurrentProcessing 
                        ? 'opacity-55 cursor-not-allowed border-rose-900/50 text-rose-400 bg-rose-950/20' 
                        : 'border-rose-500/40 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 cursor-pointer'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>

                  <button
                    type="button"
                    disabled={isCurrentProcessing || !isAdminUser}
                    onClick={() => handleDecision(item.id, 'approved')}
                    className={`flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-mono font-bold text-white shadow-md transition ${
                      !isAdminUser || isCurrentProcessing 
                        ? 'opacity-55 cursor-not-allowed bg-emerald-600/40' 
                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 cursor-pointer'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isCurrentProcessing ? 'Processing...' : 'Authorize'}</span>
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