'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Mail, UserPlus, X } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/utils/supabase-client';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
}

export default function InviteModal({ isOpen, onClose, orgId }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'accountant' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseBrowserClient();

  if (!isOpen) return null;

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter an email address.');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Authentication session expired.');
        return;
      }

      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          'X-Org-Id': orgId,
        },
        body: JSON.stringify({ email, role }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to send invitation.');
      }

      toast.success(`Invitation sent successfully to ${email}`);
      setEmail('');
      onClose();
    } catch (err: any) {
      toast.error('Invitation failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1.5rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', boxSizing: 'border-box' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase', fontWeight: 'bold' }}>
            <UserPlus style={{ width: '16px', height: '16px' }} />
            Workspace Onboarding
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Invite Team Member</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontFamily: 'monospace' }}>Grant secure access to your organization ledger.</p>
        </div>

        <form onSubmit={handleSendInvitation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Mail style={{ width: '14px', height: '14px', color: '#818cf8' }} /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              required
              style={{ width: '100%', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '0.75rem 1rem', fontSize: '12px', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
              Assign Role Tier
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              style={{ width: '100%', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '0.75rem 1rem', fontSize: '12px', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', fontFamily: 'monospace' }}
            >
              <option value="member">Member (Standard Access)</option>
              <option value="accountant">Accountant (Tax Ledger & CSV Exports)</option>
              <option value="admin">Admin (Full Workspace Control)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: '0.5rem', width: '100%', padding: '0.75rem 1rem', background: '#4f46e5', borderRadius: '0.75rem', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold', color: '#ffffff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'background 0.2s' }}
          >
            {loading ? 'Sending Secure Invitation...' : 'Send Invitation Email'}
          </button>
        </form>

      </div>
    </div>
  );
}