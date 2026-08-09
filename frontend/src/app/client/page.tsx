'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAppContext, Job, Tranche } from '@/context/AppContext';
import { useBlockchainAction } from '@/hooks/useBlockchainAction';
import TopUpModal from '@/components/client/TopUpModal';
import ReviewDrawer from '@/components/client/ReviewDrawer';
import ScopeModal from '@/components/client/ScopeModal';
import MilestoneStepper from '@/components/client/MilestoneStepper';

function isPastDeadline(deadline?: string) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

function getExplorerUrl(address: string) {
  const cleaned = address.replace(/[^a-zA-Z0-9]/g, '');
  return `https://etherscan.io/address/${cleaned}`;
}

export default function ClientWorkspacePage() {
  const {
    userAddress,
    userProfile,
    jobs,
    platformBalance,
    lockedInEscrow,
    topUpBalance,
    releaseTranche,
    requestRevision,
    requestRefund,
  } = useAppContext();

  const { execute, isLoading } = useBlockchainAction();

  const [topUpOpen, setTopUpOpen] = useState(false);
  const [scopeJob, setScopeJob] = useState<Job | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ job: Job; tranche: Tranche } | null>(null);

  const clientJobs = useMemo(() => {
    if (!userAddress) return [];
    const matched = jobs.filter(
      (job) => job.clientAddress.toLowerCase() === userAddress.toLowerCase(),
    );
    return matched.length > 0 ? matched : jobs;
  }, [jobs, userAddress]);

  const activeJobs = clientJobs.filter((job) =>
    job.tranches.some((t) => t.status !== 'Released' && t.status !== 'Pending'),
  );
  const pastJobs = clientJobs.filter((job) =>
    job.tranches.every((t) => t.status === 'Released' || t.status === 'Pending'),
  );

  const handleRefund = (jobId: string, trancheId: string) => {
    execute(`refund-${trancheId}`, 'Request Refund', () => requestRefund(jobId, trancheId));
  };

  const displayHandle = userProfile.handle ? `@${userProfile.handle}` : null;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Client Workspace</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Welcome back{displayHandle ? `, ${displayHandle}` : ''}
        </h1>
        <p className="mt-2 text-slate-500">Manage escrow vaults, review deliverables, and track active projects.</p>
      </header>

      {/* Feature A: Financial & Escrow Overview */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Balance</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {platformBalance.toLocaleString()} <span className="text-lg font-semibold text-slate-500">Coins</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">Platform Coin / USDC equivalent</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Locked in Escrow</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {lockedInEscrow.toLocaleString()} <span className="text-lg font-semibold text-blue-400">Coins</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">Across {activeJobs.length} active project{activeJobs.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTopUpOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + Top Up Coins
          </button>
        </div>
      </section>

      {/* Feature B: Active Projects & Milestone Pipeline */}
      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Active Projects</h2>
          <Link href="/find-talent" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Find Talent →
          </Link>
        </div>

        {activeJobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
            No active projects. Post a job to get started.
          </div>
        ) : (
          <div className="space-y-6">
            {activeJobs.map((job) => {
              const submittedTranche = job.tranches.find((t) => t.status === 'Submitted');
              const fundedTranches = job.tranches.filter((t) => t.status === 'Funded');
              const disputedTranche = job.tranches.find((t) => t.status === 'Disputed');

              return (
                <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {job.totalAmount.toLocaleString()} Coins total · Posted{' '}
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <img
                        src={job.freelancerAvatar || 'https://i.pravatar.cc/150'}
                        alt={job.freelancerName || 'Freelancer'}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {job.freelancerName || 'Unassigned'}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {job.freelancerHandle && (
                            <span className="text-xs font-medium text-blue-600">@{job.freelancerHandle}</span>
                          )}
                          <a
                            href={getExplorerUrl(job.freelancerAddress)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-slate-500 transition hover:text-blue-600"
                          >
                            {job.freelancerAddress.slice(0, 6)}...{job.freelancerAddress.slice(-4)} ↗
                          </a>
                        </div>
                        {job.freelancerSkills && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {job.freelancerSkills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Milestone Pipeline</p>
                        <span className="text-xs font-medium text-slate-500">
                          {job.tranches.filter((t) => t.status === 'Released').length}/{job.tranches.length} released
                        </span>
                      </div>
                      <MilestoneStepper tranches={job.tranches} />
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Feature C: Review Submission */}
                      {submittedTranche && (
                        <button
                          type="button"
                          onClick={() => setReviewTarget({ job, tranche: submittedTranche })}
                          className="rounded-xl bg-amber-500 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
                        >
                          Review Submission
                        </button>
                      )}

                      {/* Feature D: Scope & Dispute */}
                      <button
                        type="button"
                        onClick={() => setScopeJob(job)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        View Scope
                      </button>

                      {fundedTranches.map((tranche) => (
                        <button
                          key={tranche.id}
                          type="button"
                          onClick={() => handleRefund(job.id, tranche.id)}
                          disabled={isLoading(`refund-${tranche.id}`)}
                          className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          {isLoading(`refund-${tranche.id}`) && (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-700" />
                          )}
                          Request Refund
                          {isPastDeadline(tranche.deadline) && (
                            <span className="text-xs font-normal">(deadline passed)</span>
                          )}
                        </button>
                      ))}

                      {disputedTranche && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                          Milestone in dispute — arbitration flow initiated.
                        </div>
                      )}

                      <Link
                        href="/messages"
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Message Freelancer
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {pastJobs.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-5 text-xl font-bold text-slate-900">Past Projects</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pastJobs.map((job) => (
              <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-slate-900">{job.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {job.freelancerName} · {job.totalAmount.toLocaleString()} Coins
                </p>
                <p className="mt-2 text-xs font-semibold text-emerald-600">All milestones complete</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {topUpOpen && (
        <TopUpModal
          onClose={() => setTopUpOpen(false)}
          onConfirm={(amount) => {
            topUpBalance(amount);
            setTopUpOpen(false);
          }}
        />
      )}

      {scopeJob && <ScopeModal job={scopeJob} onClose={() => setScopeJob(null)} />}

      {reviewTarget && (
        <ReviewDrawer
          job={reviewTarget.job}
          tranche={reviewTarget.tranche}
          onClose={() => setReviewTarget(null)}
          onApprove={() => releaseTranche(reviewTarget.job.id, reviewTarget.tranche.id)}
          onRequestRevision={(feedback) =>
            requestRevision(reviewTarget.job.id, reviewTarget.tranche.id, feedback)
          }
        />
      )}
    </main>
  );
}
