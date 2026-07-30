'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Settings, ShieldCheck, LogOut, X } from 'lucide-react';

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

export default function MenuSidebar({ isOpen, onClose, onSignOut }: MenuSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Command Center', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tax Ledger', href: '/dashboard', icon: FileText },
    { name: 'Workspace Settings', href: '/dashboard', icon: Settings },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar Panel */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: isOpen ? 0 : '-280px',
        width: '280px',
        height: '100vh',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border-color)',
        backdropFilter: 'blur(20px)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem',
        boxSizing: 'border-box',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '10px 0 30px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Top Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(79, 70, 229, 0.2)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '0.75rem', color: '#818cf8' }}>
                <ShieldCheck style={{ width: '20px', height: '20px' }} />
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 900, fontFamily: 'monospace', color: 'var(--text-primary)' }}>LedgerArc</span>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.375rem' }}
              title="Close Menu"
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    padding: '0.875rem 1.125rem',
                    borderRadius: '0.75rem',
                    background: isActive ? 'rgba(79, 70, 229, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                    color: isActive ? '#818cf8' : 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    fontWeight: isActive ? 'bold' : 500,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon style={{ width: '18px', height: '18px' }} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Sign Out */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={() => {
              onClose();
              onSignOut();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.875rem 1.125rem',
              borderRadius: '0.75rem',
              background: 'rgba(225, 29, 72, 0.1)',
              border: '1px solid rgba(225, 29, 72, 0.3)',
              color: '#fca5a5',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxSizing: 'border-box',
              transition: 'background 0.2s',
            }}
          >
            <LogOut style={{ width: '18px', height: '18px' }} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}