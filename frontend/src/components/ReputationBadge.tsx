'use client';

import React from 'react';

interface ReputationBadgeProps {
  trustTier: number; // 1-5
  completionRate: number;
  totalJobs: number;
  compact?: boolean;
}

export default function ReputationBadge({ trustTier, completionRate, totalJobs, compact = false }: ReputationBadgeProps) {
  const getTierInfo = (tier: number) => {
    switch (tier) {
      case 1: return { name: 'Bronze', colorClass: 'tier-bronze', icon: '🛡️' };
      case 2: return { name: 'Silver', colorClass: 'tier-silver', icon: '🛡️' };
      case 3: return { name: 'Gold', colorClass: 'tier-gold', icon: '🌟' };
      case 4: return { name: 'Platinum', colorClass: 'tier-platinum', icon: '💎' };
      case 5: return { name: 'Diamond', colorClass: 'tier-diamond', icon: '👑' };
      default: return { name: 'Unranked', colorClass: 'bg-gray-400', icon: '🔰' };
    }
  };

  const { name, colorClass, icon } = getTierInfo(trustTier);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-gray-200 dark:border-gray-700 shadow-sm text-sm font-medium">
        <span>{icon}</span>
        <span className={`px-2 py-0.5 rounded-full text-white text-xs ${colorClass}`}>{name}</span>
        <span className="text-gray-400 mx-1">•</span>
        <span className="text-gray-600 dark:text-gray-300">{completionRate}%</span>
      </div>
    );
  }

  return (
    <div className="glass rounded-[20px] p-5 w-64 animate-badge-glow flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={`px-4 py-1.5 rounded-full text-white font-bold flex items-center gap-2 ${colorClass} shadow-lg`}>
          <span>{icon}</span>
          <span>{name}</span>
        </div>
        <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {completionRate}%
        </div>
      </div>
      
      <div className="flex justify-between items-end text-sm text-gray-500 dark:text-gray-400 mt-2">
        <div className="flex-1 mr-4">
          <p className="uppercase text-[10px] tracking-wider mb-1">Completion Rate</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div className={`h-1.5 rounded-full ${colorClass}`} style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-700 dark:text-gray-200">{totalJobs}</p>
          <p className="text-[10px] uppercase tracking-wider">Jobs</p>
        </div>
      </div>
    </div>
  );
}
