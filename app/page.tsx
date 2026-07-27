'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
      
      {/* Top Navigation */}
      <nav style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'between', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(30, 41, 59, 0.8)', padding: '1rem 1.5rem', borderRadius: '1.5rem', backdropFilter: 'blur(16px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(79, 70, 229, 0.2)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '0.75rem', color: '#818cf8', fontWeight: 'bold' }}>
            🛡️
          </div>
          <span style={{ fontSize: '1.125rem', fontWeight: 900, letterSpacing: '-0.025em', color: '#ffffff', fontFamily: 'monospace' }}>LedgerArc</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/login" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#cbd5e1', textDecoration: 'none' }}>
            Log In
          </Link>
          <Link href="/signup" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#4f46e5', borderRadius: '0.75rem', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#ffffff', textDecoration: 'none', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}>
            Get Started →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '4rem 0', gap: '2rem' }}>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.375rem 1rem', borderRadius: '9999px', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ✨ Secure Multi-Tenant Enterprise Ledger
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.1, color: '#ffffff', margin: 0 }}>
          Automated Compliance & <span style={{ color: '#818cf8' }}>Intelligent Ledger</span> Auditing
        </h1>

        <p style={{ fontSize: '1rem', color: '#94a3b8', maxWidth: '600px', fontFamily: 'monospace', lineHeight: 1.6, margin: 0 }}>
          Isolate organization workspaces, enforce strict ceiling controls, compile GSTR-1 data effortlessly, and manage real-time expense approvals.
        </p>

        {/* Action CTAs */}
        <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Link href="/signup" style={{ padding: '1rem 2rem', background: '#4f46e5', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 'bold', color: '#ffffff', textDecoration: 'none', boxShadow: '0 20px 25px -5px rgba(79, 70, 229, 0.4)' }}>
            Initialize Organization Workspace →
          </Link>
          <Link href="/login" style={{ padding: '1rem 2rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 'bold', color: '#e2e8f0', textDecoration: 'none' }}>
            Access Portal Gateway
          </Link>
        </div>

        {/* Feature Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', width: '100%', marginTop: '3rem', textAlign: 'left' }}>
          
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(30, 41, 59, 0.8)', borderRadius: '1.5rem', padding: '1.5rem', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '0.75rem', color: '#818cf8' }}>
              🏢
            </div>
            <h3 style={{ fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: 'bold', textTransform: 'uppercase', color: '#ffffff', margin: 0 }}>Isolated Workspaces</h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>Secure multi-tenant data partitioning ensuring strict corporate security boundaries.</p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(30, 41, 59, 0.8)', borderRadius: '1.5rem', padding: '1.5rem', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.75rem', color: '#34d399' }}>
              ✓
            </div>
            <h3 style={{ fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: 'bold', textTransform: 'uppercase', color: '#ffffff', margin: 0 }}>Live Compliance Matrix</h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>Instant anomaly detection for temporal violations and ceiling breaches.</p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(30, 41, 59, 0.8)', borderRadius: '1.5rem', padding: '1.5rem', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '0.75rem', color: '#a78bfa' }}>
              📄
            </div>
            <h3 style={{ fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: 'bold', textTransform: 'uppercase', color: '#ffffff', margin: 0 }}>GSTR-1 Compilation</h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>Seamless accountant-ready CSV exports and automated receipt parsing pipelines.</p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', paddingTop: '2rem', borderTop: '1px solid rgba(15, 23, 42, 1)' }}>
        LedgerArc Enterprise Financial Protocol &copy; {new Date().getFullYear()} • Secure Gateway
      </footer>

    </div>
  );
}