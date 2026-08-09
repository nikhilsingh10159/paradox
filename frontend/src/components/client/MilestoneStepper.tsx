'use client';

import { Tranche } from '@/context/AppContext';

const STATUS_LABELS: Record<string, string> = {
  Funded: 'Funded in Vault',
  Submitted: 'Submitted for Review',
  Released: 'Released',
  Disputed: 'In Dispute',
  Pending: 'Pending Funding',
};

const STATUS_STYLES: Record<string, string> = {
  Funded: 'border-blue-200 bg-blue-50 text-blue-700',
  Submitted: 'border-amber-200 bg-amber-50 text-amber-700',
  Released: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Disputed: 'border-red-200 bg-red-50 text-red-700',
  Pending: 'border-slate-200 bg-slate-100 text-slate-600',
};

const DOT_STYLES: Record<string, string> = {
  Funded: 'border-blue-500 bg-blue-500',
  Submitted: 'border-amber-400 bg-amber-400',
  Released: 'border-emerald-500 bg-emerald-500',
  Disputed: 'border-red-500 bg-red-500',
  Pending: 'border-slate-300 bg-slate-100',
};

interface MilestoneStepperProps {
  tranches: Tranche[];
}

export default function MilestoneStepper({ tranches }: MilestoneStepperProps) {
  return (
    <div className="space-y-3">
      {tranches.map((tranche, index) => (
        <div key={tranche.id} className="flex items-start gap-3">
          <div className="flex flex-col items-center pt-1">
            <span className={`h-3.5 w-3.5 rounded-full border-2 ${DOT_STYLES[tranche.status] || DOT_STYLES.Pending}`} />
            {index < tranches.length - 1 && <span className="my-1 h-8 w-px bg-slate-200" />}
          </div>

          <div className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">Milestone {index + 1}</p>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[tranche.status] || STATUS_STYLES.Pending}`}>
                {STATUS_LABELS[tranche.status] || tranche.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{tranche.requirements}</p>
            <p className="mt-1 text-xs font-semibold text-slate-700">{tranche.amount.toLocaleString()} Coins</p>
          </div>
        </div>
      ))}
    </div>
  );
}
