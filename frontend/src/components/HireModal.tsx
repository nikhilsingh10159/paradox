'use client';
import React, { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { BrowserProvider, Contract, parseUnits } from 'ethers';
import { TOKEN_CONTRACT_ADDRESS, ESCROW_CONTRACT_ADDRESS, TOKEN_ABI, ESCROW_ABI } from '@/config/contracts';
import { useAppContext } from '@/context/AppContext';

interface HireModalProps {
  onClose: () => void;
  freelancerAddress?: string;
  freelancerHandle?: string;
}

export default function HireModal({ onClose, freelancerAddress = '', freelancerHandle = '' }: HireModalProps) {
  const { createEscrow } = useAppContext();
  const { wallets } = useWallets();
  const [address, setAddress] = useState(freelancerAddress);
  const [amount, setAmount] = useState<number | ''>('');
  const [desc, setDesc] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'approving' | 'locking' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !amount || !desc) return;
    
    if (!wallets.length) {
      setErrorMessage("Please connect a wallet first.");
      setStatus('error');
      return;
    }

    try {
      setStatus('approving');
      setErrorMessage('');
      
      const wallet = wallets[0];
      const provider = await wallet.getEthereumProvider();
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);
      const escrowContract = new Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);

      const parsedAmount = parseUnits(amount.toString(), 18);

      // 1. Approve Token
      const approveTx = await tokenContract.approve(ESCROW_CONTRACT_ADDRESS, parsedAmount);
      await approveTx.wait();

      // 2. Lock in Escrow
      setStatus('locking');
      const createTx = await escrowContract.createAgreement(address, parsedAmount);
      await createTx.wait();

      // Update local context to reflect the new escrow immediately
      createEscrow(address, Number(amount), desc);

      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      // Format ethers error gracefully if possible
      setErrorMessage(error?.reason || error?.message || "Transaction failed or was rejected.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-100 p-10 rounded-[32px] max-w-md w-full relative shadow-2xl">
        <button onClick={onClose} disabled={status === 'approving' || status === 'locking'} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F7] text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50">✕</button>
        
        <h3 className="text-2xl font-semibold tracking-tight text-gray-900 mb-2">New Milestone</h3>
        {freelancerHandle && <p className="text-sm font-medium text-gray-500 mb-6">Hiring @{freelancerHandle}</p>}
        {!freelancerHandle && <div className="mb-6"></div>}

        {status === 'success' ? (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Funds Locked Securely!</h4>
            <p className="text-gray-500 font-medium">The milestone has been created on-chain.</p>
          </div>
        ) : (
          <form onSubmit={handleFund} className="space-y-6">
            <div>
              <label className="block text-sm font-medium tracking-tight text-gray-700 mb-2">Freelancer Address</label>
              <input 
                required 
                type="text" 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                disabled={!!freelancerAddress || status === 'approving' || status === 'locking'}
                className="w-full bg-[#F5F5F7] border border-transparent rounded-2xl px-5 py-3 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all font-medium text-gray-900 disabled:opacity-60" 
                placeholder="0x..." 
              />
            </div>
            <div>
              <label className="block text-sm font-medium tracking-tight text-gray-700 mb-2">Amount (Platform Coins)</label>
              <input 
                required 
                type="number" 
                min="1" 
                value={amount} 
                onChange={e => setAmount(Number(e.target.value))} 
                disabled={status === 'approving' || status === 'locking'}
                className="w-full bg-[#F5F5F7] border border-transparent rounded-2xl px-5 py-3 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all font-medium text-gray-900 disabled:opacity-60" 
                placeholder="1000" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium tracking-tight text-gray-700 mb-2">Requirements Description</label>
              <textarea 
                required 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
                disabled={status === 'approving' || status === 'locking'}
                className="w-full bg-[#F5F5F7] border border-transparent rounded-2xl px-5 py-3 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all font-medium text-gray-900 h-28 resize-none disabled:opacity-60" 
                placeholder="Build a landing page..."
              ></textarea>
            </div>
            
            {status === 'error' && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                {errorMessage}
              </div>
            )}

            <button 
              type="submit" 
              disabled={status === 'approving' || status === 'locking'}
              className="w-full py-4 bg-black hover:bg-gray-800 text-white rounded-2xl font-medium tracking-tight transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'approving' && (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Approving Tokens...</>
              )}
              {status === 'locking' && (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Locking Funds...</>
              )}
              {status === 'idle' || status === 'error' ? 'Fund Escrow' : null}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
