'use client';
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import HireModal from './HireModal';

export default function EscrowDashboard() {
  const { jobs, userProfile, releaseTranche, submitTranche } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [deliverableLinks, setDeliverableLinks] = useState<{ [key: string]: string }>({});

  const role = userProfile?.role;
  const isClient = role === 'Client';

  const statusStyles: Record<string, string> = {
    Funded: 'border-blue-200 bg-blue-50 text-blue-700',
    Submitted: 'border-amber-200 bg-amber-50 text-amber-700',
    Released: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Disputed: 'border-red-200 bg-red-50 text-red-700',
    Pending: 'border-slate-200 bg-slate-100 text-slate-600',
  };

  const normalizeStatus = (status: string) => {
    if (status === 'Submitted') return 'Submitted for Review';
    if (status === 'Funded') return 'Funded in Vault';
    if (status === 'Released') return 'Released';
    if (status === 'Disputed') return 'Disputed';
    return 'Pending';
  };

  const handleDeliverableChange = (trancheId: string, val: string) => {
    setDeliverableLinks(prev => ({ ...prev, [trancheId]: val }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {isClient ? 'Active Jobs' : 'Active Gigs'}
        </h2>
        {isClient && (
          <button
            onClick={() => setShowModal(true)}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            + New Job
          </button>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
          No active {isClient ? 'jobs' : 'gigs'}.
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[2.1fr_1.3fr_1.2fr] border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 md:grid">
            <span>Project</span>
            <span>Freelancer</span>
            <span>Milestones</span>
          </div>

          {jobs.map(job => {
            const hasSubmitted = job.tranches.some(tranche => tranche.status === 'Submitted');
            const hasFunded = job.tranches.some(tranche => tranche.status === 'Funded');
            const statusSummary = hasSubmitted
              ? 'Submitted for Review'
              : hasFunded
                ? 'Funded in Vault'
                : 'In Progress';

            return (
              <div key={job.id} className="border-b border-slate-200 px-4 py-5 last:border-b-0 md:px-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                        <div className="mt-1 flex items-center gap-3 text-xs font-medium text-slate-500">
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>${job.totalAmount.toLocaleString()} total</span>
                        </div>
                      </div>
                      <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[hasSubmitted ? 'Submitted' : hasFunded ? 'Funded' : 'Pending']}`}>
                        {statusSummary}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 xl:justify-end">
                    <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                      <img src={job.freelancerAvatar || 'https://i.pravatar.cc/150'} alt={job.freelancerName || 'Freelancer'} className="h-9 w-9 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{job.freelancerName || 'Freelancer'}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{job.freelancerAddress.slice(0, 6)}...{job.freelancerAddress.slice(-4)}</span>
                          <a
                            href={`https://etherscan.io/address/${job.freelancerAddress.replace(/[^a-zA-Z0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 transition hover:text-slate-700"
                            aria-label="View wallet on Etherscan"
                          >
                            ↗
                          </a>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                      aria-label="Chat with freelancer"
                    >
                      💬
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_0.9fr]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Milestone Progress</p>
                      <span className="text-xs font-medium text-slate-500">{job.tranches.filter(t => t.status === 'Released').length}/{job.tranches.length} complete</span>
                    </div>

                    <div className="space-y-3">
                      {job.tranches.map((tranche, idx) => (
                        <div key={tranche.id} className="flex items-start gap-3">
                          <div className="flex flex-col items-center pt-1">
                            <span className={`h-3.5 w-3.5 rounded-full border-2 ${
                              tranche.status === 'Released'
                                ? 'border-emerald-500 bg-emerald-500'
                                : tranche.status === 'Submitted'
                                  ? 'border-amber-400 bg-amber-400'
                                  : tranche.status === 'Disputed'
                                    ? 'border-red-500 bg-red-500'
                                    : tranche.status === 'Funded'
                                      ? 'border-blue-500 bg-blue-500'
                                      : 'border-slate-300 bg-slate-100'
                            }`} />
                            {idx < job.tranches.length - 1 && <span className="my-1 h-8 w-px bg-slate-200" />}
                          </div>

                          <div className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-800">Milestone {idx + 1}</p>
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusStyles[tranche.status] || 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                                {normalizeStatus(tranche.status)}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{tranche.requirements}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Escrow</span>
                      <span className="font-semibold text-slate-900">${job.totalAmount.toLocaleString()}</span>
                    </div>

                    {hasSubmitted && (
                      <button
                        type="button"
                        onClick={() => {
                          const submittedTranche = job.tranches.find(t => t.status === 'Submitted');
                          if (submittedTranche) releaseTranche(job.id, submittedTranche.id);
                        }}
                        className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Review Work & Approve Release
                      </button>
                    )}

                    {!hasSubmitted && hasFunded && (
                      <>
                        <button
                          type="button"
                          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          View Agreement Clauses
                        </button>
                        <button
                          type="button"
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          Request Refund
                        </button>
                      </>
                    )}

                    {!hasSubmitted && !hasFunded && (
                      <button
                        type="button"
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500 opacity-80"
                        disabled
                      >
                        Awaiting milestone update
                      </button>
                    )}

                    {isClient && hasSubmitted && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                        <p className="font-semibold text-slate-700">Deliverable link</p>
                        <a
                          href={job.tranches.find(t => t.status === 'Submitted')?.deliverableLink || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block truncate text-blue-600 hover:underline"
                        >
                          {job.tranches.find(t => t.status === 'Submitted')?.deliverableLink || 'No link provided'}
                        </a>
                      </div>
                    )}

                    {!isClient && job.tranches.some(tranche => tranche.status === 'Funded') && (
                      <div className="space-y-2">
                        {job.tranches.filter(tranche => tranche.status === 'Funded').map(tranche => (
                          <div key={tranche.id} className="space-y-2">
                            <input
                              type="text"
                              value={deliverableLinks[tranche.id] || ''}
                              onChange={(e) => handleDeliverableChange(tranche.id, e.target.value)}
                              placeholder="Paste deliverable link..."
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => submitTranche(job.id, tranche.id, deliverableLinks[tranche.id] || '')}
                              disabled={!deliverableLinks[tranche.id]}
                              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Submit Work
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <HireModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
