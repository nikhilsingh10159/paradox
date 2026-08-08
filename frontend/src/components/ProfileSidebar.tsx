'use client';
import React from 'react';
import { useAppContext } from '@/context/AppContext';

export default function ProfileSidebar() {
  const { userAddress, userProfile, totalEarnings } = useAppContext();

  const truncateAddress = (addr: string | null) => {
    if (!addr) return "Not Connected";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="bg-white rounded-[28px] border border-gray-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="h-24 bg-[#F5F5F7]"></div>
      <div className="px-6 pb-6">
        <div className="relative -mt-12 mb-4">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden mx-auto shadow-sm relative">
            <img 
              src={userProfile.avatar} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
            {userProfile.handle ? `@${userProfile.handle}` : truncateAddress(userAddress)}
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {userProfile.role || 'New User'}
          </p>
        </div>

        {userProfile.bio && (
          <p className="text-sm text-gray-600 text-center mb-6 px-2 italic">
            "{userProfile.bio}"
          </p>
        )}
        
        {userProfile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mb-6">
            {userProfile.skills.map(skill => (
              <span key={skill} className="px-2 py-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="border-t border-gray-100 pt-6 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Profile views</span>
            <span className="text-gray-900 font-semibold">142</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Post impressions</span>
            <span className="text-gray-900 font-semibold">891</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Total Escrowed</span>
            <span className="text-[#0066CC] font-semibold">${totalEarnings.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="mt-8">
          <button className="w-full py-3 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-sm font-semibold rounded-2xl text-gray-900 transition-colors tracking-tight">
            View full reputation
          </button>
        </div>
      </div>
    </div>
  );
}
