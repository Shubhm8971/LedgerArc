'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/utils/supabase-client';
import { toast } from 'sonner';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Welcome back! Redirecting to dashboard...');
      router.replace('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error('Login failed', { description: err.message || 'Invalid credentials.' });
    } finally {
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
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--text-primary)', margin: 0 }}>Welcome Back</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Sign in to access your organization ledger.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Email Address Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 'bold' }}>
              <Mail style={{ width: '14px', height: '14px', color: '#818cf8' }} /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={{ width: '100%', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '0.875rem 1rem', fontSize: '0.9375rem', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Password Input with Visibility Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 'bold' }}>
                <Lock style={{ width: '14px', height: '14px', color: '#818cf8' }} /> Password
              </label>
            </div>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                <span>Authenticating...</span>
              </div>
            ) : (
              <>
                <span>Access Portal</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </>
            )}
          </button>
        </form>

        {/* Footer Signup Link */}
        <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
          Need a workspace for your organization?{' '}
          <Link href="/signup" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
            Create account
          </Link>
        </div>

      </div>
    </div>
  );
}