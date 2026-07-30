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
import MenuSidebar from '@/components/MenuSidebar';

import { useLedgerRealtime } from './hooks/useDashboardLedger';
import { useDashboardActions } from './hooks/useDashboardActions';
import { Shield, RefreshCw, Building2, UserCheck, CheckCircle2, Clock, XCircle, AlertCircle, Sun, Moon, Menu, Trash2, ArrowUpDown, Search } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<ExpenseLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<WorkspaceRole>('member');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const [matrixMode, setMatrixMode] = useState<'inclusive' | 'strict'>('inclusive');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [auditModalOpen, setAuditModalOpen] = useState<boolean>(false);
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, feature: '' });
  const [activeAuditTarget, setActiveAuditTarget] = useState<ExpenseLog | null>(null);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('ledgerarc_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('ledgerarc_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const supabase = useMemo(() => {
    try {
      return getSupabaseBrowserClient();
    } catch (err) {
      console.error('[Dashboard] Supabase client init failed:', err);
      return null;
    }
  }, []);

  const processedExpenses = useMemo(() => {
    let list = expenses;

    // Filter by Matrix Mode
    if (matrixMode === 'strict') {
      list = expenses.filter(
        (item) => item.approval_status === 'approved' && item.is_audited === true
      );
    }

    // Filter by Search Query (vendor or transcript)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          (item.vendor && item.vendor.toLowerCase().includes(query)) ||
          (item.raw_transcript && item.raw_transcript.toLowerCase().includes(query))
      );
    }

    // Apply sorting logic
    return [...list].sort((a, b) => {
      if (sortBy === 'amount-desc') {
        return (b.amount ?? 0) - (a.amount ?? 0);
      }
      if (sortBy === 'amount-asc') {
        return (a.amount ?? 0) - (b.amount ?? 0);
      }
      if (sortBy === 'date-asc') {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateA - dateB;
      }
      // Default: date-desc
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [expenses, matrixMode, searchQuery, sortBy]);

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

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
        <div style={{ width: '1.5rem', height: '1.5rem', border: '2px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span>Authenticating Workspace Session...</span>
      </div>
    );
  }

  if (profileError) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: '#f43f5e', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
        <AlertCircle style={{ width: '2rem', height: '2rem', color: '#f43f5e' }} />
        <span>{profileError}</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '2rem 1rem', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', transition: 'background-color 0.2s ease, color 0.2s ease' }}>
      
      {/* Menu Sidebar Component */}
      <MenuSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSignOut={handleSignOut}
      />

      {/* Background ambient glow effects */}
      <div style={{ position: 'absolute', top: 0, left: '25%', width: '500px', height: '500px', background: 'rgba(79, 70, 229, 0.05)', filter: 'blur(150px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '2.5rem', right: '2.5rem', width: '400px', height: '400px', background: 'rgba(139, 92, 246, 0.05)', filter: 'blur(130px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', zIndex: 10, width: '100%' }}>
        
        {/* Header Navigation */}
        <header style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderRadius: '1.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '1.5rem', backdropFilter: 'blur(16px)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '3rem',
                height: '3rem',
                borderRadius: '1rem',
                background: theme === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(226, 232, 240, 0.8)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="Open Navigation Menu"
            >
              <Menu style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>

            <div style={{ display: 'flex', height: '3rem', width: '3rem', alignItems: 'center', justifyContent: 'center', borderRadius: '1rem', background: 'rgba(79, 70, 229, 0.2)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)' }}>
              <Shield style={{ width: '1.5rem', height: '1.5rem' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--text-primary)', margin: 0 }}>LedgerArc Command</h1>
                <span style={{ borderRadius: '9999px', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.2rem 0.75rem', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a5b4fc' }}>
                  Secure Portal
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '0.25rem', fontFamily: 'monospace', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Building2 style={{ width: '14px', height: '14px', color: '#818cf8' }} /> Org: <span style={{ color: 'var(--text-primary)' }}>{currentOrgId || 'Workspace'}</span></span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', textTransform: 'uppercase' }}><UserCheck style={{ width: '14px', height: '14px', color: '#34d399' }} /> Tier: <span style={{ color: 'var(--text-primary)' }}>{userRole}</span></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
            <DashboardActionBar
              userRole={userRole}
              matrixMode={matrixMode}
              setMatrixMode={setMatrixMode}
              onGSTR1Export={() => attemptAction('policy:modify', 'GSTR-1 Compilation', handleGSTR1Export)}
              onExportCSV={exportToCSVForAccountant}
              onSignOut={handleSignOut}
              onPdfUpload={(e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                  handlePdfUpload(file);
                }
              }}
            />

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '0.75rem',
                background: theme === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(226, 232, 240, 0.8)',
                border: '1px solid var(--border-color)',
                color: theme === 'dark' ? '#fbbf24' : '#4f46e5',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun style={{ width: '18px', height: '18px' }} /> : <Moon style={{ width: '18px', height: '18px' }} />}
            </button>
          </div>
        </header>

        {/* Analytics Summary */}
        <DashboardAnalytics data={processedExpenses} />

        {/* Master Ledger Section */}
        <section style={{ width: '100%', borderRadius: '1.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '1.5rem', backdropFilter: 'blur(16px)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a5b4fc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Master Ledger View
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontFamily: 'monospace' }}>
                Showing {processedExpenses.length} records in <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#818cf8' }}>{matrixMode}</span> mode
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Search Bar Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: theme === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(226, 232, 240, 0.8)' }}>
                <Search style={{ width: '14px', height: '14px', color: '#818cf8' }} />
                <input
                  type="text"
                  placeholder="Search vendor or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '12px', fontFamily: 'monospace', outline: 'none', width: '200px' }}
                />
              </div>

              {/* Sort Selector Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: theme === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(226, 232, 240, 0.8)' }}>
                <ArrowUpDown style={{ width: '14px', height: '14px', color: '#818cf8' }} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="date-desc" style={{ background: 'var(--bg-primary)' }}>Newest Date First</option>
                  <option value="date-asc" style={{ background: 'var(--bg-primary)' }}>Oldest Date First</option>
                  <option value="amount-desc" style={{ background: 'var(--bg-primary)' }}>Highest Value First</option>
                  <option value="amount-asc" style={{ background: 'var(--bg-primary)' }}>Lowest Value First</option>
                </select>
              </div>
            
              <button 
                onClick={refreshLedger}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: theme === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(226, 232, 240, 0.8)', fontSize: '0.8125rem', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                <RefreshCw style={{ width: '16px', height: '16px' }} />
                <span>Force Refresh</span>
              </button>
            </div>
          </div>

          {processedExpenses.length === 0 ? (
            <div style={{ padding: '3rem 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Shield style={{ width: '2rem', height: '2rem', color: '#475569' }} />
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace', margin: 0 }}>
                {searchQuery.trim()
                  ? `No transactions found matching "${searchQuery}".`
                  : matrixMode === 'strict' 
                    ? 'No fully approved and audited transactions found in Strict mode.' 
                    : 'No transactions found in database for this organization.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {processedExpenses.map((item) => {
                const isApproved = item.approval_status === 'approved';
                const isRejected = item.approval_status === 'rejected';

                return (
                  <div 
                    key={item.id} 
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1.125rem 1.375rem', borderRadius: '1rem', border: '1px solid var(--border-color)', background: theme === 'dark' ? 'rgba(2, 6, 23, 0.6)' : 'rgba(241, 245, 249, 0.8)', boxSizing: 'border-box' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxWidth: '550px' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.vendor || 'Unknown Vendor'}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.raw_transcript || 'No transcript text available'}</span>
                      <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>ID: {item.id}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        <span style={{ fontSize: '1.0625rem', fontFamily: 'monospace', fontWeight: 900, color: '#818cf8' }}>
                          ₹{item.amount?.toLocaleString('en-IN') ?? 0}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase', padding: '0.2rem 0.75rem', borderRadius: '9999px', border: '1px solid', background: isApproved ? 'rgba(6, 78, 59, 0.6)' : isRejected ? 'rgba(136, 19, 55, 0.6)' : 'rgba(120, 53, 15, 0.6)', color: isApproved ? '#34d399' : isRejected ? '#fca5a5' : '#fbbf24', borderColor: isApproved ? 'rgba(16, 185, 129, 0.4)' : isRejected ? 'rgba(244, 63, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)' }}>
                          {isApproved && <CheckCircle2 style={{ width: '13px', height: '13px' }} />}
                          {isRejected && <XCircle style={{ width: '13px', height: '13px' }} />}
                          {!isApproved && !isRejected && <Clock style={{ width: '13px', height: '13px' }} />}
                          {item.approval_status || 'pending'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.125rem' }}>
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
                          style={{ padding: '0.5rem 0.875rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.8125rem', fontFamily: 'monospace', fontWeight: 'bold', borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                        >
                          <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                          <span>Approve</span>
                        </button>

                        <button
                          onClick={async () => {
                            const { error } = await supabase
                              ?.from('expense_logs')
                              .delete()
                              .eq('id', item.id);
                            
                            if (error) toast.error('Failed to remove transaction');
                            else {
                              toast.success('Transaction removed');
                              refreshLedger();
                            }
                          }}
                          style={{ padding: '0.5rem 0.875rem', background: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(225, 29, 72, 0.3)', color: '#fca5a5', fontSize: '0.8125rem', fontFamily: 'monospace', fontWeight: 'bold', borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                          title="Remove transaction"
                        >
                          <Trash2 style={{ width: '14px', height: '14px' }} />
                          <span>Remove</span>
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