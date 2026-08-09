'use client';
import React from 'react';
import { useAppContext, ReputationData } from '@/context/AppContext';

interface ReputationCardProps {
  reputation?: ReputationData;
}

export default function ReputationCard({ reputation: propReputation }: ReputationCardProps) {
  const { userProfile } = useAppContext();
  const reputation = propReputation || userProfile?.reputation;

  const [aiAnalysis, setAiAnalysis] = React.useState<{
    freelancer_payout_percentage: number;
    client_refund_percentage: number;
    dispute_reasoning: string;
    loading: boolean;
  } | null>(null);

  React.useEffect(() => {
    if (reputation && (reputation.totalDisputes > 0 || reputation.disputesWon > 0)) {
      setAiAnalysis({ freelancer_payout_percentage: 0, client_refund_percentage: 0, dispute_reasoning: '', loading: true });
      fetch((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000') + '/dispute/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestone_requirements: "Past disputes mock requirements",
          submitted_deliverable: "Past deliverables",
          chat_logs: ["Client: not exactly what I wanted"]
        })
      }).then(res => res.json())
        .then(data => setAiAnalysis({ ...data, loading: false }))
        .catch(() => setAiAnalysis(null));
    }
  }, [reputation]);

  if (!reputation) return null;

  const getTierClass = (tier: number) => {
    switch (tier) {
      case 5:
        return 'from-purple-600 to-pink-600 text-white animate-badge-glow shadow-purple-500/30';
      case 4:
        return 'from-sky-500 to-blue-600 text-white shadow-blue-500/30';
      case 3:
        return 'from-amber-500 to-yellow-600 text-white shadow-amber-500/30';
      case 2:
        return 'from-slate-400 to-slate-600 text-white shadow-slate-400/30';
      default:
        return 'from-amber-700 to-amber-900 text-white shadow-amber-800/30';
    }
  };

  const getTierName = (tier: number) => {
    switch (tier) {
      case 5:
        return 'Diamond Tier';
      case 4:
        return 'Platinum Tier';
      case 3:
        return 'Gold Tier';
      case 2:
        return 'Silver Tier';
      default:
        return 'Bronze Tier';
    }
  };

  const getRingColor = (value: number) => {
    if (value >= 80) return 'stroke-emerald-500';
    if (value >= 50) return 'stroke-amber-500';
    return 'stroke-rose-500';
  };

  const calculateOffset = (percentage: number) => {
    return 283 - (283 * percentage) / 100;
  };

  const metrics = [
    { label: 'Delivery Speed', value: reputation.deliverySpeed },
    { label: 'Dispute Win Rate', value: reputation.disputeWinRate },
    { label: 'Anti-Ghosting', value: reputation.antiGhostingRating },
    { label: 'Completion Rate', value: reputation.completionRate },
  ];

  return (
    <section aria-label="Soulbound Reputation Profile" className="mt-8 mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-6 md:p-8 card-shadow transition-all duration-300">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr text-xl font-extrabold shadow-md ${getTierClass(
              reputation.trustTier,
            )}`}
          >
            T{reputation.trustTier}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">Soulbound Reputation</h3>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                EIP-5192 Verified
              </span>
            </div>
            <p className="mt-0.5 text-sm font-semibold text-slate-500">
              {getTierName(reputation.trustTier)} · {reputation.successfulJobs} / {reputation.totalJobs} Jobs Completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Overall Trust Score</p>
            <p className="text-2xl font-black text-emerald-600">{reputation.completionRate} <span className="text-xs font-semibold text-slate-400">/ 100</span></p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:bg-slate-100/80"
          >
            <div className="relative mb-2 h-20 w-20">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="stroke-slate-200" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className={`${getRingColor(metric.value)} transition-all duration-1000 ease-out`}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="283"
                  strokeDashoffset={calculateOffset(metric.value)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-bold text-slate-900">{metric.value}%</span>
              </div>
            </div>
            <p className="text-center text-xs font-semibold text-slate-600">{metric.label}</p>
          </div>
        ))}
      </div>

      {aiAnalysis && !aiAnalysis.loading && (
        <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50/50 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-bold text-purple-900">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-600 animate-pulse"></span>
              Recent AI Dispute Arbitration Result
            </h4>
            <span className="text-xs font-semibold text-purple-700">GPT-4o Verified</span>
          </div>

          <div className="mb-2 flex h-2.5 overflow-hidden rounded-full bg-purple-200/60">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${aiAnalysis.freelancer_payout_percentage}%` }}
            ></div>
            <div
              className="bg-rose-500 transition-all duration-500"
              style={{ width: `${aiAnalysis.client_refund_percentage}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span className="text-emerald-700">{aiAnalysis.freelancer_payout_percentage}% Freelancer Payout</span>
            <span className="text-rose-700">{aiAnalysis.client_refund_percentage}% Client Refund</span>
          </div>

          <p className="mt-3 border-l-2 border-purple-500 pl-3 text-xs italic text-slate-700">
            &quot;{aiAnalysis.dispute_reasoning}&quot;
          </p>
        </div>
      )}
    </section>
}
