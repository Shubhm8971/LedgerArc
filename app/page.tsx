'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center px-5 py-10">
      <div className="max-w-xl w-full text-center flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-indigo-300 tracking-tight">LedgerArc</h1>
          <p className="text-sm text-slate-400">
            Enterprise Corporate Expense Compliance & Automated Ledger Auditing Workspace
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col gap-4 text-left shadow-lg">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">Workspace Access</div>
          <p className="text-sm text-slate-300">
            Manage corporate ledgers, audit policy infractions, compile GSTR-1 tax payloads, and authorize expense queues in real-time.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono transition flex items-center justify-center gap-2"
            >
              🚀 Open Dashboard Workspace
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}