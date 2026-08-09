'use client';
import React, { useState } from 'react';
import { useAppContext, EscrowStatus } from '@/context/AppContext';
import HireModal from './HireModal';
import { useWallets } from '@privy-io/react-auth';
import { BrowserProvider, Contract } from 'ethers';
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from '@/config/contracts';

export default function EscrowDashboard() {
  const { escrows, updateEscrowStatus } = useAppContext();
  const { wallets } = useWallets();
  const [showModal, setShowModal] = useState(false);
  const [deliverables, setDeliverables] = useState<{[key:string]: string}>({});
  
  // Track loading state for each escrow ID
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleDeliverableChange = (id: string, val: string) => {
    setDeliverables(prev => ({...prev, [id]: val}));
  };

  const handleSubmit = (id: string) => {
    updateEscrowStatus(id, "Under AI Review", { deliverableLink: deliverables[id] });
  };

  const executeEscrowAction = async (id: string, actionName: 'release' | 'refund') => {
    if (!wallets.length) {
      alert("Please connect a wallet first.");
      return;
    }

    try {
      setLoadingAction(`${id}-${actionName}`);
      
      const wallet = wallets[0];
      const provider = await wallet.getEthereumProvider();
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      const escrowContract = new Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);

      if (actionName === 'release') {
        const tx = await escrowContract.releaseToFreelancer(id);
        await tx.wait();
        updateEscrowStatus(id, "Released");
      } else if (actionName === 'refund') {
        const tx = await escrowContract.refundClient(id);
        await tx.wait();
        updateEscrowStatus(id, "Disputed"); // Using Disputed as a fallback for refunded state visually
      }
      
    } catch (error: any) {
      console.error(error);
      alert(error?.reason || error?.message || "Transaction failed or was rejected.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Active Escrows</h2>
        <button onClick={() => setShowModal(true)} className="bg-black hover:bg-gray-800 text-white text-sm font-medium tracking-tight py-2 px-5 rounded-full transition-colors">
          + New Milestone
        </button>
      </div>

      {escrows.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-12 font-medium">No active milestones.</p>
      ) : (
        escrows.map(escrow => (
          <div key={escrow.id} className="p-8 bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 tracking-tight text-gray-900">
              Milestone #{escrow.id}
            </h2>
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 p-6 bg-[#F5F5F7] rounded-2xl gap-6">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Escrow Amount</p>
                <p className="text-3xl font-semibold tracking-tight text-gray-900">${escrow.amount.toLocaleString()} <span className="text-gray-500 text-lg font-medium">Platform Coins</span></p>
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">Status</p>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold tracking-tight ${
                  escrow.status === 'Funded' ? 'bg-[#E8F0FE] text-[#1967D2]' : 
                  escrow.status === 'Under AI Review' ? 'bg-[#F3E8FF] text-[#7E22CE]' : 
                  escrow.status === 'Disputed' ? 'bg-[#FCE8E8] text-[#C5221F]' : 
                  'bg-[#E6F4EA] text-[#137333]'
                }`}>
                  {escrow.status}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-gray-900 font-medium tracking-tight mb-2">Requirements</p>
              <p className="text-gray-500 tracking-tight leading-relaxed">{escrow.description}</p>
            </div>

            <div className="space-y-4">
              {escrow.status === "Funded" && (
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="GitHub PR or Figma URL..." 
                    value={deliverables[escrow.id] || ""}
                    onChange={e => handleDeliverableChange(escrow.id, e.target.value)}
                    className="flex-1 bg-[#F5F5F7] border border-transparent rounded-2xl px-5 py-3 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all text-gray-900 font-medium placeholder-gray-400"
                  />
                  <button onClick={() => handleSubmit(escrow.id)} className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-2xl font-medium tracking-tight transition-colors">
                    Submit Deliverable
                  </button>
                </div>
              )}

              {escrow.status === "Under AI Review" && (
                <div className="flex gap-4 pt-6 border-t border-gray-100">
                  <button 
                    onClick={() => executeEscrowAction(escrow.id, 'release')} 
                    disabled={loadingAction === `${escrow.id}-release` || loadingAction === `${escrow.id}-refund`}
                    className="flex-1 px-6 py-4 bg-black hover:bg-gray-800 text-white rounded-2xl font-medium tracking-tight transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {loadingAction === `${escrow.id}-release` && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                    Approve & Release Coins
                  </button>
                  <button 
                    onClick={() => executeEscrowAction(escrow.id, 'refund')} 
                    disabled={loadingAction === `${escrow.id}-release` || loadingAction === `${escrow.id}-refund`}
                    className="flex-1 px-6 py-4 bg-[#FCE8E8] hover:bg-[#F9D2D2] text-[#C5221F] rounded-2xl font-medium tracking-tight transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {loadingAction === `${escrow.id}-refund` && <div className="w-4 h-4 border-2 border-red-500/30 border-t-[#C5221F] rounded-full animate-spin"></div>}
                    Request Refund
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {showModal && <HireModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
