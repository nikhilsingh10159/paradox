'use client';
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useBlockchainAction } from '@/hooks/useBlockchainAction';
import { parseUnits } from 'ethers';

interface HireModalProps {
  onClose: () => void;
}

export default function HireModal({ onClose }: HireModalProps) {
  const { createJob } = useAppContext();
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [tranches, setTranches] = useState<{ amount: number | ''; requirements: string }[]>([
    { amount: '', requirements: '' },
  ]);

  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  // ESC Key listener for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'processing') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, status]);

  // Derived total — computed at component scope so JSX can access it
  const totalAmount = tranches.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const handleAddMilestone = () => {
    setTranches([...tranches, { amount: '', requirements: '' }]);
  };

  const handleRemoveMilestone = (index: number) => {
    setTranches(tranches.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: 'amount' | 'requirements', value: string | number) => {
    const updated = [...tranches];
    if (field === 'amount') {
      updated[index].amount = value === '' ? '' : Number(value);
    } else {
      updated[index].requirements = value as string;
    }
    setTranches(updated);
  };

  const { execute } = useBlockchainAction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address || tranches.some((t) => !t.amount || !t.requirements)) return;

    setStatus('processing');

    const amounts = tranches.map((t) => parseUnits(t.amount.toString(), 6));
    const reqs = tranches.map((t) => t.requirements);

    await execute(
      'createJob',
      'Create Job',
      async () => {
        // Local state update
        createJob({
          title: title.trim(),
          description: 'New job created on-chain',
          requiredSkills: [],
          freelancerAddress: address,
          tranches: tranches.map((t) => ({ amount: Number(t.amount), requirements: t.requirements })),
        });
        setStatus('success');
        setTimeout(() => onClose(), 1800);
      },
      async (contract) => {
        // Real contract call
        return await contract.createJob(address, amounts, reqs);
      },
    );

    if (status === 'processing') {
      setStatus('idle'); // If it failed, reset
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hire-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md transition-all"
    >
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-slate-200/80 bg-white p-6 md:p-8 shadow-2xl transition-all">
        <button
          type="button"
          onClick={onClose}
          disabled={status === 'processing'}
          aria-label="Close dialog"
          className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50"
        >
          ✕
        </button>

        <h3 id="hire-modal-title" className="text-2xl font-bold tracking-tight text-slate-900 mb-6">
          Create New Escrow Job
        </h3>

        {status === 'success' ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-slate-900 mb-2">Job Created & Funds Locked!</h4>
            <p className="font-medium text-slate-500">Your escrow agreement is deployed onto the contract vault.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Project Title
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={status === 'processing'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                placeholder="e.g. DeFi Staking Contract Audit"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Freelancer Wallet Address
              </label>
              <input
                required
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={status === 'processing'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                placeholder="0x..."
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Milestones / Tranches
                </label>
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="text-xs font-bold text-blue-600 transition hover:text-blue-700"
                >
                  + Add Milestone
                </button>
              </div>

              {tranches.map((tranche, index) => (
                <div key={index} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Milestone {index + 1}
                    </h4>
                    {tranches.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(index)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Amount (USDC)</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={tranche.amount}
                      onChange={(e) => handleChange(index, 'amount', e.target.value)}
                      disabled={status === 'processing'}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Requirements</label>
                    <textarea
                      required
                      value={tranche.requirements}
                      onChange={(e) => handleChange(index, 'requirements', e.target.value)}
                      disabled={status === 'processing'}
                      className="h-20 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Describe testable acceptance criteria..."
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm font-semibold text-slate-600">Total Escrow Amount</span>
              <span className="text-2xl font-black text-slate-900">${totalAmount.toLocaleString()} USDC</span>
            </div>

            <button
              type="submit"
              disabled={status === 'processing'}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === 'processing' && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              )}
              {status === 'processing' ? 'Deploying Escrow...' : 'Create Job & Lock Funds'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
