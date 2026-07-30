'use client';

import React from 'react';

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = 'Processing workspace request...' }: LoadingOverlayProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(2, 6, 23, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      zIndex: 9999,
      color: 'var(--text-primary, #f8fafc)',
      transition: 'background-color 0.2s ease, color 0.2s ease',
    }}>
      <div style={{
        width: '3rem',
        height: '3rem',
        border: '3px solid rgba(99, 102, 241, 0.2)',
        borderTopColor: '#6366f1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <span style={{ fontSize: '0.9375rem', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '0.05em', color: '#a5b4fc' }}>
        {message}
      </span>
    </div>
  );
}