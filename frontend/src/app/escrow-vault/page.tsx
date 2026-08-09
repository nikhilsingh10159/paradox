'use client';

import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import TopUpModal from '@/components/client/TopUpModal';
import { useState } from 'react';

export default function EscrowVaultPage() {
  const { platformBalance, lockedInEscrow, topUpBalance } = useAppContext();
  const [topUpOpen, setTopUpOpen] = useState(false);

  // Simulated yield earned via Aave V3 Liquidity Pool (5.2% APY)
  const yieldEarned = Math.round(lockedInEscrow * 0.052);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <header className="mb-10 rounded-[28px] border border-slate-200 bg-white p-8 card-shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 mb-3">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                AAVE V3 YIELD INTEGRATION ACTIVE
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Escrow Vault & Yield Management</h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Monitor platform balances, locked escrow smart contracts, and real-time yield distribution.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setTopUpOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.99]"
            >
              <span>+ Top Up Vault Balance</span>
            </button>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 card-shadow-hover">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Available Balance</p>
              <span className="text-xl">💰</span>
            </div>
            <p className="mt-4 text-4xl font-extrabold text-slate-900">${platformBalance.toLocaleString()}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Platform Coins / USDC Equivalent</p>
            <div className="mt-6 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setTopUpOpen(true)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Deposit USDC
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-blue-200 bg-blue-50/70 p-6 card-shadow-hover">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Locked in Escrow</p>
              <span className="text-xl">🔐</span>
            </div>
            <p className="mt-4 text-4xl font-extrabold text-blue-900">${lockedInEscrow.toLocaleString()}</p>
            <p className="mt-1 text-xs font-semibold text-blue-700">Held in YieldEscrow.sol Smart Contract</p>
            <div className="mt-6 border-t border-blue-200/60 pt-4">
              <Link
                href="/client"
                className="block w-full rounded-xl bg-blue-600 py-2.5 text-center text-xs font-bold text-white transition hover:bg-blue-700"
              >
                View Active Contracts →
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-purple-200 bg-purple-50/70 p-6 card-shadow-hover">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-700">Accrued Aave Yield</p>
              <span className="text-xl">📈</span>
            </div>
            <p className="mt-4 text-4xl font-extrabold text-purple-900">+${yieldEarned.toLocaleString()}</p>
            <p className="mt-1 text-xs font-semibold text-purple-700">Est. 5.2% APY auto-distributed on completion</p>
            <div className="mt-6 border-t border-purple-200/60 pt-4 flex items-center justify-between text-xs font-bold text-purple-800">
              <span>Smart Pool Status</span>
              <span className="text-emerald-700">● Active</span>
            </div>
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
