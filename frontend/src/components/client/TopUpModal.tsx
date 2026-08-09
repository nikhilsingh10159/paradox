'use client';

import { useState } from 'react';
import { useBlockchainAction } from '@/hooks/useBlockchainAction';

interface TopUpModalProps {
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

const PRESETS = [500, 1000, 2500, 5000];

export default function TopUpModal({ onClose, onConfirm }: TopUpModalProps) {
  const [amount, setAmount] = useState('1000');
  const { execute, isLoading } = useBlockchainAction();

  const parsedAmount = Number(amount);

  const handleTopUp = () => {
    if (!parsedAmount || parsedAmount <= 0) return;
    execute('top-up', 'Top Up Coins', () => onConfirm(parsedAmount));
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-label="Close modal" />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900">Top Up Platform Coins</h2>
        <p className="mt-2 text-sm text-slate-500">
          Deposit USDC or purchase Platform Coins to fund escrow vaults.
        </p>

        <div className="mt-6">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Amount (Coins)</label>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(String(preset))}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
            >
              {preset.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleTopUp}
            disabled={!parsedAmount || parsedAmount <= 0 || isLoading('top-up')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading('top-up') && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            Confirm Deposit
          </button>
        </div>
      </div>
    </div>
  );
}
