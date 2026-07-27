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
      <div style={{ minHeight: '100vh', backgroundColor: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.75rem' }}>
        <div style={{ width: '1.5rem', height: '1.5rem', border: '2px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span>Authenticating Workspace Session...</span>
      </div>
    );
  }

  if (profileError) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: '#f43f5e', fontFamily: 'monospace', fontSize: '0.75rem' }}>
        <AlertCircle style={{ width: '2rem', height: '2rem', color: '#f43f5e' }} />
        <span>{profileError}</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc', padding: '2rem 1rem', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background ambient glow effects */}
      <div style={{ position: 'absolute', top: 0, left: '25%', width: '500px', height: '500px', background: 'rgba(79, 70, 229, 0.05)', filter: 'blur(150px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '2.5rem', right: '2.5rem', width: '400px', height: '400px', background: 'rgba(139, 92, 246, 0.05)', filter: 'blur(130px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', zIndex: 10, width: '100%' }}>
        
        {/* Header Navigation */}
        <header style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderRadius: '1.5rem', border: '1px solid rgba(30, 41, 59, 0.8)', background: 'rgba(15, 23, 42, 0.8)', padding: '1.5rem', backdropFilter: 'blur(16px)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', height: '3rem', width: '3rem', alignItems: 'center', justifyContent: 'center', borderRadius: '1rem', background: 'rgba(79, 70, 229, 0.2)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)' }}>
              <Shield style={{ width: '1.5rem', height: '1.5rem' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.025em', color: '#ffffff', margin: 0 }}>LedgerArc Command</h1>
                <span style={{ borderRadius: '9999px', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.125rem 0.625rem', fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a5b4fc' }}>
                  Secure Portal
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', fontFamily: 'monospace', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Building2 style={{ width: '14px', height: '14px', color: '#818cf8' }} /> Org: <span style={{ color: '#e2e8f0' }}>{currentOrgId || 'Workspace'}</span></span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', textTransform: 'uppercase' }}><UserCheck style={{ width: '14px', height: '14px', color: '#34d399' }} /> Tier: <span style={{ color: '#e2e8f0' }}>{userRole}</span></span>
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
            onPdfUpload={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) {
                handlePdfUpload(file);
              }
            }}
          />
        </header>

        {/* Analytics Summary */}
        <DashboardAnalytics data={processedExpenses} />

        {/* Master Ledger Section */}
        <section style={{ width: '100%', borderRadius: '1.5rem', border: '1px solid rgba(30, 41, 59, 0.8)', background: 'rgba(15, 23, 42, 0.8)', padding: '1.5rem', backdropFilter: 'blur(16px)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid rgba(30, 41, 59, 0.8)', paddingBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a5b4fc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Master Ledger View
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0 0', fontFamily: 'monospace' }}>
                Showing {processedExpenses.length} records in <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#818cf8' }}>{matrixMode}</span> mode
              </p>
            </div>
            
            <button 
              onClick={refreshLedger}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', borderRadius: '0.75rem', border: '1px solid rgba(51, 65, 85, 0.8)', background: 'rgba(30, 41, 59, 0.6)', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#cbd5e1', cursor: 'pointer' }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              <span>Force Refresh</span>
            </button>
          </div>

          {processedExpenses.length === 0 ? (
            <div style={{ padding: '3rem 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Shield style={{ width: '2rem', height: '2rem', color: '#475569' }} />
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace', margin: 0 }}>
                {matrixMode === 'strict' 
                  ? 'No fully approved and audited transactions found in Strict mode.' 
                  : 'No transactions found in database for this organization.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {processedExpenses.map((item) => {
                const isApproved = item.approval_status === 'approved';
                const isRejected = item.approval_status === 'rejected';

                return (
                  <div 
                    key={item.id} 
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '1rem', border: '1px solid rgba(30, 41, 59, 0.8)', background: 'rgba(2, 6, 23, 0.6)', boxSizing: 'border-box' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxWidth: '550px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>{item.vendor || 'Unknown Vendor'}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.raw_transcript || 'No transcript text available'}</span>
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#475569' }}>ID: {item.id}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        <span style={{ fontSize: '1rem', fontFamily: 'monospace', fontWeight: 900, color: '#818cf8' }}>
                          ₹{item.amount?.toLocaleString('en-IN') ?? 0}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', padding: '0.125rem 0.625rem', borderRadius: '9999px', border: '1px solid', background: isApproved ? 'rgba(6, 78, 59, 0.6)' : isRejected ? 'rgba(136, 19, 55, 0.6)' : 'rgba(120, 53, 15, 0.6)', color: isApproved ? '#34d399' : isRejected ? '#fca5a5' : '#fbbf24', borderColor: isApproved ? 'rgba(16, 185, 129, 0.4)' : isRejected ? 'rgba(244, 63, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)' }}>
                          {isApproved && <CheckCircle2 style={{ width: '12px', height: '12px' }} />}
                          {isRejected && <XCircle style={{ width: '12px', height: '12px' }} />}
                          {!isApproved && !isRejected && <Clock style={{ width: '12px', height: '12px' }} />}
                          {item.approval_status || 'pending'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid rgba(30, 41, 59, 0.8)', paddingLeft: '1rem' }}>
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
                          style={{ padding: '0.375rem 0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', borderRadius: '0.75rem', cursor: 'pointer' }}
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
                          style={{ padding: '0.375rem 0.75rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', borderRadius: '0.75rem', cursor: 'pointer' }}
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