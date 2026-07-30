'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';

export default function LandingPage() {
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'system-ui, sans-serif', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box', textAlign: 'center', transition: 'background-color 0.2s ease, color 0.2s ease' }}>
      
      {/* Top Navigation */}
      <nav style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1.125rem 1.5rem', borderRadius: '1.5rem', backdropFilter: 'blur(16px)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(79, 70, 229, 0.2)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '0.75rem', color: '#818cf8', fontWeight: 'bold' }}>
              🛡️
            </div>
            <span style={{ fontSize: '1.125rem', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--text-primary)', fontFamily: 'monospace' }}>LedgerArc</span>
          </div>

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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', width: '100%' }}>
          <Link href="/login" style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Log In
          </Link>
          <Link href="/signup" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#4f46e5', borderRadius: '0.75rem', fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#ffffff', textDecoration: 'none', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}>
            Get Started →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem 0', gap: '1.75rem' }}>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.5rem 1.125rem', borderRadius: '9999px', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ✨ Secure Multi-Tenant Enterprise Ledger
        </div>

        <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.15, color: 'var(--text-primary)', margin: 0, textAlign: 'center' }}>
          Automated Compliance & <span style={{ color: '#818cf8' }}>Intelligent Ledger</span> Auditing
        </h1>

        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '600px', fontFamily: 'monospace', lineHeight: 1.6, margin: '0 auto', textAlign: 'center' }}>
          Isolate organization workspaces, enforce strict ceiling controls, compile GSTR-1 data effortlessly, and manage real-time expense approvals.
        </p>

        {/* Action CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginTop: '0.5rem' }}>
          <Link href="/signup" style={{ width: '100%', padding: '1.125rem 1.5rem', background: '#4f46e5', borderRadius: '1rem', fontSize: '0.9375rem', fontWeight: 'bold', color: '#ffffff', textDecoration: 'none', boxShadow: '0 20px 25px -5px rgba(79, 70, 229, 0.4)', textAlign: 'center', boxSizing: 'border-box' }}>
            Initialize Organization Workspace →
          </Link>
          <Link href="/login" style={{ width: '100%', padding: '1.125rem 1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1rem', fontSize: '0.9375rem', fontWeight: 'bold', color: 'var(--text-primary)', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}>
            Access Portal Gateway
          </Link>
        </div>

        {/* Feature Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', width: '100%', marginTop: '2.5rem', textAlign: 'left' }}>
          
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1.5rem', padding: '1.5rem', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxSizing: 'border-box' }}>
            <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '0.75rem', color: '#818cf8' }}>
              🏢
            </div>
            <h3 style={{ fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-primary)', margin: 0 }}>Isolated Workspaces</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>Secure multi-tenant data partitioning ensuring strict corporate security boundaries.</p>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1.5rem', padding: '1.5rem', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxSizing: 'border-box' }}>
            <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.75rem', color: '#34d399' }}>
              ✓
            </div>
            <h3 style={{ fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-primary)', margin: 0 }}>Live Compliance Matrix</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>Instant anomaly detection for temporal violations and ceiling breaches.</p>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '1.5rem', padding: '1.5rem', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxSizing: 'border-box' }}>
            <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '0.75rem', color: '#a78bfa' }}>
              📄
            </div>
            <h3 style={{ fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-primary)', margin: 0 }}>GSTR-1 Compilation</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>Seamless accountant-ready CSV exports and automated receipt parsing pipelines.</p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'monospace', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        LedgerArc Enterprise Financial Protocol &copy; {new Date().getFullYear()} • Secure Gateway
      </footer>

    </div>
  );
}