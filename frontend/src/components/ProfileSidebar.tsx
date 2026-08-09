'use client';
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import ReputationBadge from '@/components/ReputationBadge';

export default function ProfileSidebar() {
  const { userAddress, userProfile, totalEarnings, jobs } = useAppContext();

  const truncateAddress = (addr: string | null) => {
    if (!addr) return "Not Connected";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const role = userProfile?.role;
  
  // Stats calculations
  const activeJobs = jobs.filter(j => j.tranches.some(t => t.status !== 'Released')).length;
  
  let uniqueFreelancers = 0;
  let totalSpent = 0;
  if (role === 'Client') {
    const freelancers = new Set(jobs.map(j => j.freelancerAddress));
    uniqueFreelancers = freelancers.size;
    totalSpent = jobs.reduce((acc, job) => acc + job.tranches.filter(t => t.status === 'Released').reduce((sum, t) => sum + t.amount, 0), 0);
  }

  return (
    <div className="bg-white rounded-[28px] border border-gray-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="h-24 bg-[#F5F5F7]"></div>
      <div className="px-6 pb-6">
        <div className="relative -mt-12 mb-4">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden mx-auto shadow-sm relative">
            <img 
              src={userProfile?.avatar || 'https://via.placeholder.com/150'} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
            {userProfile?.handle ? `@${userProfile.handle}` : truncateAddress(userAddress)}
          </h2>
          {role === 'Client' && (
            <span className="inline-block mt-2 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Client</span>
          )}
          {role === 'Freelancer' && userProfile?.reputation && (
            <div className="mt-3 flex justify-center">
              <ReputationBadge 
                trustTier={userProfile.reputation.trustTier} 
                completionRate={userProfile.reputation.completionRate} 
                totalJobs={userProfile.reputation.totalJobs} 
                compact 
              />
            </div>
          )}
        </div>

        {userProfile?.bio && (
          <p className="text-sm text-gray-600 text-center mb-6 px-2 italic">
            &quot;{userProfile.bio}&quot;
          </p>
        )}
        
        {userProfile?.skills && userProfile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mb-6">
            {userProfile.skills.map(skill => (
              <span key={skill} className="px-2 py-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="border-t border-gray-100 pt-6 space-y-4">
          {role === 'Client' ? (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Total Spent</span>
                <span className="text-[#0066CC] font-semibold">${totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Active Jobs</span>
                <span className="text-gray-900 font-semibold">{activeJobs}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Freelancers Hired</span>
                <span className="text-gray-900 font-semibold">{uniqueFreelancers}</span>
              </div>
            </>
          ) : role === 'Freelancer' ? (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Total Earned</span>
                <span className="text-[#0066CC] font-semibold">${totalEarnings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Active Gigs</span>
                <span className="text-gray-900 font-semibold">{activeJobs}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Completion Rate</span>
                <span className="text-gray-900 font-semibold">{userProfile?.reputation?.completionRate || 0}%</span>
              </div>
            </>
          ) : null}
        </div>
        
        <div className="mt-8">
          {role === 'Client' ? (
            <button className="w-full py-3 bg-black hover:bg-gray-800 text-white text-sm font-semibold rounded-2xl transition-colors tracking-tight">
              Post New Job
            </button>
          ) : (
            <button className="w-full py-3 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-sm font-semibold rounded-2xl text-gray-900 transition-colors tracking-tight">
              Browse Jobs
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
