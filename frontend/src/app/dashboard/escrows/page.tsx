'use client';
import EscrowDashboard from '../../../components/EscrowDashboard';

export default function EscrowsPage() {
  return (
    <>
      <div className="bg-white rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">My Escrows</h1>
        <p className="text-gray-500 font-medium tracking-tight">
          Manage your active milestones and submit deliverables.
        </p>
      </div>
      
      <EscrowDashboard />
    </>
  );
}
