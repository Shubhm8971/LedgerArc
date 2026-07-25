'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getSupabaseBrowserClient } from '@/utils/supabase-client';
import { toast } from 'sonner';
import { hasPermission, WorkspaceRole } from '@/utils/rbac';
import { ExpenseLog } from './hooks/useDashboardLedger';

import DashboardAnalytics from '@/components/dashboard-analytics';
import DashboardActionBar from '@/components/DashboardActionBar';
import PolicyAnomalyModal from '@/components/PolicyAnomalyModal';
import UpgradeModal from '@/components/UpgradeModal';

import { useLedgerRealtime } from './hooks/useDashboardLedger';
import { useDashboardActions } from './hooks/useDashboardActions';

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<ExpenseLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<WorkspaceRole>('member');
  const [profileError, setProfileError] = useState<string | null>(null);

  const [matrixMode, setMatrixMode] = useState<'inclusive' | 'strict'>('inclusive');
  const [auditModalOpen, setAuditModalOpen] = useState<boolean>(false);
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, feature: '' });
  const [activeAuditTarget, setActiveAuditTarget] = useState<ExpenseLog | null>(null);

  const supabase = useMemo(() => {
    try {
      return getSupabaseBrowserClient();
    } catch (err) {
      console.error('[Dashboard] Supabase client init failed:', err);
      return null;
    }
  }, []);

  // Filter expenses dynamically based on Matrix mode:
  // - Inclusive: Show all entries
  // - Strict: Hide anything that isn't explicitly approved and audited
  const processedExpenses = useMemo(() => {
    if (matrixMode === 'strict') {
      return expenses.filter(
        (item) => item.approval_status === 'approved' && item.is_audited === true
      );
    }
    return expenses;
  }, [expenses, matrixMode]);

  const fetchLedgerData = useCallback(async (uid: string, orgId: string) => {
    if (!supabase) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch(`/api/get-expenses?userId=${uid}&limit=20`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'X-Org-Id': orgId,
        },
      });

      const result = await res.json();
      if (result.success) {
        setExpenses(result.data ?? []);
      }
    } catch (err) {
      console.error('[fetchLedgerData] Network error:', err);
    }
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;

    const initializeDashboard = async () => {
      setLoading(true);
      if (!supabase) {
        if (!cancelled) {
          setProfileError('Supabase client failed to initialize.');
          setLoading(false);
        }
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          if (!cancelled) setLoading(false);
          return;
        }

        const uid = session.user.id;
        if (!cancelled) setCurrentUserId(uid);

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('org_id, role')
          .eq('id', uid)
          .maybeSingle();

        if (!profile?.org_id) {
          if (!cancelled) {
            setProfileError('Organization profile not found.');
            setLoading(false);
          }
          return;
        }

        if (!cancelled) {
          setCurrentOrgId(profile.org_id);
          setUserRole(profile.role as WorkspaceRole);
          setProfileError(null);
        }

        await fetchLedgerData(uid, profile.org_id);
      } catch (err) {
        console.error('[Dashboard] Init error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initializeDashboard();
    return () => { cancelled = true; };
  }, [supabase, fetchLedgerData]);

  const refreshLedger = useCallback(() => {
    if (currentUserId && currentOrgId) {
      fetchLedgerData(currentUserId, currentOrgId);
    }
  }, [currentUserId, currentOrgId, fetchLedgerData]);

  const {
    exportToCSVForAccountant,
    handlePdfUpload,
    handleGSTR1Export,
  } = useDashboardActions(
    processedExpenses,
    currentOrgId,
    currentUserId,
    matrixMode,
    refreshLedger
  );

  useLedgerRealtime(currentOrgId, refreshLedger);

  const attemptAction = async (action: string, featureName: string, callback: () => Promise<void>) => {
    if (!hasPermission(userRole, action)) {
      setUpgradeModal({ isOpen: true, feature: featureName });
    } else {
      await callback();
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono">Synchronizing Workspace...</div>;
  }

  if (profileError) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-rose-400 font-mono">{profileError}</div>;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-5 py-10">
      <div className="mx-auto max-w-5xl flex flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-3xl font-black text-indigo-300">LedgerArc</h1>
            <p className="text-sm text-slate-500">Corporate Domain Tier: {userRole.toUpperCase()}</p>
          </div>

          <DashboardActionBar
            userRole={userRole}
            matrixMode={matrixMode}
            setMatrixMode={setMatrixMode}
            onGSTR1Export={() => attemptAction('policy:modify', 'GSTR-1 Compilation', handleGSTR1Export)}
            onExportCSV={exportToCSVForAccountant}
            onSignOut={async () => {
              if (supabase) {
                await supabase.auth.signOut();
              }
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/login';
            }}
            onPdfUpload={handlePdfUpload}
          />
        </header>

        <DashboardAnalytics data={processedExpenses} />

        <section className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-indigo-300">
              Master Ledger View ({processedExpenses.length} Records shown in {matrixMode.toUpperCase()} mode)
            </h2>
            <button 
              onClick={refreshLedger}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 underline"
            >
              Force Refresh
            </button>
          </div>

          {processedExpenses.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-4 text-center">
              {matrixMode === 'strict' 
                ? 'No fully approved and audited transactions found in Strict mode.' 
                : 'No transactions found in database for this organization.'}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {processedExpenses.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-800 bg-slate-950/60">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-slate-100">{item.vendor}</span>
                    <span className="text-xs text-slate-400 font-mono">{item.raw_transcript || 'No transcript text available'}</span>
                    <span className="text-[10px] font-mono text-slate-500">ID: {item.id}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-base font-mono font-black text-indigo-400">₹{item.amount.toLocaleString()}</span>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                        item.approval_status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        item.approval_status === 'rejected' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                        'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {item.approval_status || 'pending'}
                      </span>
                    </div>

                    <div className="flex gap-2 border-l border-slate-800 pl-4">
                      <button
                        onClick={async () => {
                          const { error } = await supabase
                            ?.from('expense_logs')
                            .update({ approval_status: 'approved', is_audited: true })
                            .eq('id', item.id);
                          
                          if (error) toast.error('Failed to approve');
                          else {
                            toast.success('Transaction approved');
                            refreshLedger();
                          }
                        }}
                        className="px-3 py-1 bg-emerald-900/40 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-mono rounded transition-colors"
                      >
                        Approve
                      </button>

                      <button
                        onClick={async () => {
                          const { error } = await supabase
                            ?.from('expense_logs')
                            .update({ approval_status: 'pending', is_audited: false })
                            .eq('id', item.id);
                          
                          if (error) toast.error('Failed to unapprove');
                          else {
                            toast.success('Transaction reset to pending');
                            refreshLedger();
                          }
                        }}
                        className="px-3 py-1 bg-amber-900/40 hover:bg-amber-900 border border-amber-700 text-amber-300 text-xs font-mono rounded transition-colors"
                      >
                        Unapprove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <PolicyAnomalyModal
          isOpen={auditModalOpen}
          target={activeAuditTarget}
          onClose={() => setAuditModalOpen(false)}
          onConfirm={async (justification: string) => {
            if (!activeAuditTarget || !justification.trim()) {
              // Correct
              toast.error('Justification is required.');
              return;
            }

            try {
              await supabase?.from('audit_overrides').insert({
                org_id: currentOrgId,
                user_id: currentUserId,
                item_id: activeAuditTarget.id,
                justification_reason: justification,
              });

              setAuditModalOpen(false);
              refreshLedger();
              toast.success('Override Authenticated');
            } catch (err) {
              toast.error('Failed to execute audit override.');
            }
          }}
        />

        <UpgradeModal
          isOpen={upgradeModal.isOpen}
          feature={upgradeModal.feature}
          onClose={() => setUpgradeModal({ isOpen: false, feature: '' })}
        />
      </div>
    </main>
  );
}