'use client';

import { Job } from '@/context/AppContext';

interface ScopeModalProps {
  job: Job;
  onClose: () => void;
}

export default function ScopeModal({ job, onClose }: ScopeModalProps) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-label="Close modal" />
      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Agreement Clauses</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">{job.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{job.description}</p>

        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Required Skills</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.requiredSkills.map((skill) => (
                <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Milestone Deliverables</p>
          {job.tranches.map((tranche, index) => (
            <div key={tranche.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">Milestone {index + 1}</p>
                <span className="text-sm font-bold text-slate-700">{tranche.amount.toLocaleString()} Coins</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{tranche.requirements}</p>
              {tranche.deadline && (
                <p className="mt-2 text-xs text-slate-500">
                  Deadline: {new Date(tranche.deadline).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}
