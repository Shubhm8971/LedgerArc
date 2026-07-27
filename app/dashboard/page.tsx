'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { Shield, RefreshCw, Building2, UserCheck, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
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
          if (!cancelled) {
            router.replace('/login');
          }
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
  }, [supabase, fetchLedgerData, router]);

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
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
        <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <span>Authenticating Workspace Session...</span>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-rose-400 font-mono text-xs">
        <AlertCircle className="w-8 h-8 text-rose-500" />
        <span>{profileError}</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 px-4 py-8 md:px-8 overflow-hidden">
      {/* Background ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-violet-600/5 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-8 relative z-10">
        
        {/* Header Navigation */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white">LedgerArc Command</h1>
                <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300">
                  Secure Portal
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-indigo-400" /> Org: <span className="text-slate-200">{currentOrgId || 'Workspace'}</span></span>
                <span>•</span>
                <span className="flex items-center gap-1.5 uppercase"><UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Tier: <span className="text-slate-200">{userRole}</span></span>
              </div>
            </div>
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

        {/* Analytics Summary */}
        <DashboardAnalytics data={processedExpenses} />

        {/* Master Ledger Section */}
        <section className="w-full rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-xl flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                Master Ledger View
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing {processedExpenses.length} records in <span className="font-semibold uppercase text-indigo-400">{matrixMode}</span> mode
              </p>
            </div>
            
            <button 
              onClick={refreshLedger}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-800/60 text-xs font-mono font-bold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Force Refresh</span>
            </button>
          </div>

          {processedExpenses.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
              <Shield className="w-8 h-8 text-slate-600" />
              <p className="text-xs text-slate-400 font-mono">
                {matrixMode === 'strict' 
                  ? 'No fully approved and audited transactions found in Strict mode.' 
                  : 'No transactions found in database for this organization.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {processedExpenses.map((item) => {
                const isApproved = item.approval_status === 'approved';
                const isRejected = item.approval_status === 'rejected';

                return (
                  <div 
                    key={item.id} 
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-950/90 transition"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-slate-100">{item.vendor || 'Unknown Vendor'}</span>
                      <span className="text-xs text-slate-400 font-mono line-clamp-1">{item.raw_transcript || 'No transcript text available'}</span>
                      <span className="text-[10px] font-mono text-slate-600">ID: {item.id}</span>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-base font-mono font-black text-indigo-400">
                          ₹{item.amount?.toLocaleString('en-IN') ?? 0}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${
                          isApproved ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80' :
                          isRejected ? 'bg-rose-950/60 text-rose-400 border-rose-800/80' :
                          'bg-amber-950/60 text-amber-400 border-amber-800/80'
                        }`}>
                          {isApproved && <CheckCircle2 className="w-3 h-3" />}
                          {isRejected && <XCircle className="w-3 h-3" />}
                          {!isApproved && !isRejected && <Clock className="w-3 h-3" />}
                          {item.approval_status || 'pending'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 border-l border-slate-800/80 pl-4">
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
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold rounded-xl transition cursor-pointer"
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
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold rounded-xl transition cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Modals */}
        <PolicyAnomalyModal
          isOpen={auditModalOpen}
          target={activeAuditTarget}
          onClose={() => setAuditModalOpen(false)}
          onConfirm={async (justification: string) => {
            if (!activeAuditTarget || !justification.trim()) {
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
    </div>
  );
}