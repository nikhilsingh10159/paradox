'use client';

import { Job, Tranche } from '@/context/AppContext';
import { useBlockchainAction } from '@/hooks/useBlockchainAction';
import { useState } from 'react';

interface ReviewDrawerProps {
  job: Job;
  tranche: Tranche;
  onClose: () => void;
  onApprove: () => void;
  onRequestRevision: (feedback: string) => void;
}

export default function ReviewDrawer({ job, tranche, onClose, onApprove, onRequestRevision }: ReviewDrawerProps) {
  const { execute, isLoading } = useBlockchainAction();
  const [feedback, setFeedback] = useState('');
  const [showRevision, setShowRevision] = useState(false);

  const handleApprove = () => {
    execute(`release-${tranche.id}`, 'Approve & Release Coins', () => {
      onApprove();
      onClose();
    });
  };

  const handleRevision = () => {
    if (!feedback.trim()) return;
    execute(`revision-${tranche.id}`, 'Request Revision', () => {
      onRequestRevision(feedback.trim());
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-label="Close drawer" />
      <aside className="relative flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Deliverable Review</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{job.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{tranche.requirements}</p>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Deliverable Link</p>
            {tranche.deliverableLink ? (
              <a
                href={tranche.deliverableLink}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block break-all text-sm font-medium text-blue-600 hover:underline"
              >
                {tranche.deliverableLink}
              </a>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No deliverable link provided.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Freelancer Notes</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {tranche.submissionNotes || 'No submission notes included.'}
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              {tranche.amount.toLocaleString()} Coins locked until your approval
            </p>
          </div>

          {showRevision && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Revision Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                placeholder="Describe what needs to change before release..."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-slate-200 px-6 py-5">
          {!showRevision ? (
            <>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isLoading(`release-${tranche.id}`)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading(`release-${tranche.id}`) && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                Approve & Release Coins
              </button>
              <button
                type="button"
                onClick={() => setShowRevision(true)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Request Revision
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRevision}
                disabled={!feedback.trim() || isLoading(`revision-${tranche.id}`)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {isLoading(`revision-${tranche.id}`) && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                Send Revision Request
              </button>
              <button type="button" onClick={() => setShowRevision(false)} className="w-full text-sm font-medium text-slate-500 hover:text-slate-900">
                Back
              </button>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
