import React from 'react';

export default function ReputationCard() {
  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 rounded-xl shadow-2xl text-white border border-gray-800 mt-8">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
            T1
          </div>
          <div>
            <h3 className="text-xl font-bold">Soulbound Reputation</h3>
            <p className="text-gray-400">Tier 1 Elite Freelancer</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Trust Score</p>
          <p className="text-3xl font-bold text-green-400">98/100</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-800 rounded-lg text-center">
          <p className="text-gray-400 text-sm mb-1">Delivery Speed</p>
          <p className="text-xl font-semibold">95%</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg text-center">
          <p className="text-gray-400 text-sm mb-1">Dispute Win Rate</p>
          <p className="text-xl font-semibold">100%</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg text-center">
          <p className="text-gray-400 text-sm mb-1">Anti-Ghosting</p>
          <p className="text-xl font-semibold text-green-400">Flawless</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg text-center">
          <p className="text-gray-400 text-sm mb-1">Completion Rate</p>
          <p className="text-xl font-semibold">99%</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          AI Dispute Analysis
        </h4>
        <div className="h-4 bg-gray-800 rounded-full overflow-hidden flex mb-2">
          <div className="h-full bg-green-500" style={{ width: '70%' }}></div>
          <div className="h-full bg-red-500" style={{ width: '30%' }}></div>
        </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>70% Freelancer Payout</span>
          <span>30% Client Refund</span>
        </div>
        <p className="text-sm text-gray-300 mt-4 italic border-l-2 border-purple-500 pl-3">
          &quot;The freelancer delivered the core requirements, but failed on mobile responsiveness. Client refund is justified. Scope Creep: Clean.&quot;
        </p>
      </div>
    </div>
  );
}
