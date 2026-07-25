'use client';

import React, { useState } from 'react';
import { getSupabaseBrowserClient } from '@/utils/supabase-client';
import { toast } from 'sonner';

interface AuditToggleProps {
  expenseId: string;
  isAudited: boolean;
  onToggle: (expenseId: string, newStatus: boolean) => void;
}

export default function AuditToggle({ expenseId, isAudited, onToggle }: AuditToggleProps) {
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseBrowserClient();

  const handleToggleClick = async () => {
    const nextStatus = !isAudited;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('expense_logs')
        .update({ is_audited: nextStatus, audited_at: nextStatus ? new Date().toISOString() : null })
        .eq('id', expenseId);

      if (error) throw error;

      toast.success(nextStatus ? 'Marked as Audited' : 'Marked as Unaudited');
      onToggle(expenseId, nextStatus);
    } catch (err: any) {
      toast.error('Failed to update audit status', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleToggleClick}
      className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all border ${
        isAudited
          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
      }`}
    >
      {loading ? 'Updating...' : isAudited ? '✓ Audited' : '○ Unaudited'}
    </button>
  );
}