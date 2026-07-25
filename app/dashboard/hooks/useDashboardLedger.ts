import { useState, useEffect, useCallback, useMemo } from 'react';
import { getSupabaseBrowserClient } from '@/utils/supabase-client';

export interface ExpenseLog {
  id: string;
  created_at?: string;
  vendor: string;
  amount: number;
  gstin?: string;
  approval_status?: string;
  is_audited?: boolean;
  igst?: number;
  cgst?: number;
  sgst?: number;
  raw_transcript?: string;
  matrixMode?: 'inclusive' | 'strict';
}

export const useDashboardLedger = (currentOrgId: string | null) => {
  const [expenses, setExpenses] = useState<ExpenseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowserClient();

  const fetchLedger = useCallback(async () => {
    if (!currentOrgId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('expense_logs')
      .select('*')
      .eq('org_id', currentOrgId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setExpenses(data);
    }
    setLoading(false);
  }, [currentOrgId, supabase]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  return { expenses, loading, refreshLedger: fetchLedger };
};

export const useLedgerRealtime = (currentOrgId: string | null, onUpdate: () => void) => {
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!currentOrgId) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expense_logs',
          filter: `org_id=eq.${currentOrgId}`,
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentOrgId, onUpdate, supabase]);
};

export const useProcessedExpensesForMatrix = (expenses: ExpenseLog[], matrixMode: 'inclusive' | 'strict') => {
  return useMemo(() => {
    if (matrixMode === 'strict') {
      return expenses.filter(item => item.is_audited === true);
    }
    return expenses;
  }, [expenses, matrixMode]);
};