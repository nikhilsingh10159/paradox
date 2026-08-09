'use client';

import React from 'react';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  accentColor?: string;
}

export default function StatsCard({ icon, label, value, subtext, trend, accentColor = 'text-blue-500' }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-[20px] p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:scale-[1.02] transition-transform duration-200 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-700 ${accentColor}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
            {trend === 'up' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            )}
            {trend === 'down' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            )}
            {trend === 'neutral' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>
            )}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</h3>
        <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</div>
        {subtext && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{subtext}</p>
        )}
      </div>
    </div>
  );
}
