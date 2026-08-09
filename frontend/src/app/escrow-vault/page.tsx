'use client';

import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import TopUpModal from '@/components/client/TopUpModal';
import { useState } from 'react';

export default function EscrowVaultPage() {
  const { platformBalance, lockedInEscrow, topUpBalance } = useAppContext();
  const [topUpOpen, setTopUpOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Escrow Vault</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Fund Management</h1>
          <p className="mt-2 text-slate-500">Monitor platform coin balance and locked escrow across all contracts.</p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Balance</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">{platformBalance.toLocaleString()}</p>
            <p className="mt-1 text-sm text-slate-500">Platform Coins / USDC</p>
            <button
              type="button"
              onClick={() => setTopUpOpen(true)}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Top Up Coins
            </button>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Locked in Escrow</p>
            <p className="mt-3 text-4xl font-bold text-blue-700">{lockedInEscrow.toLocaleString()}</p>
            <p className="mt-1 text-sm text-blue-600">Held in smart contract vaults</p>
            <Link
              href="/client"
              className="mt-5 inline-block rounded-xl border border-blue-300 bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              View Active Projects →
            </Link>
          </div>
        </section>

        {topUpOpen && (
          <TopUpModal
            onClose={() => setTopUpOpen(false)}
            onConfirm={(amount) => {
              topUpBalance(amount);
              setTopUpOpen(false);
            }}
          />
        )}
      </main>
    </div>
  );
}
