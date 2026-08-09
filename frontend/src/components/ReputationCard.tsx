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
    switch(tier) {
      case 5: return 'from-purple-500 to-pink-500 animate-badge-glow shadow-purple-500/50';
      case 4: return 'from-blue-400 to-blue-600 shadow-blue-500/50';
      case 3: return 'from-yellow-400 to-yellow-600 shadow-yellow-500/50';
      case 2: return 'from-gray-300 to-gray-500 shadow-gray-400/50';
      default: return 'from-amber-600 to-amber-800 shadow-amber-700/50';
    }
  };

  const getTierName = (tier: number) => {
    switch(tier) {
      case 5: return 'Diamond';
      case 4: return 'Platinum';
      case 3: return 'Gold';
      case 2: return 'Silver';
      default: return 'Bronze';
    }
  };

  const getRingColor = (value: number) => {
    if (value > 80) return 'stroke-green-400';
    if (value >= 50) return 'stroke-yellow-400';
    return 'stroke-red-400';
  };

  const calculateOffset = (percentage: number) => {
    return 283 - (283 * percentage) / 100;
  };

  const metrics = [
    { label: 'Delivery Speed', value: reputation.deliverySpeed },
    { label: 'Dispute Win Rate', value: reputation.disputeWinRate },
    { label: 'Anti-Ghosting', value: reputation.antiGhostingRating },
    { label: 'Completion Rate', value: reputation.completionRate }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 rounded-xl shadow-2xl text-white border border-gray-800 mt-8 backdrop-blur-md bg-opacity-90">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${getTierClass(reputation.trustTier)} flex items-center justify-center text-2xl font-bold shadow-lg`}>
            T{reputation.trustTier}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white/90">Soulbound Reputation</h3>
            <p className="text-gray-400">Tier {reputation.trustTier} {getTierName(reputation.trustTier)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Trust Score</p>
          <p className="text-3xl font-bold text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">{reputation.completionRate}/100</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex flex-col items-center justify-center relative">
            <div className="relative w-[90px] h-[90px] mb-3">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="stroke-gray-700" strokeWidth="8" fill="none" />
                <circle 
                  cx="50" cy="50" r="45" 
                  className={`${getRingColor(metric.value)} animate-progress-fill transition-all duration-1000 ease-out`} 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray="283" 
                  strokeDashoffset={calculateOffset(metric.value)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{metric.value}%</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm font-medium text-center">{metric.label}</p>
          </div>
        ))}
      </div>

      {aiAnalysis && !aiAnalysis.loading && (
        <div className="mt-8 p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-50"></div>
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-white/90">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span>
            Recent Dispute Analysis (AI)
          </h4>
          <div className="h-3 bg-gray-800/80 rounded-full overflow-hidden flex mb-3 shadow-inner">
            <div className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" style={{ width: `${aiAnalysis.freelancer_payout_percentage}%` }}></div>
            <div className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]" style={{ width: `${aiAnalysis.client_refund_percentage}%` }}></div>
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-400">
            <span>{aiAnalysis.freelancer_payout_percentage}% Freelancer Payout</span>
            <span>{aiAnalysis.client_refund_percentage}% Client Refund</span>
          </div>
          <p className="text-sm text-gray-300 mt-4 italic border-l-2 border-purple-500 pl-4 py-1">
            &quot;{aiAnalysis.dispute_reasoning}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
