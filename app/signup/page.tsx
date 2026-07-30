'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

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

  // Live slug preview generator
  const orgSlug = orgName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgName, email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || 'Signup failed.');
        setLoading(false);
        return;
      }

      toast.success('Workspace created successfully! Redirecting...');
      router.replace('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error('Signup failed', { description: err?.message || 'Network request failed.' });
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden', boxSizing: 'border-box', transition: 'background-color 0.2s ease, color 0.2s ease' }}>
      
      {/* Theme Toggle Button in Top Right */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 20 }}>
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

      {/* Background ambient glow effects */}
      <div style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: 'rgba(79, 70, 229, 0.1)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '2.5rem', right: '2.5rem', width: '320px', height: '320px', background: 'rgba(139, 92, 246, 0.1)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1.5rem', padding: '2rem', backdropFilter: 'blur(20px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 10, boxSizing: 'border-box' }}>
        
        {/* Header Branding */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontFamily: 'monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            <ShieldCheck style={{ width: '16px', height: '16px', color: '#818cf8' }} />
            Secure Enterprise Gateway
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--text-primary)', margin: 0 }}>Create LedgerArc</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Initialize your isolated organizational workspace.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Workspace Name Input with Live Slug Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 'bold' }}>
              <Building2 style={{ width: '14px', height: '14px', color: '#818cf8' }} /> Workspace Name
            </label>
            <input
              type="text"
              name="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Acme Corp"
              required
              style={{ width: '100%', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '0.875rem 1rem', fontSize: '0.9375rem', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
            />
            {orgName.trim() && (
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(165, 180, 252, 0.8)', paddingLeft: '0.25rem', paddingTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                URL Slug: <span style={{ color: '#818cf8', fontWeight: 600 }}>{orgSlug || '...'}</span>
              </span>
            )}
          </div>

          {/* Email Address Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 'bold' }}>
              <Mail style={{ width: '14px', height: '14px', color: '#818cf8' }} /> Admin Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@company.com"
              required
              style={{ width: '100%', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '0.875rem 1rem', fontSize: '0.9375rem', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Password Input with Visibility Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 'bold' }}>
              <Lock style={{ width: '14px', height: '14px', color: '#818cf8' }} /> Secure Password
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                required
                style={{ width: '100%', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '0.875rem 2.5rem 0.875rem 1rem', fontSize: '0.9375rem', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: '0.75rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '0.75rem', background: '#4f46e5', padding: '0.875rem 1rem', fontSize: '0.9375rem', fontWeight: 'bold', color: '#ffffff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)', transition: 'background 0.2s' }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255, 255, 255, 0.2)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span>Initializing Workspace...</span>
              </div>
            ) : (
              <>
                <span>Launch Workspace</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </>
            )}
          </button>
        </form>

        {/* Footer Login Link */}
        <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
          Already managing an organization?{' '}
          <Link href="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
            Log in to portal
          </Link>
        </div>

      </div>
    </div>
  );
}