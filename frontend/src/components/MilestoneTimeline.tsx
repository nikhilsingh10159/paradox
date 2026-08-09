'use client';

import React from 'react';
import { Tranche } from '@/context/AppContext';

interface MilestoneTimelineProps {
  tranches: Tranche[];
  onTrancheClick?: (tranche: Tranche) => void;
}

export default function MilestoneTimeline({ tranches, onTrancheClick }: MilestoneTimelineProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Funded':
        return { border: 'border-blue-500', fill: 'bg-blue-50', icon: null };
      case 'Submitted':
        return { border: 'border-purple-500', fill: 'bg-purple-50', icon: null };
      case 'Under AI Review':
        return { border: 'border-purple-500', fill: 'bg-white', icon: null, ring: true };
      case 'Released':
        return { 
          border: 'border-green-500', 
          fill: 'bg-green-500', 
          icon: <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> 
        };
      case 'Disputed':
        return { 
          border: 'border-red-500', 
          fill: 'bg-red-50', 
          icon: <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 
        };
      case 'Pending':
      default:
        return { border: 'border-gray-300', fill: 'bg-gray-100', icon: null };
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0 md:space-x-4">
      {tranches.map((tranche, index) => {
        const styles = getStatusStyles(tranche.status);
        const { border, fill, icon } = styles;
        const ring = 'ring' in styles ? styles.ring : false;
        const isCompleted = ['Released'].includes(tranche.status);
        
        return (
          <div key={tranche.id} className="relative flex flex-col items-center flex-1 w-full md:w-auto">
            {/* Connecting line */}
            {index < tranches.length - 1 && (
              <div className="hidden md:block absolute top-6 left-[50%] w-full h-[2px] z-0">
                <div className={`w-full h-full ${isCompleted ? 'bg-green-500' : 'border-t-2 border-dashed border-gray-300'}`}></div>
              </div>
            )}
            
            {/* Mobile connecting line */}
            {index < tranches.length - 1 && (
              <div className="block md:hidden absolute top-12 left-1/2 w-[2px] h-full z-0 transform -translate-x-1/2">
                <div className={`w-full h-full ${isCompleted ? 'bg-green-500' : 'border-l-2 border-dashed border-gray-300'}`}></div>
              </div>
            )}

            {/* Node */}
            <div 
              className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 ${border} ${fill} ${onTrancheClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
              onClick={() => onTrancheClick && onTrancheClick(tranche)}
            >
              {ring && (
                <div className="absolute inset-0 rounded-full border-4 border-purple-500 animate-pulse-ring"></div>
              )}
              {icon}
            </div>

            {/* Labels */}
            <div className="mt-4 text-center z-10 bg-background px-2">
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                M{index + 1}
              </p>
              <p className="font-bold text-gray-900 dark:text-gray-100">
                ${tranche.amount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatStatus(tranche.status)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
