import React, { useState } from 'react';
import { useAppContext, EscrowStatus } from '@/context/AppContext';

export default function EscrowDashboard() {
  const { escrows, updateEscrowStatus, createEscrow } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [newFreelancer, setNewFreelancer] = useState("");
  const [newAmount, setNewAmount] = useState(0);
  const [newDesc, setNewDesc] = useState("");
  const [deliverables, setDeliverables] = useState<{[key:string]: string}>({});

  const handleFund = (e: React.FormEvent) => {
    e.preventDefault();
    if(newFreelancer && newAmount > 0 && newDesc) {
      createEscrow(newFreelancer, newAmount, newDesc);
      setShowModal(false);
      setNewFreelancer("");
      setNewAmount(0);
      setNewDesc("");
    }
  };

  const handleDeliverableChange = (id: string, val: string) => {
    setDeliverables(prev => ({...prev, [id]: val}));
  };

  const handleSubmit = (id: string) => {
    updateEscrowStatus(id, "Under AI Review", { deliverableLink: deliverables[id] });
  };
  const handleDispute = (id: string) => {
    updateEscrowStatus(id, "Disputed");
  };
  const handleRelease = (id: string) => {
    updateEscrowStatus(id, "Released");
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
                <p className="text-3xl font-semibold tracking-tight text-gray-900">${escrow.amount.toLocaleString()} <span className="text-gray-500 text-lg font-medium">USDC</span></p>
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
                  <button onClick={() => handleRelease(escrow.id)} className="flex-1 px-6 py-4 bg-black hover:bg-gray-800 text-white rounded-2xl font-medium tracking-tight transition-colors">
                    Approve & Release Funds
                  </button>
                  <button onClick={() => handleDispute(escrow.id)} className="flex-1 px-6 py-4 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#C5221F] rounded-2xl font-medium tracking-tight transition-colors">
                    Raise Dispute
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-100 p-10 rounded-[32px] max-w-md w-full relative shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F7] text-gray-500 hover:text-gray-900 transition-colors">✕</button>
            <h3 className="text-2xl font-semibold tracking-tight text-gray-900 mb-8">New Milestone</h3>
            <form onSubmit={handleFund} className="space-y-6">
              <div>
                <label className="block text-sm font-medium tracking-tight text-gray-700 mb-2">Freelancer Address</label>
                <input required type="text" value={newFreelancer} onChange={e => setNewFreelancer(e.target.value)} className="w-full bg-[#F5F5F7] border border-transparent rounded-2xl px-5 py-3 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all font-medium text-gray-900" placeholder="0x..." />
              </div>
              <div>
                <label className="block text-sm font-medium tracking-tight text-gray-700 mb-2">Amount (USDC)</label>
                <input required type="number" min="1" value={newAmount || ""} onChange={e => setNewAmount(Number(e.target.value))} className="w-full bg-[#F5F5F7] border border-transparent rounded-2xl px-5 py-3 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all font-medium text-gray-900" placeholder="1000" />
              </div>
              <div>
                <label className="block text-sm font-medium tracking-tight text-gray-700 mb-2">Requirements Description</label>
                <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-[#F5F5F7] border border-transparent rounded-2xl px-5 py-3 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all font-medium text-gray-900 h-28 resize-none" placeholder="Build a landing page..."></textarea>
              </div>
              <button type="submit" className="w-full py-4 bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-2xl font-medium tracking-tight transition-colors mt-2">
                Fund Escrow
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
