'use client';

import React from 'react';

export default function LedgerSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {[1, 2, 3].map((item) => (
        <div 
          key={item} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '1.125rem 1.375rem', 
            borderRadius: '1rem', 
            border: '1px solid var(--border-color)', 
            background: 'var(--bg-card)', 
            boxSizing: 'border-box',
            opacity: 0.7,
            animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '45%' }}>
            <div style={{ height: '16px', width: '65%', backgroundColor: 'rgba(148, 163, 184, 0.25)', borderRadius: '4px' }} />
            <div style={{ height: '12px', width: '85%', backgroundColor: 'rgba(148, 163, 184, 0.15)', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ height: '18px', width: '80px', backgroundColor: 'rgba(148, 163, 184, 0.25)', borderRadius: '4px' }} />
            <div style={{ height: '32px', width: '90px', backgroundColor: 'rgba(148, 163, 184, 0.2)', borderRadius: '0.75rem' }} />
          </div>
        </div>
      ))}
    </div>
  );
}