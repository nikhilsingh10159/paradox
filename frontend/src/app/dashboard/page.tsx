'use client';
import EscrowDashboard from '../../components/EscrowDashboard';
import { useAppContext } from '@/context/AppContext';

export default function DashboardHome() {
  const { userProfile, jobs } = useAppContext();
  const handle = userProfile?.handle || 'Operator';

  const activeEscrowValue = jobs
    .filter(job => job.tranches.some(tranche => tranche.status !== 'Released'))
    .reduce((sum, job) => sum + job.totalAmount, 0);

  const pendingReviewsCount = jobs.reduce(
    (sum, job) => sum + job.tranches.filter(tranche => tranche.status === 'Submitted').length,
    0,
  );

  const completedProjectsCount = jobs.filter(job =>
    job.tranches.every(tranche => tranche.status === 'Released' || tranche.status === 'Pending'),
  ).length;

  return (
    <>
      <header className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Client Dashboard</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Welcome back, @{handle}</h1>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Platform Status</p>
            <p className="mt-1 text-sm font-semibold text-emerald-600">All escrow contracts healthy</p>
          </div>
        </div>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Total Active Escrow</p>
          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">${activeEscrowValue.toLocaleString()}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Pending Reviews</p>
          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{pendingReviewsCount}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Completed Projects</p>
          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{completedProjectsCount}</p>
        </div>
      </section>

      <EscrowDashboard />
    </>
  );
}
