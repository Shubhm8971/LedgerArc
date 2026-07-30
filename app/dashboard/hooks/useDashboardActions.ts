import { useCallback } from 'react';
import { toast } from 'sonner';
import { ExpenseLog } from './useDashboardLedger';
import { getSupabaseBrowserClient } from '@/utils/supabase-client';

export const useDashboardActions = (
  expenses: ExpenseLog[],
  currentOrgId: string | null,
  currentUserId: string | null,
  matrixMode: 'inclusive' | 'strict',
  onSuccess?: () => void
) => {
  const supabase = getSupabaseBrowserClient();

  const exportToCSVForAccountant = useCallback(() => {
    if (!expenses || expenses.length === 0) {
      toast.error("Export Blocked", { description: "Cannot download an empty ledger without any entries." });
      return;
    }

    const headers = [
      'Record ID', 'Created At Date', 'Vendor', 'Amount (INR)',
      'GSTIN', 'Status', 'Audit Status', 'IGST', 'CGST', 'SGST', 'Memo'
    ];
    const csvRows = expenses.map(item => [
      item.id,
      item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN') : 'N/A',
      `"${item.vendor?.replace(/"/g, '""')}"`,
      item.amount,
      item.gstin || 'N/A',
      item.approval_status || 'PENDING',
      item.is_audited ? 'AUDITED' : 'UNAUDITED',
      item.igst || 0,
      item.cgst || 0,
      item.sgst || 0,
      `"${item.raw_transcript?.replace(/"/g, '""')}"`
    ].join(','));

    const blob = new Blob(
      [[headers.join(','), ...csvRows].join('\n')],
      { type: 'text/csv;charset=utf-8;' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tax_Ledger_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV Export Successful");
  }, [expenses]);

  const handlePdfUpload = useCallback(async (file: File) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.access_token || !session?.user?.id) {
      toast.error("Authentication Error", { description: "Active user session not found. Please sign in again." });
      return;
    }

    // Fallback or fetch org ID directly from user_profiles if currentOrgId is missing
    let targetOrgId = currentOrgId;
    if (!targetOrgId || targetOrgId === '00000000-0000-0000-0000-000000000000') {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('org_id')
        .eq('id', session.user.id)
        .maybeSingle();
      
      targetOrgId = profile?.org_id;
    }

    if (!targetOrgId || targetOrgId === '00000000-0000-0000-0000-000000000000') {
      toast.error("Configuration Error", { description: "Organization profile not linked to user." });
      return;
    }

    try {
      const fileDataBuffer = await file.arrayBuffer();
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/pdf',
          'Authorization': `Bearer ${session.access_token}`,
          'X-Org-Id': targetOrgId,
        },
        body: fileDataBuffer,
      });

      const report = await response.json();
      if (response.ok && report.success) {
        toast.success("Document Parsed", { description: `Imported records from ${report.data?.[0]?.vendor || 'document'}` });
        onSuccess?.();
      } else {
        toast.error("Extraction Failed", { description: report.error || 'Server error' });
      }
    } catch (err: any) {
      toast.error("Network Error", { description: "Could not reach extraction service." });
    }
  }, [currentOrgId, onSuccess, supabase]);

  const handleGSTR1Export = useCallback(async () => {
    if (!currentOrgId || currentOrgId === '00000000-0000-0000-0000-000000000000') {
      toast.error("Configuration Error");
      return;
    }

    if (!expenses || expenses.length === 0) {
      toast.error("Export Blocked", { description: "Cannot compile GSTR-1 without any ledger entries." });
      return;
    }

    try {
      const res = await fetch(`/api/org/export-gstr1?orgId=${currentOrgId}&year=2026&month=05`);
      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      const blob = new Blob([JSON.stringify(result.payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GSTR1_Export_${currentOrgId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("GSTR-1 Compiled");
    } catch (err: any) {
      toast.error("Export Failed", { description: err.message });
    }
  }, [currentOrgId, expenses]);

  return {
    exportToCSVForAccountant,
    handlePdfUpload,
    handleGSTR1Export,
  };
};