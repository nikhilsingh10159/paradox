'use client';
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useBlockchainAction } from '@/hooks/useBlockchainAction';
import { parseUnits } from 'ethers';

interface HireModalProps {
  onClose: () => void;
}

export default function HireModal({ onClose }: HireModalProps) {
  const { createJob } = useAppContext();
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [tranches, setTranches] = useState<{ amount: number | ''; requirements: string }[]>([
    { amount: '', requirements: '' }
  ]);
  
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handleAddMilestone = () => {
    setTranches([...tranches, { amount: '', requirements: '' }]);
  };

  const handleRemoveMilestone = (index: number) => {
    setTranches(tranches.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: 'amount' | 'requirements', value: string | number) => {
    const updated = [...tranches];
    if (field === 'amount') {
      updated[index].amount = value === '' ? '' : Number(value);
    } else {
      updated[index].requirements = value as string;
    }
    setTranches(updated);
  };

  const { execute, isDemo } = useBlockchainAction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address || tranches.some(t => !t.amount || !t.requirements)) return;
    
    setStatus('processing');
    
    const amounts = tranches.map(t => parseUnits(t.amount.toString(), 6));
    const reqs = tranches.map(t => t.requirements);
    
    await execute(
      'createJob',
      'Create Job',
      async () => {
        // Local state update
        createJob({
          title: title.trim(),
          description: "New job created on-chain",
          requiredSkills: [],
          freelancerAddress: address,
          tranches: tranches.map(t => ({ amount: Number(t.amount), requirements: t.requirements }))
        });
        setStatus('success');
        setTimeout(() => onClose(), 2000);
      },
      async (contract) => {
        // Real contract call
        return await contract.createJob(address, amounts, reqs);
      }
    );
    
    if (status === 'processing') {
       setStatus('idle'); // If it failed, reset
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-100 p-8 rounded-[32px] max-w-2xl w-full relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} disabled={status === 'processing'} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F7] text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50">✕</button>
        
        <h3 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6">Create New Job</h3>

        {status === 'success' ? (
          <div className="py-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h4 className="text-2xl font-semibold text-gray-900 mb-2">Job Created Successfully!</h4>
            <p className="text-gray-500 font-medium">The funds have been secured in escrow.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium tracking-tight text-gray-700 mb-2">Project Title</label>
              <input 
                required 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                disabled={status === 'processing'}
                className="w-full bg-[#F5F5F7] border border-transparent rounded-2xl px-5 py-3 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all font-medium text-gray-900 disabled:opacity-60" 
                placeholder="DeFi Staking Contract Audit" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium tracking-tight text-gray-700 mb-2">Freelancer Address</label>
              <input 
                required 
                type="text" 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                disabled={status === 'processing'}
                className="w-full bg-[#F5F5F7] border border-transparent rounded-2xl px-5 py-3 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all font-medium text-gray-900 disabled:opacity-60" 
                placeholder="0x..." 
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium tracking-tight text-gray-700">Milestones / Tranches</label>
                <button type="button" onClick={handleAddMilestone} className="text-blue-600 text-sm font-semibold hover:text-blue-800">+ Add Milestone</button>
              </div>
              
              {tranches.map((tranche, index) => (
                <div key={index} className="p-5 border border-gray-200 rounded-2xl bg-gray-50 space-y-4 relative">
                  <div className="flex justify-between items-center">
                    <h5 className="font-semibold text-gray-800 text-sm">Milestone {index + 1}</h5>
                    {tranches.length > 1 && (
                      <button type="button" onClick={() => handleRemoveMilestone(index)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Amount (USDC)</label>
                    <input 
                      required 
                      type="number" 
                      min="1" 
                      value={tranche.amount} 
                      onChange={e => handleChange(index, 'amount', e.target.value)} 
                      disabled={status === 'processing'}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-900" 
                      placeholder="e.g. 500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Requirements</label>
                    <textarea 
                      required 
                      value={tranche.requirements} 
                      onChange={e => handleChange(index, 'requirements', e.target.value)} 
                      disabled={status === 'processing'}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-900 h-20 resize-none" 
                      placeholder="Describe what needs to be delivered..."
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total Project Cost</span>
              <span className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString()} USDC</span>
            </div>

            <button 
              type="submit" 
              disabled={status === 'processing'}
              className="w-full py-4 bg-black hover:bg-gray-800 text-white rounded-2xl font-medium tracking-tight transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'processing' && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              {status === 'processing' ? 'Processing...' : 'Create Job & Lock Funds'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
