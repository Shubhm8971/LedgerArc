'use client';

import React, { useState } from 'react';
import { getSupabaseBrowserClient } from '@/utils/supabase-client';
import { toast } from 'sonner';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

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
        .update({ 
          is_audited: nextStatus, 
          audited_at: nextStatus ? new Date().toISOString() : null 
        })
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
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        isAudited
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-emerald-500/5'
          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Updating...</span>
        </>
      ) : isAudited ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Audited</span>
        </>
      ) : (
        <>
          <Circle className="w-3.5 h-3.5 text-slate-400" />
          <span>Unaudited</span>
        </>
      )}
    </button>
  );
}